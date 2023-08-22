import chalk from "chalk";
import ora from 'ora';
import SummaryManager from "../resources/SummaryManager";
import {ask_new_item} from "./new_item";
import {ask_new_block} from "./new_block";
import {ask_new_texture} from "./new_texture";
import {ask_new_shader} from "./new_shader";
import {select} from "@inquirer/prompts";



async function settings_menu() {
    const answer = (await select({
        message: "Settings",
        choices: [
            {name: "Download Summary", value: "dlsum"},
            {name: "See summary", value: "seesum"},
            {name: "Back", value: "back"},
        ]
    }))

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

async function add_menu() {
    const answer = await select(
        {
            message: "Main Menu",
            choices: [
                {name: "Add Item", value: "new_item"},
                {name: "Add Block", value: "new_block"},
                {name: "Add Texture", value: "new_texture"},
                {name: "Add Shader", value: "new_shader"},
                {name: "Back", value: "back"},
            ]
        }
    )
    switch (answer) {
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
        case "back":
            return
    }
}

export async function start_menu() {
    let run = true

    while (run) {
        const answers = await select(
            {
                message: "Main Menu",
                choices: [
                    {name: "Add", value: "add"},
                    {name: "Watch & Sync", value: "watch"},
                    {name: "Settings", value: "settings"},
                    {name: "Exit (Ctrl+C)", value: "exit"},
                ]
            }
        )

        switch (answers) {
            case "add":
                await add_menu()
                break;
            case "watch":
                console.log(chalk.cyan.bold("i"),
                    "To use watch mode, run",
                    chalk.yellow("mcrs watch"),"in another terminal session!")
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

