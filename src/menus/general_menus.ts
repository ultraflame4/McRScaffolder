import inquirer from "inquirer";
import chalk from "chalk";
import ora from 'ora';
import SummaryManager from "../resources/SummaryManager";
import {ask_new_item} from "./new_item";
import {ask_new_block} from "./new_block";
import {ask_new_texture} from "./new_texture";
import {ask_new_shader} from "./new_shader";



async function settings_menu() {
    const answer = (await inquirer.prompt({
        name: "Settings",
        type: "list",
        choices: [
            {name: "Download Summary", value: "dlsum"},
            {name: "See summary", value: "seesum"},
            {name: "Back", value: "back"},
        ]
    }))["Settings"]

    if (answer === "back") {
        return
    }
    else if (answer === "seesum") {

        return
    }

    const spinner = ora("Download resource pack data...")
    spinner.start()
    await SummaryManager.download()
    spinner.succeed()

}

export async function start_menu() {
    let run = true

    while (run) {
        const answers = await inquirer.prompt(
            {
                name: "Main Menu",
                type: "list",
                choices: [
                    {name: "New Item", value: "new_item"},
                    {name: "New Block", value: "new_block"},
                    {name: "New Texture", value: "new_texture"},
                    {name: "New Shader", value: "new_shader"},
                    {name: "Settings", value: "settings"},
                    {name: "Exit (Ctrl+C)", value: "exit"},
                ]
            }
        )

        switch (answers["Main Menu"]) {
            case "new_item":
                await ask_new_item()
                break;
            case "new_block":
                await ask_new_block()
                break;
            case "new_texture":
                await ask_new_texture()
                break;
            case "new_shader":
                await ask_new_shader()
                break;

            case "settings":
                await settings_menu()
                break;
            case "exit":
                run = false
                process.exit()
                break;
        }

    }
    return
}

