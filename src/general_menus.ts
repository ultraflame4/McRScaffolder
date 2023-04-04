import {GetConfigPath, GetPackSummaryDownload, GetPackVersions} from "./tools";
import inquirer from "inquirer";
import chalk from "chalk";
import pkg from "../package.json";
import ora from 'ora';
import {McRSConfig, VersionSummary} from "./types";
import * as fs from "fs";

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


export function start_menu() {

}

export async function create_project_menu(project_root: string) {
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

    fs.mkdirSync(project_root,{recursive:true})
    fs.writeFileSync(GetConfigPath(project_root),JSON.stringify(new_config,null,3))

}
