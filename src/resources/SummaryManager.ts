import {Project} from "../project";
import fs from "fs";
import path from "path";
import extract from "extract-zip";
import {DownloadFile, GetVersionTag} from "../tools";
import {ResourcesDir} from "./vars";

class SummaryManager {
    public static readonly branch = "summary"



    /**
     * Resolves the download link for the resourcepack summary for the specific version
     * @param version_id
     */
    public resolveDownload(version_id: string): string {
        let tag_name = GetVersionTag(version_id, "summary");
        return `https://github.com/misode/mcmeta/archive/refs/tags/${tag_name}.zip`
    }

    public async download() {
        const dir_path = Project.resolve(ResourcesDir)


        if (!fs.existsSync(dir_path)){
            fs.mkdirSync(dir_path,{recursive:true})
        }
        let dl_path = path.resolve(dir_path,`${SummaryManager.branch}.zip`)
        await DownloadFile(Project.config.summary_download,dl_path)

        await extract(dl_path,{dir:path.resolve(dir_path,SummaryManager.branch)})
    }
}

export default new SummaryManager()
