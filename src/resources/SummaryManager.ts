import {Project} from "../core/project";
import fs from "fs";
import path from "path";
import extract from "extract-zip";
import {DownloadFile, GetVersionTag, ReadJson} from "../core/tools";
import {ResourcesDir} from "./vars";
import {AssetModel, ResourceName} from "../core/types";
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
     * Creates a helper to read model data from the json file
     * @param summary The summary manager instance
     * @param model_id The model id eg. "item/coal"
     * @return null if model does not exist
     */

    private async _read_model(model_id_str: string) {
        let all_models = await ReadJson(this.resolve("assets", "model", "data.json"))
        let data = all_models[model_id_str]
        if (!data) return null
        let textures = data["textures"] ?? {}
        Object.keys(textures).forEach(k => {
            textures[k] = ResourceName.fromString(textures[k] as string)
        })

        return new AssetModel(
            ResourceName.fromString(model_id_str),
            data["parent"],
            textures
        )
    }

    public async read_model(model_id: ResourceName) {
        return await this._read_model(model_id.resource_path)
    }

    public async get_item_model(item_id: string) {
        return await this._read_model(`item/${item_id}`)
    }


    /**
     * Gets a list of all minecraft textures from the registry
     */
    public async read_textures(): Promise<string[]> {
        return (await ReadJson(this.resolve("registries", "data.json")))["texture"]
    }

    /**
     * Gets a list of all minecraft items from the registry
     */
    public async read_items(): Promise<string[]> {
        return (await ReadJson(this.resolve("registries", "data.json")))["item"]
    }

    /**
     * Gets a list of all minecraft blocks from the registry
     */
    public async read_blocks(): Promise<string[]> {
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

    public async get_block_textures(block_model: ResourceName): Promise<Record<string, ResourceName>> {
        let modelData = await ReadJson(this.resolve("assets", "model", "data.json"))
        let textures: Record<string, ResourceName> = {}
        let key = block_model.resource_path
        let model = modelData[key]
        // Some models no textures so we skip
        if (!model["textures"]) {
            return
        }

        Object.entries(model["textures"]).forEach(([k, v]) => {
            textures[k] = ResourceName.fromString(v as string)
        })

        return textures
    }

}

export default new SummaryManager()
