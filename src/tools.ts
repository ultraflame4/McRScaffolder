import {Octokit} from "octokit";
import {type VersionSummary} from "./types";

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
