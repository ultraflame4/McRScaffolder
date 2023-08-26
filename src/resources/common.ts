import {ResourceName} from "../core/types";
import SummaryManager from "./SummaryManager";

type ResourcePackTexture = { name: string, path: ResourceName }

interface ITextureAsset {
    GetTextures(): Promise<ResourcePackTexture[]>
}

export class ResourcePackItemAsset implements ITextureAsset {
    item_id: ResourceName
    model: ResourcePackModel

    constructor(item_id: ResourceName, model: ResourcePackModel) {
        this.item_id = item_id;
        this.model = model;
    }

    async GetTextures(): Promise<ResourcePackTexture[]> {
        await this.model.WaitLoadData()
        return this.model.textures;
    }

    static fromItemId(item_id: string | ResourceName): ResourcePackItemAsset {
        if (typeof item_id == "string") item_id = ResourceName.fromString(`item/${item_id}`)
        return new ResourcePackItemAsset(
            item_id,
            ResourcePackModel.fromModelId(item_id)
        )
    }

}

export class ResourcePackBlockAsset implements ITextureAsset {
    block_id: ResourceName
    models: ResourcePackModel[]

    constructor(block_id: ResourceName, models: ResourcePackModel[]) {
        this.block_id = block_id;
        this.models = models;
    }

    async GetTextures(): Promise<ResourcePackTexture[]> {
        let nestedTextures = await Promise.all(this.models.map(async x => {
            await x.WaitLoadData()
            return x.textures
        }))

        return nestedTextures.flat()
    }
}

class ResourcePackModel {


    model_id: ResourceName
    private _parent_model_id: ResourceName | null
    private _textures: ResourcePackTexture[]
    private _load_promise: Promise<void>
    private _loaded: boolean = false

    constructor(model_id: ResourceName, parent_model_id: ResourceName, textures: ResourcePackTexture[]) {
        this.model_id = model_id;
        this._parent_model_id = parent_model_id;
        this._textures = textures;
        this._load_promise = this._load_data()
    }


    get textures(): ResourcePackTexture[] {
        if (!this._loaded) throw new Error("Attempted to use .textures before data is loaded")
        return this._textures;
    }

    get parent_model_id(): ResourceName | null {
        if (!this._loaded) throw new Error("Attempted to use .parent_model_id before data is loaded")
        return this._parent_model_id;
    }

    async _load_data(): Promise<void> {

        let data = await SummaryManager.read_model(this.model_id);
        this._parent_model_id = ResourceName.fromString(data["parent"] as string) ?? null
        this._textures = Object.entries(data["_textures"] ?? {}).map(([k, v]) => {
            return {
                name: k,
                path: ResourceName.fromString(v as string)
            }
        })
        this._loaded=true
    }

    /**
     * Call this before using any attributes.
     *
     * This is needed because this object will be available in a list with hundreds of other models.
     * Loading all the models at once takes a long time and results in unresponsive prompts
     */
    public async WaitLoadData() {
        return await this._load_promise
    }

    /**
     * Creates an instance from a model_id
     * @param model_id Id / Resource path to the model
     * @param wait When true, immediate wait for the data to load instead of depending on user to load it.
     */

    static fromModelId(model_id: ResourceName, wait: boolean = false): ResourcePackModel {
        return new ResourcePackModel(
            model_id,
            null,
            []
        )
    }
}