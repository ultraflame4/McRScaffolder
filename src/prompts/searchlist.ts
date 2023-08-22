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
    data?: object
}

export interface ISearchListOptions extends AsyncPromptConfig {
    name: string
    /**
     * Array of choices for the user to select from
     */
    choices: Array<ISearchListChoice | Separator>
}
type SearchListItem = ISearchListChoice | Separator

function isSelectableChoice(choice: SearchListItem) {
    return (!Separator.isSeparator(choice)) && choice != null
}


function fuzzySearch(query: string, choices: Array<SearchListItem>): SearchListItem[] {
    if (query.length == 0) return  choices

    const fuse = new Fuse<SearchListItem>(choices, {
        isCaseSensitive: false,
        keys: [{
            name: "text",
            getFn(x){
                if (x instanceof Separator) return "----separator----"
                return x.text??x.id
            }
        }]
    })
    const results = fuse.search(`${query}`)

    return results.map(x=>x.item)
}

/**
 * Returns chosen choice
 */
export const SearchList = createPrompt<ISearchListChoice, ISearchListOptions>((config, done) => {

    const [cursorPosition, setCursorPos] = useState(0)
    const [isComplete, setComplete] = useState(false)
    const [query, setQuery] = useState("")
    const prefix = usePrefix()

    const filteredChoices = fuzzySearch(query,config.choices)
    const choice = filteredChoices[cursorPosition] as ISearchListChoice;

    if (isComplete) {
        return `${prefix} ${chalk.bold(config.message)}${chalk.greenBright(":")}` + chalk.cyan(choice.text) + " " + chalk.dim(`(id: ${choice.id})`)
    }

    useKeypress((key, rl) => {
        if (isComplete) return;

        if (isEnterKey(key)) {
            if (choice == null) return;
            setComplete(true)
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
        }else {
            setQuery(rl.line)
        }
    });


    const allChoices = filteredChoices.map((choice, index) => {
        if (Separator.isSeparator(choice)) {
            return ` ${choice.separator}`;
        }
        const lineTxt = choice.text ?? choice.id
        if (index == cursorPosition) {
            return chalk.cyanBright(`${figureSet.pointer} ${lineTxt}`);
        }
        return chalk.dim(`- ${lineTxt}`);
    }).join("\n")
    const windowedChoices = usePagination(allChoices, {
        active: cursorPosition,
        pageSize: 4
    })

    const queryText = query.length < 1 ? chalk.dim("[Type to search] (Use arrow keys to select)") : chalk.cyan(query)

    return `${prefix} ${chalk.bold(config.message)}${chalk.greenBright(":")} ${queryText}\n${windowedChoices}\n${query}`
})
