import {select, Separator} from "@inquirer/prompts";

export type menuPromptCallback = (current_menu: IMenuStackItem, history_text: string, isRoot: boolean) => Promise<IMenuStackItem | null | boolean>
export interface IMenuConfig {
    /**
     * The title of the menu. Defaults to undefined
     */
    title: string,
    /**
     * Various submenus.
     */
    options?: IMenuConfig[] | ( () => Promise<IMenuConfig[]>)
    /**
     * Custom menu prompt to show. Useful for using other prompts and stuff
     *
     * When defined, this, options will be ignored. Instead, the menu will call the callback
     *
     * When the promise returns true, the callback is called again.
     * When returning another IMenuStackItem object, the new object becomes a sub menu, it adds to the history. Please note that this menu will be called again when going back from sub menu
     */
    custom?: menuPromptCallback
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


    private async promptMenu(current_menu: IMenuStackItem, history_text: string, isRoot: boolean): Promise<IMenuStackItem | null> {
        let current_menu_options: IMenuConfig[] = []

        if (current_menu.config.options instanceof Function){
            current_menu_options = await current_menu.config.options()
        }
        else if (Array.isArray(current_menu.config.options)){
            current_menu_options = current_menu.config.options
        }


        const nextMenuIndex = await select({
            message: history_text,
            choices: [
                ...current_menu_options.map((x, index) => {
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

        if (nextMenuIndex == -1) {
            return null
        }

        return {
            config: current_menu_options[nextMenuIndex],
            option_index: nextMenuIndex
        };
    }

    public async show(menu_config: IMenuConfig) {
        let run = true
        let menu_history: IMenuStackItem[] = [{config: menu_config, option_index: 0}]


        while (run) {

            const current_menu = menu_history[menu_history.length - 1]



            const isRoot = menu_history.length == 1
            const history_text = menu_history.map(x => x.config.title).join(" > ")


            const nextMenu = current_menu.config.custom ?
                await current_menu.config.custom(current_menu,history_text,isRoot) :
                await this.promptMenu(current_menu,history_text,isRoot)

            if (typeof nextMenu === "object") {
                menu_history.push(nextMenu)
                continue
            }

            if (nextMenu === true) {
                continue
            }

            menu_history.pop()
            if (menu_history.length == 0) run = false;
        }
    }
}

export const MenuManager = new MenuManager_()