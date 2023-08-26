import chalk from "chalk";
import ora from 'ora';
import SummaryManager from "../resources/SummaryManager";
import {IMenuConfig} from "../prompts/menu";
import figureSet from "figures";
import {menu_assets} from "./menu_assets";

export const menu_watch: IMenuConfig = {
    title: "Watch",
    async custom() {
        console.log(chalk.cyan.bold(figureSet.info), "To use watch mode, run", chalk.yellow("mcrs watch"), "in another terminal session!")
    }
}

export const menu_settings: IMenuConfig = {
    title: "Settings",
    options: [
        {
            title: "Re-Download Summary Data",
            custom: async () => {
                const spinner = ora("Downloading resource pack data...")
                spinner.start()
                await SummaryManager.download()
                spinner.succeed()
            }
        }
    ]
}

export const menu_start: IMenuConfig = {
    title: "Main Menu",
    options: [
        menu_assets,
        menu_watch,
        menu_settings
    ]
}
