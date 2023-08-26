import {ResourceName} from "../core/types";
import SummaryManager from "./SummaryManager";

interface ResourcePackTexture {
    /**
     * The model this texture belongs to (Used for grouping)
     */
    model_id: ResourceName
    /**
     * The name of the texture (Cannot be changed)
     */
    name: string,
    /**
     * The actual textureresource path
     */
    path: ResourceName
}

export interface IResourcePackAsset{
    asset_id: ResourceName
}

export interface ITextureAsset extends IResourcePackAsset{
    GetTextures(): Promise<ResourcePackTexture[]>
}

export class ResourcePackItemAsset implements ITextureAsset {
    asset_id: ResourceName
    model: ResourcePackModel

    constructor(item_id: ResourceName, model: ResourcePackModel) {
        this.asset_id = item_id;
        this.model = model;
    }

    async GetTextures(): Promise<ResourcePackTexture[]> {
        await this.model.loadData()
        return this.model.textures;
    }

    static async fromItemId(item_id: string | ResourceName): Promise<ResourcePackItemAsset> {
        if (typeof item_id == "string") item_id = ResourceName.fromString(`item/${item_id}`)
        return new ResourcePackItemAsset(
            item_id,
            await ResourcePackModel.fromModelId(item_id)
        )
    }

}

export class ResourcePackBlockAsset implements ITextureAsset {
    asset_id: ResourceName
    models: ResourcePackModel[]

    constructor(block_id: ResourceName, models: ResourcePackModel[]) {
        this.asset_id = block_id;
        this.models = models;
    }

    async GetTextures(): Promise<ResourcePackTexture[]> {
        return this.models.flatMap(x => x.textures);
    }
}

class ResourcePackModel {


    model_id: ResourceName
    private _parent_model_id: ResourceName | null
    private _textures: ResourcePackTexture[]
    private _loaded: boolean = false

    constructor(model_id: ResourceName, parent_model_id: ResourceName, textures: ResourcePackTexture[], loaded: boolean = false) {
        this.model_id = model_id;
        this._parent_model_id = parent_model_id;
        this._textures = textures;
        this._loaded = loaded
    }


    get textures(): ResourcePackTexture[] {
        if (!this._loaded) throw new Error("Attempted to use .textures before data is loaded")
        return this._textures;
    }

    get parent_model_id(): ResourceName | null {
        if (!this._loaded) throw new Error("Attempted to use .parent_model_id before data is loaded")
        return this._parent_model_id;
    }

    /**
     * Call this before using any attributes.
     *
     * This is needed because this object will be available in a list with hundreds of other models.
     * Loading all the models at once takes a long time and results in unresponsive prompts
     * @param force If true, will reload and re-read data even when not needed.
     */
    public async loadData(force: boolean = false) {
        if (this._loaded && !force) return
        let data = await SummaryManager.read_model(this.model_id);
        this._parent_model_id = ResourceName.fromString(data["parent"] as string) ?? null
        this._textures = Object.entries(data["_textures"] ?? {}).map(([k, v]) => {
            return {
                model_id: this.model_id,
                name: k,
                path: ResourceName.fromString(v as string)
            }
        })
        this._loaded = true
    }

    /**
     * Creates an instance from a model_id
     * @param model_id Id / Resource path to the model
     * @param force_load When true, immediate loads the data instead of depending on user to load it.
     */

    static async fromModelId(model_id: ResourceName, force_load: boolean = false): Promise<ResourcePackModel> {
        let o = new ResourcePackModel(
            model_id,
            null,
            [],
            false
        );
        if (force_load) await o.loadData(true)
        return o
    }
}