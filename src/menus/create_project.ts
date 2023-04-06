
import {McRSConfig, PackMcMeta, VersionSummary} from "../types";
import inquirer from "inquirer";
import { GetPackVersions} from "../tools";
import chalk from "chalk";
import ora from "ora"
import path from "path";
import fs from "fs";
import {Project} from "../project";
import SummaryManager from "../resources/SummaryManager";

/**
 * Asks the user for the target minecraft version and returns the download link for that version summary
 */
async function choose_version(): Promise<{ download_link: string, version_data: VersionSummary }> {
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

    let downloadLink = SummaryManager.resolveDownload(answers["version"].id)
    console.log(
        chalk.green("Resolved download link to:"),
        chalk.underline.cyanBright(downloadLink)
    )
    return {
        download_link: downloadLink,
        version_data: answers["version"]
    }
}

/**
 * Scaffolds and creates the basic file structure for a resource pack
 */
export function ScaffoldBasicComponents() {
    const resourcepack_root = Project.resolve(Project.config.pack_name)
    const pack_mcmeta: PackMcMeta = {
        pack: {
            description: Project.config.description,
            pack_format: Project.config.pack_format
        }
    }
    // Create the basic folders & files
    fs.mkdirSync(path.resolve(resourcepack_root,"assets"),{recursive:true})
    fs.writeFileSync(path.resolve(resourcepack_root,"pack.mcmeta"),JSON.stringify(pack_mcmeta,null,3))
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

    const {download_link, version_data} = await choose_version()

    const new_config: McRSConfig = {
        description: answers.description,
        pack_format: version_data.resource_pack_version,
        pack_name: answers.name,
        summary_download: download_link,
        version_id: version_data.id
    }

    Project.Initialise(project_root, new_config)

    ScaffoldBasicComponents()
    await SummaryManager.download()
    return new_config

}
