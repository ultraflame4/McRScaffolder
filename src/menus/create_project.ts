import {McRSConfig, PackMcMeta, VersionSummary} from "../types";
import {GetPackVersions, pathIsDir, resolvePathEnvVars} from "../tools";
import chalk from "chalk";
import ora from "ora"
import path from "path";
import fs from "fs";
import {Project} from "../project";
import SummaryManager from "../resources/SummaryManager";
import {input} from "@inquirer/prompts";
import inquirer from "inquirer"
import {SearchList} from "../prompts/searchlist";
/**
 * Asks the user for the target minecraft version and returns the download link for that version summary
 */
async function choose_version(): Promise<{ download_link: string, version_data: VersionSummary }> {
    const spinner = ora("Getting versions...")
    spinner.start()
    let versions = await GetPackVersions()
    spinner.succeed()
    let answers = await SearchList({
        name: "version",
        message: "Select target Minecraft version",
        //@ts-ignore
        type: "search-list",
        default: versions.findIndex(x => x.stable),
        choices: versions.map(x => { return {
            id: x.id
        }})
    })

    let ver: VersionSummary = versions.find(x => x.id === answers["version"])

    let downloadLink = SummaryManager.resolveDownload(ver.id)
    console.log(
        chalk.green("Resolved download link to:"),
        chalk.underline.cyanBright(downloadLink)
    )
    return {
        download_link: downloadLink,
        version_data: ver
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
    fs.mkdirSync(path.resolve(resourcepack_root, "assets"), {recursive: true})
    fs.writeFileSync(path.resolve(resourcepack_root, "pack.mcmeta"), JSON.stringify(pack_mcmeta, null, 3))
}


export async function create_project_menu(project_root: string): Promise<McRSConfig> {
    const project_name = await input({message: "Enter Project Name"})
    const project_desc = await input({message: "Enter Project Description"})
    const mc_resourcepack = await input({
        message: "Minecraft resource pack folder location",
        default: "%appdata%/.minecraft/resourcepacks",
        async validate(input: string): Promise<string | boolean> {
            if (!pathIsDir(path.resolve(resolvePathEnvVars(input)))) {
                return [
                    chalk.yellow(input),
                    chalk.redBright("could not be found!"),
                    "Please ensure the folder exists and the path is correct!",
                    chalk.cyan.dim("(This is a precaution against mistakes!)")
                ].join(" ")
            }
            return true
        }
    })

    const {download_link, version_data} = await choose_version()

    const new_config: McRSConfig = {
        description: project_desc,
        pack_format: version_data.resource_pack_version,
        pack_name: project_name,
        summary_download: download_link,
        version_id: version_data.id,
        version_release_time: version_data.release_time,
        mc_resourcepack_folder: mc_resourcepack
    }

    const spinner = ora("Initialising project...")
    spinner.start()
    Project.Initialise(project_root, new_config)
    spinner.succeed()

    ScaffoldBasicComponents()
    const spinner2 = ora("Download summary data...")
    spinner2.start()
    await SummaryManager.download()
    spinner2.succeed()

    return new_config

}
