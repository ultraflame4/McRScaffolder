import {ResourceName} from "../core/types";
import {DownloadFile, GetVersionTag} from "../core/tools";
import {Project} from "../core/project";
import path from "path";
import fs from "fs";


export interface AssetDownloadResult{
    path: string,
    status: "success" | "existing" | "error"
}

class AssetsDownloader {
    /**
     * Downloads 1 or more assets into the resource pack given the resource names , context and file extension
     * @param name
     * @param ctx The context, eg. "textures"
     * @param ext The file extension with the . eg. ".png"
     * @param overwrite Whether to overwrite existing file. Defaults to false
     * @returns Returns
     */
    public async downloadAsset(name: ResourceName, ctx: string, ext: string = null, overwrite: boolean = false): Promise<AssetDownloadResult> {
        const dl_path = path.join(`misode/mcmeta/${GetVersionTag(Project.config.version_id, "assets")}`, name.rel_path(ctx) + (ext ?? ""))
        const dl_link = new URL(dl_path, "https://raw.githubusercontent.com")

        let status: AssetDownloadResult["status"]
        let file_path = name.filepath(ctx, ext)

        if (!fs.existsSync(file_path) || overwrite) {
            try {
                await DownloadFile(dl_link.toString(), file_path)
            } catch (e) {
                status = "error"
            }
        }
        else {
            status = "existing"
        }

        return {
            path: file_path,
            status
        };
    }

    /**
     * Downloads 1 or more textures into the resource pack project
     * @param textures
     */
    public async downloadTextures(...textures: ResourceName[]) {
        return await Promise.all(textures.map(x=>this.downloadAsset(x, "textures", ".png")))
    }
}

export default new AssetsDownloader()
