import {ResourceName} from "../core/types";
import {DownloadFile, GetVersionTag} from "../core/tools";
import {Project} from "../core/project";
import path from "path";

class AssetsDownloader{
    /**
     * Downloads 1 or more assets into the resource pack given the resource names , context and file extension
     * @param names Resource names
     * @param ctx The context, eg. "textures"
     * @param ext The file extension with the . eg. ".png"
     * @returns Returns a collection of resource names and their respective download path
     */
    public async downloadAsset(names: ResourceName[],ctx:string,ext:string=null): Promise<Array<{path:string,resource:ResourceName}>> {
        let download_paths:Array<{path:string,resource:ResourceName}> = []
        for (let i = 0; i < names.length; i++) {
            let value = names[i]
            const dl_path = path.join(`misode/mcmeta/${GetVersionTag(Project.config.version_id,"assets")}`,value.rel_path(ctx)+(ext??""))
            const dl_link = new URL(dl_path,"https://raw.githubusercontent.com")
            download_paths.push({
                path: await DownloadFile(dl_link.toString(),value.filepath(ctx,ext)),
                resource: value
            })
        }
        return download_paths
    }

    /**
     * Downloads 1 or more textures into the resource pack project
     * @param textures
     */
    public async downloadTextures(...textures: ResourceName[]) {
        await this.downloadAsset(textures,"textures",".png")
    }
}

export default new AssetsDownloader()
