import chalk from "chalk";
import ora from 'ora';
import SummaryManager from "../resources/SummaryManager";
import {ask_new_item} from "./new_item";
import {ask_new_block} from "./new_block";
import {ask_new_texture} from "./new_texture";
import {ask_new_shader} from "./new_shader";
import {select} from "@inquirer/prompts";
import {menu_assets} from "./edit_menu";
import {IMenuConfig} from "../prompts/menu";
import figureSet from "figures";

//
// async function menu_add() {
//     const answer = await select(
//         {
//             message: "Main Menu - New Asset",
//             choices: [
//                 {name: "Add Item", value: "new_item"},
//                 {name: "Add Block", value: "new_block"},
//                 {name: "Add Texture", value: "new_texture"},
//                 {name: "Add Shader", value: "new_shader"},
//                 {name: "Back", value: "back"},
//             ]
//         }
//     )
//     switch (answer) {
//         case "new_item":
//             await ask_new_item()
//             break;
//         case "new_block":
//             await ask_new_block()
//             break;
//         case "new_texture":
//             await ask_new_texture()
//             break;
//         case "new_shader":
//             await ask_new_shader()
//             break;
//         case "back":
//             return
//     }
// }


export const menu_new_asset: IMenuConfig = {
    title: "New Asset",
    options: [
        {title: "Add Item"},
        {title: "Add Block"},
        {title: "Add Texture"},
        {title: "Add Shader"},
    ]
}

export const menu_existing_asset: IMenuConfig = {
    title: "Existing Asset",

}

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
        menu_new_asset,
        menu_existing_asset,
        menu_watch,
        menu_settings
    ]
}
