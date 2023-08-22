import {
    AsyncPromptConfig,
    createPrompt, isDownKey,
    isEnterKey, isUpKey, isBackspaceKey,
    Separator,
    useKeypress,
    usePagination, usePrefix,
    useState, isSpaceKey
} from "@inquirer/prompts";
import chalk from "chalk";
import figureSet from "figures"
import {isAscii} from "buffer";

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


function isSelectableChoice(choice: ISearchListChoice | Separator) {
    return (!Separator.isSeparator(choice)) && choice != null
}

/**
 * Returns chosen choice
 */
export const SearchList = createPrompt<ISearchListChoice, ISearchListOptions>((config, done) => {

    const [cursorPosition, setCursorPos] = useState(0)
    const [isComplete, setComplete] = useState(false)
    const [query, setQuery] = useState("")
    const prefix = usePrefix()

    const choice = config.choices[cursorPosition] as ISearchListChoice

    useKeypress(key => {
        if (isEnterKey(key)) {
            setComplete(true)
            done(choice)
        } else if (isUpKey(key) || isDownKey(key)) {
            const direction = isUpKey(key) ? -1 : 1;
            let newCursorPos = cursorPosition + direction;
            for (let i = 0; i < config.choices.length; i++) {
                if (isSelectableChoice(config.choices[newCursorPos])) break;
                newCursorPos += direction
                if (newCursorPos < 0) newCursorPos = config.choices.length -1
                if (newCursorPos > config.choices.length - 1) newCursorPos = 0
            }
            setCursorPos(newCursorPos)
        } else if (isBackspaceKey(key)) {
            setQuery(query.substring(0, query.length - 1))
        } else if (isSpaceKey(key)) {
            setQuery(query + " ")
        } else {
            setQuery(query + key.name)
        }
    })


    const allChoices = config.choices.map((choice, index) => {
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
        pageSize: 5
    })

    const queryText = query.length < 1 ? chalk.dim("[Type to search] (Use arrow keys to select)") : chalk.cyan(query)

    return `${prefix} ${chalk.bold(config.message)}${chalk.greenBright(":")} ${queryText}\n${windowedChoices}`
})
