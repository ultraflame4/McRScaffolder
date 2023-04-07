import {ResourceName} from "../types";
import {DownloadFile, GetVersionTag} from "../tools";
import {Project} from "../project";
import path from "path";

class AssetsManager{
    /**
     * Downloads 1 or more assets into the resource pack given the resource names , context and file extension
     * @param names Resource names
     * @param ctx The context, eg. "textures"
     * @param ext The file extension with the . eg. ".png"
     */
    public async downloadAsset(names: ResourceName[],ctx:string,ext:string=null) {
        for (let i = 0; i < names.length; i++) {
            let value = names[i]
            const dl_path = path.join(`misode/mcmeta/${GetVersionTag(Project.config.version_id,"assets")}`,value.rel_path(ctx)+ext??"")
            const dl_link = new URL(dl_path,"https://raw.githubusercontent.com")
            await DownloadFile(dl_link.toString(),value.filepath(ctx,ext))
        }
    }

    /**
     * Downloads 1 or more textures into the resource pack project
     * @param textures
     */
    public async downloadTextures(...textures: ResourceName[]) {
        await this.downloadAsset(textures,"textures",".png")
    }
}

export default new AssetsManager()
