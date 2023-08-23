import {ResourceName} from "../types";
import {Project_} from "../project";
import SummaryManager from "./SummaryManager";


class BlockModel {
    model_id: ResourceName
    /**
     * The key is used to identify the texture,
     * the value contains the Resource Name pointing to the texture file
     */
    textures: Record<string, ResourceName>

    constructor(model_id: ResourceName, textures: Record<string, ResourceName>) {
        this.model_id = model_id;
        this.textures = textures;
    }


    /**
     * Returns the block models for a given block id
     * @constructor
     */
    public static async FromBlockId(block_id: string): Promise<BlockModel[]> {
        let models = await SummaryManager.get_block_models(block_id)
        return await Promise.all(
            models.map(async (x) => {
                let textures = await SummaryManager.get_block_model_textures(x)
                return new BlockModel(x, textures);
            })
        )
    }
}

export class BlockAsset {

    private block_id: string
    private project: Project_;
    private blockModels: BlockModel[] = []

    public constructor(project: Project_, block_id: string) {
        this.project = project;
        this.block_id = block_id;
    }

    public async GetDefaultModels() {
        return BlockModel.FromBlockId(this.block_id);
    }

    /**
     * Returns a shallow copy of the textures. DO NOT MODIFY
     * @constructor
     */
    public GetTextures(): Record<string, ResourceName> {
        let textures = {}
        this.blockModels.forEach(v => textures = {...textures, ...v.textures})
        return textures
    }

    public async LoadConfig(): Promise<boolean> {
        return false
    }

    public async LoadDefaults() {
        this.blockModels = await this.GetDefaultModels()
        return
    }

    public Save() {

    }

}

class AssetManager {

    public addAsset<T>(asset: T): T {
        return asset
    }
}

export default new AssetManager()