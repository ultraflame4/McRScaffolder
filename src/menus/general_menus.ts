import inquirer from "inquirer";
import chalk from "chalk";
import ora from 'ora';
import {DownloadResourcePackSummary} from "../tools";


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
    await DownloadResourcePackSummary()
    spinner.stop()
    console.log(chalk.greenBright("Downloaded resource pack summary data!"))
}

export async function start_menu() {
    let run = true
    while (run) {
        const answers = await inquirer.prompt(
            {
                name: "Main Menu",
                type: "list",
                choices: [
                    {name: "New Item", value: "new"},
                    {name: "Settings", value: "settings"},
                    {name: "Exit (Ctrl+C)", value: "exit"},
                ]
            }
        )

        switch (answers["Main Menu"]) {
            case "new":
                break;
            case "settings":
                await settings_menu()
                break;
            case "exit":
                run = false
                break;
        }

    }
}

