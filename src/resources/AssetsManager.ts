import {ResourceName} from "../types";
import {DownloadFile, GetVersionTag} from "../tools";
import {Project} from "../project";
import path from "path";

class AssetsManager{
    /**
     * Downloads 1 or more textures into the resource pack project
     * @param textures
     */
    public async downloadTextures(textures: ResourceName[]) {
        for (let i = 0; i < textures.length; i++) {
            let value = textures[i]
            const dl_path = path.join(`misode/mcmeta/tree/${GetVersionTag(Project.config.version_id,"assets")}`,value.rel_path("textures")+".png")
            const dl_link = new URL(dl_path,"https://github.com")
            await DownloadFile(dl_link.toString(),value.filepath("textures","png"))
        }
    }
}

export default new AssetsManager()
