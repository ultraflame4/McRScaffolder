import {select} from "@inquirer/prompts";


export interface IMenuConfig {
    /**
     * The title of the menu. Defaults to undefined
     */
    title?: string,
    /**
     * Various submenus
     */
    options?: IMenuConfig[]
    /**
     * When defined, this, options will be ignored. Instead, the menu will call the callback
     *
     * When the promise returns true, the callback is called again.
     */
    custom?: () => Promise<boolean | void>
}

interface IMenuStackItem {
    /**
     * The index of the option for this menu in the parent menu
     */
    option_index: number,
    /**
     * Config for this menu
     */
    config: IMenuConfig
}

class MenuManager_ {

    public async show(menu_config: IMenuConfig) {
        let run = true
        let menu_history: IMenuStackItem[] = [{config: menu_config, option_index: 0}]


        while (run) {

            const current_menu = menu_history[menu_history.length - 1]

            if (current_menu.config.custom) {
                let result = await current_menu.config.custom()
                if (!result) {
                    menu_history.pop()
                }
                continue
            }


            const isRoot = menu_history.length == 1
            const history_text = menu_history.map(x => x.config.title).join(" > ")

            if (!current_menu.config.options) current_menu.config.options = []


            const nextMenu = await select({
                message: history_text,
                choices: [
                    ...current_menu.config.options.map((x, index) => {
                        return {
                            name: x.title ?? "undefined",
                            value: index
                        }
                    }),
                    {name: isRoot ? "Exit" : "Back", value: -1}
                ]
            })
            process.stdout.moveCursor(0, -1)
            process.stdout.clearLine(1)

            if (nextMenu > -1) {
                menu_history.push({
                    config: current_menu.config.options[nextMenu],
                    option_index: nextMenu
                })
                continue
            }
            menu_history.pop()
            if (menu_history.length == 0) run = false;
        }
    }
}

export const MenuManager = new MenuManager_()