import {type VersionSummary} from "./types";
import chalk from "chalk";
import pkg from "../package.json";
import * as fs from "fs";
import download from "download"
import path from "path";


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

export function PrintVersion() {
    console.log(chalk.greenBright("McRScaffolder"), chalk.dim(`v${pkg.version}`))
}


/**
 * Downloads a file from the url
 * @param url
 * @param dest
 */
export async function DownloadFile(url: string,dest:string):Promise<void> {
    let pathInfo = path.parse(dest)
    fs.mkdirSync(pathInfo.dir,{recursive:true})

    return fs.writeFileSync(dest, await download(url))

}

export async function ReadJson(file_path):Promise<any>{
    return JSON.parse(fs.readFileSync(file_path,{encoding:"utf-8"}))
}

export function resolvePathEnvVars(path_: string) {
    return path_.replace(/%([^%]+)%/g, (_,n) => process.env[n] ?? "")
}
