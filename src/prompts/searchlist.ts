import {
    AsyncPromptConfig,
    createPrompt, isDownKey,
    isEnterKey, isUpKey, isBackspaceKey,
    Separator,
    useKeypress,
    usePagination, usePrefix,
    useState, isSpaceKey, useEffect
} from "@inquirer/prompts";
import chalk from "chalk";
import figureSet from "figures"
import Fuse from "fuse.js"

/**
 * A choice in the search list
 */
export interface ISearchListChoice extends Record<string, any> {
    /**
     * Unique id for this choice
     */
    id: string,
    /**
     * Text to display for this choice
     */
    text?: string,
    /**
     * Optional data to add to this choice
     */
    data?: object,
}

export interface ISearchListOptions extends AsyncPromptConfig {

    /**
     * Array of choices for the user to select from
     */
    choices: Array<ISearchListChoice | Separator>
    /**
     * The index of the default choice
     */
    default?: number;
    /**
     * When true, allows canceling. Will return null on cancel
     */
    allowCancel?: boolean
}

type SearchListItem = ISearchListChoice | Separator

function isSelectableChoice(choice: SearchListItem) {
    return (!Separator.isSeparator(choice)) && choice != null
}


function fuzzySearch(query: string, choices: Array<SearchListItem>): SearchListItem[] {
    if (query.length == 0) return choices

    const fuse = new Fuse<SearchListItem>(choices, {
        isCaseSensitive: false,
        shouldSort: true,
        keys: [{
            name: "text",
            getFn(x) {
                if (x instanceof Separator) return "----separator----"
                return x.text ?? x.id
            }
        }, {
            name: "id",
            getFn(x) {
                if (x instanceof Separator) return "----separator----"
                return x.id
            }
        }]
    })
    const results = fuse.search(`${query}`)

    return results.map(x => x.item)
}

const cancelChoiceId = "Cancel or Exits this selection ( :quit | : q)"
/**
 * This displays a list, similar to select list,
 * However this includes a search bar ath the bottom.
 *
 * Returns null if user cancels
 */
export const SearchList = createPrompt<ISearchListChoice, ISearchListOptions>((config, done) => {

    const [cursorPosition, setCursorPos] = useState(config.default ?? 0)
    const [isComplete, setComplete] = useState(false)
    const [query, setQuery] = useState("")
    const prefix = usePrefix()

    const filteredChoices = fuzzySearch(query, config.choices)
    if (config.allowCancel) {
        filteredChoices.push({text:"Quit", id:cancelChoiceId})
    }
    const choice = filteredChoices[cursorPosition] as ISearchListChoice;

    if (isComplete) {
        return `${prefix} ${chalk.bold(config.message)}${chalk.greenBright(":")}` + chalk.cyan(choice.text) + " " + chalk.dim(`(id: ${choice.id})`)
    }

    useKeypress((key, rl) => {
        if (isComplete) return;

        if (isEnterKey(key)) {
            if (choice == null) return;

            setComplete(true)
            if (choice.id == cancelChoiceId) {
                done(null)
                return;
            }
            done(choice)
        } else if (isUpKey(key) || isDownKey(key)) {
            const direction = isUpKey(key) ? -1 : 1;
            let newCursorPos = cursorPosition + direction;
            for (let i = 0; i < filteredChoices.length; i++) {
                if (isSelectableChoice(filteredChoices[newCursorPos])) break;
                newCursorPos += direction
                if (newCursorPos < 0) newCursorPos = filteredChoices.length - 1
                if (newCursorPos > filteredChoices.length - 1) newCursorPos = 0
            }
            setCursorPos(newCursorPos)
        } else {
            setQuery(rl.line)
        }
    });


    const allChoices = filteredChoices.map((choice, index) => {
        if (Separator.isSeparator(choice)) {
            return ` ${choice.separator}`;
        }

        const lineId = chalk.italic(` ${choice.id}`)
        const lineTxt = choice.text ?? choice.id
        if (index == cursorPosition) {
            return chalk.cyanBright(figureSet.pointer) + " " + chalk.greenBright(chalk.bold(lineTxt)) + chalk.dim(lineId)
        }
        return chalk.dim(`${figureSet.dot} ${lineTxt}`);
    }).join("\n")
    const windowedChoices = usePagination(allChoices, {
        active: cursorPosition,
        pageSize: 5
    })

    const helpText = chalk.dim("(Press <enter> to submit, Use arrow keys to select)")
    const placeholder = "Type to search" + (config.allowCancel ? " / Type :quit to exit" : "")
    const queryText = "Search: " + (query.length < 1 ? chalk.italic.dim(placeholder) : `${query}`)
    return `${prefix} ${chalk.bold(config.message)} ${helpText}\n${windowedChoices}\n${queryText}`
})
