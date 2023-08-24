import {Project} from "../core/project";
import fs from "fs";
import path from "path";
import extract from "extract-zip";
import {DownloadFile, GetVersionTag, ReadJson} from "../core/tools";
import {ResourcesDir} from "./vars";
import {ResourceName} from "../core/types";
import jp from "jsonpath"

const mc_namespace = "minecraft:"

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
     * Returns a list of resources names for specified item's textures
     * @param item_id
     */
    public async get_item_textures(item_id: string): Promise<ResourceName[]> {
        let model = (await ReadJson(this.resolve("assets", "model", "data.json")))[`item/${item_id}`]
        return Object.values(model["textures"]).map((x: string) => ResourceName.fromString(x))
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

    public async get_block_model_textures(block_model: ResourceName): Promise<Record<string, ResourceName>> {
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


    /**
     * Returns a list of resources names for specified block model
     * @param block_id
     */
    public async get_block_textures(block_id: string): Promise<ResourceName[]> {

        // Read the block definition which will contain a list of block models for the block_id
        let models = await this.get_block_models(block_id)
        let modelData = await ReadJson(this.resolve("assets", "model", "data.json"))
        let textures: string[] = []
        models.forEach(model_resource => {

            let key = model_resource.resource_path
            let model = modelData[key]
            // Some models no textures so we skip
            if (!model["textures"]) {
                return
            }

            Object.values(model["textures"]).forEach((x: string) => {
                if (!textures.includes(x)) {
                    textures.push(x)
                }
            })
        })
        return textures.map(x => ResourceName.fromString(x))
    }

}

export default new SummaryManager()
