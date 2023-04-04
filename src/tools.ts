import {Octokit} from "octokit";
import {McRSConfig, type VersionSummary} from "./types";
import chalk from "chalk";
import pkg from "../package.json";
import * as fs from "fs";
import path from "path";
import {throws} from "assert";
class MCResourcePath {
    namespace: string
    path: string[]

    constructor(namespace, path) {
        this.namespace = namespace;
        this.path = path;
    }

    static fromString(resource_path: string) {
        let a = resource_path.split(":")
        let namespace = a[0]
        let path = a[1].split("/")
        return new MCResourcePath(namespace, path)
    }
}

const octokit = new Octokit({});

/**
 * Get & Returns the various different resourcepack templates for each minecraft versions
 */
export async function GetPackVersions(): Promise<VersionSummary[]> {

    let raw = await fetch("https://raw.githubusercontent.com/misode/mcmeta/summary/versions/data.json")
    return await raw.json()
}

/**
 * Returns the commit tag name for the specific resource pack version
 * @param version_id id of the version in {@link VersionSummary}
 * @param branch Name of the branch to get the commit from.
 */
export function GetVersionTag(version_id: string, branch: string) {
    return `${version_id}-${branch}`
}

/**
 * Gets the download link for the resourcepack summary for the specific version
 * @param version_id
 */
export function GetPackSummaryDownload(version_id: string):string {
    let tag_name = GetVersionTag(version_id, "summary");
    return `https://github.com/misode/mcmeta/archive/refs/tags/${tag_name}.zip`
}

export function PrintVersion() {
    console.log(chalk.green("McRScaffolder"), chalk.dim(`v${pkg.version}`))
}

export function GetConfigPath(project_root:string){
    return path.resolve(project_root,"mcrs.config.json")
}

/**
 * Finds and returns the project configuration<br>
 * Returns null if it does not exist.<br>
 * @param root_path
 */
export function GetProjectConfig(root_path:string):McRSConfig|null{
    const config_path = GetConfigPath(root_path)
    if (!fs.existsSync(config_path)){
        return null
    }
    return JSON.parse(fs.readFileSync(config_path,{encoding:'utf-8'}))
}
