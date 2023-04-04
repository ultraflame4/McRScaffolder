import {
    DownloadFile,
    DownloadResourcePackSummary,
    GetConfigPath,
    GetPackSummaryDownload,
    GetPackVersions,
    ScaffoldBasicComponents
} from "./tools";
import inquirer from "inquirer";
import chalk from "chalk";
import pkg from "../package.json";
import ora from 'ora';
import {McRSConfig, VersionSummary} from "./types";
import * as fs from "fs";
import path from "path";

/**
 * Asks the user for the target minecraft version and returns the download link for that version summary
 */
async function choose_version(): Promise<{ download: string, summary: VersionSummary }> {
    const spinner = ora("Getting versions...")
    spinner.start()
    let versions = await GetPackVersions()
    spinner.stop()
    let answers = await inquirer.prompt({
        name: "version",
        message: "Target Minecraft version",
        type: "rawlist",
        default: versions.findIndex(x => x.stable),
        choices: versions.map(x => {
            return {
                name: `${x.name}`,
                value: x
            }
        })
    })

    let downloadLink = GetPackSummaryDownload(answers["version"].id)
    console.log(
        chalk.green("Resolved download link to:"),
        chalk.underline.cyanBright(downloadLink)
    )
    return {
        download: downloadLink,
        summary: answers["version"]
    }
}


async function settings_menu(config: McRSConfig, project_root: string) {
    const answers = await inquirer.prompt({
        name: "Settings",
        type: "list",
        choices: [
            {name: "Download Summary", value: "dlsum"},
            {name: "Back", value: "back"},
        ]
    })

    if (answers["Settings"] === "back") {
        return
    }

    const spinner = ora("Download resource pack data...")
    spinner.start()
    await DownloadResourcePackSummary(project_root, config)
    spinner.stop()
    console.log(chalk.greenBright("Downloaded resource pack summary data!"))
}

export async function start_menu(config: McRSConfig, project_root: string) {
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
                await settings_menu(config, project_root)
                break;
            case "exit":
                run = false
                break;
        }

    }
}

export async function create_project_menu(project_root: string): Promise<McRSConfig> {
    const answers = await inquirer.prompt([
        {
            name: "name",
            message: "Project Name",
            type: "input"
        },
        {
            name: "description",
            message: "Description",
            type: "input"
        }
    ])

    const {download, summary} = await choose_version()

    const new_config: McRSConfig = {
        description: answers.description,
        pack_format: summary.resource_pack_version,
        pack_name: answers.name,
        summary_download: download,
        version_id: summary.id
    }

    fs.mkdirSync(project_root, {recursive: true})
    fs.writeFileSync(GetConfigPath(project_root), JSON.stringify(new_config, null, 3))
    // ScaffoldBasicComponents(project_root,new_config)
    return new_config

}
