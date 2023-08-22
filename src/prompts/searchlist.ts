import {
    AsyncPromptConfig,
    createPrompt, isDownKey,
    isEnterKey, isUpKey,
    Separator,
    useKeypress,
    usePagination,
    useState
} from "@inquirer/prompts";

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
                if (newCursorPos < 0) newCursorPos = config.choices.length
                if (newCursorPos > config.choices.length - 1) newCursorPos = 0
            }
            setCursorPos(newCursorPos)
        }
    })


    const allChoices = config.choices.map((choice, index) => {
        if (Separator.isSeparator(choice)) {
            return ` ${choice.separator}`;
        }
        const line = choice.text ?? choice.id

        return `- ${line}`
    }).join("\n")
    const windowedChoices = usePagination(allChoices, {
        active: cursorPosition,
        pageSize: 5
    })

    return windowedChoices
})
