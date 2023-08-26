import {Project} from "../core/project";
import fs from "fs";
import path from "path";
import extract from "extract-zip";
import {DownloadFile, GetVersionTag, ReadJson} from "../core/tools";
import {ResourcesDir} from "./vars";
import {ResourceName} from "../core/types";
import jp from "jsonpath"


class SummaryManager {
    public static readonly branch = "summary"

    public resolve(...path: string[]) {
        return Project.resolve(ResourcesDir, SummaryManager.branch, `mcmeta-${Project.config.version_id}-${SummaryManager.branch}`, ...path)
    }

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


        if (!fs.existsSync(dir_path)) {
            fs.mkdirSync(dir_path, {recursive: true})
        }
        let dl_path = path.resolve(dir_path, `${SummaryManager.branch}.zip`)
        await DownloadFile(Project.config.summary_download, dl_path)

        await extract(dl_path, {dir: path.resolve(dir_path, SummaryManager.branch)})
    }

    /**
     * Gets a list of all minecraft items from the registry
     */
    public async get_items(): Promise<string[]> {
        return (await ReadJson(this.resolve("registries", "data.json")))["item"]
    }

    /**
     * Gets a list of all minecraft blocks from the registry
     */
    public async get_blocks(): Promise<string[]> {
        return (await ReadJson(this.resolve("registries", "data.json")))["block"]
    }


    /**
     * Returns a list of resource names for the block models for a specified block id
     * @param block_id
     */
    public async get_block_models(block_id: string): Promise<ResourceName[]> {
        // Read the block definition which will contain a list of block models for the block_id
        let block_definition = (await ReadJson(this.resolve("assets", "block_definition", "data.json")))[block_id]
        let models: string[] = []
        jp.query(block_definition, "$..model").forEach(x => {
            if (!models.includes(x)) models.push(x)
        })
        return models.map(x => ResourceName.fromString(x))
    }

    public async read_model(model_id: ResourceName): Promise<object> {
        let modelData = await ReadJson(this.resolve("assets", "model", "data.json"))
        let key = model_id.resource_path
        return modelData[key]
    }

}

export default new SummaryManager()
