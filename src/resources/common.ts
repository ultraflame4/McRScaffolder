import {ResourceName} from "../core/types";
import SummaryManager from "./SummaryManager";
import {ReadJson, writeToFile} from "../core/tools";

export interface ResourcePackTexture {
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

export interface IResourcePackAsset {
    asset_id: ResourceName
    loadData(force?: boolean): Promise<any>
}

export interface ISaveableAsset extends IResourcePackAsset {
    write(): Promise<void>
}

export interface ITextureAsset extends ISaveableAsset {
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
        return this.model.GetTexturesRecursive();
    }
    async GetModels(): Promise<ResourcePackTexture[]> {
        await this.model.loadData()
        return this.model.GetTexturesRecursive();
    }

    static async fromItemId(item_id: string | ResourceName): Promise<ResourcePackItemAsset> {
        if (typeof item_id == "string") item_id = ResourceName.fromString(`item/${item_id}`)
        return new ResourcePackItemAsset(
            item_id,
            await ResourcePackModel.fromModelId(item_id)
        )
    }

    public exists() : boolean{
        return this.model.ExistsInProject()
    }

    async write(): Promise<void> {
        let all_models = await this.model.GetAllRelatedModels()
        await Promise.all(all_models.map(x=>x.write()))
        return
    }

    async loadData(force: boolean): Promise<void> {
        return this.model.loadData(force)
    }

}

export class ResourcePackBlockAsset implements ITextureAsset {

    asset_id: ResourceName
    models: ResourcePackModel[]

    constructor(block_id: ResourceName, models: ResourcePackModel[]) {
        this.asset_id = block_id;
        this.models = models;
    }

    loadData(force: boolean): Promise<any> {
        return Promise.all(this.models.map(x=>x.loadData(force)))
    }

    async GetTextures(): Promise<ResourcePackTexture[]> {
        return this.models.flatMap(x => x.textures);
    }
    async write(): Promise<void> {
        await Promise.all(this.models.map(x=>x.write()))
    }
}

class ResourcePackModel implements ISaveableAsset{


    asset_id: ResourceName
    private _parent_model_id: ResourceName | null
    private _textures: ResourcePackTexture[]
    private _loaded: boolean = false

    constructor(model_id: ResourceName, parent_model_id: ResourceName, textures: ResourcePackTexture[], loaded: boolean = false) {
        this.asset_id = model_id;
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
     * Gets all the textures for this model recursively from its parents
     * @constructor
     */
    public async GetTexturesRecursive(): Promise<ResourcePackTexture[]> {
        let textures: ResourcePackTexture[] = this.textures
        let parent_id = this.parent_model_id
        while (true) {
            if (!parent_id) break
            let parent = await ResourcePackModel.fromModelId(parent_id)
            await parent.loadData(true);
            // Check if textures in parent has been overridden
            textures=textures.concat(parent.textures.filter(t=>textures.find(x=> t.name==x.name) == undefined))
            parent_id = parent.parent_model_id
        }
        return textures
    }

    /**
     * Gets all related models recursively from its parents (including itself)
     * @constructor
     */
    public async GetAllRelatedModels(): Promise<ResourcePackModel[]> {
        let models: ResourcePackModel[] = [this]
        let parent_id = this.parent_model_id
        while (true) {
            if (!parent_id) break
            let parent = await ResourcePackModel.fromModelId(parent_id)
            await parent.loadData(true);
            models.push(parent)
            parent_id = parent.parent_model_id
        }
        return models
    }

    private async loadDefaults() {
        let data = await SummaryManager.read_model(this.asset_id);
        this._parent_model_id = ResourceName.fromString(data?.["parent"] as string) ?? null
        this._textures = Object.entries(data?.["textures"] ?? {}).map(([k, v]) => {
            return {
                model_id: this.asset_id,
                name: k,
                path: ResourceName.fromString(v as string)
            }
        })
    }

    private async loadSaved() {
        if (!this.asset_id.ExistsInProject("models", ".json")) return
        let json = await ReadJson(this.asset_id.filepath("models", ".json"))
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
        await this.loadDefaults() // First load default model
        await this.loadSaved()
        this._loaded = true
    }

    public ExistsInProject() : boolean{
        return this.asset_id.ExistsInProject("models",".json")
    }

    /**
     * Writes the data into the project files
     */
    public async write() {

        let tex_ = {}
        this.textures.forEach(x=>{
            tex_[x.name] = x.path
        })
        if (Object.entries(tex_).length == 0) tex_ = undefined

        writeToFile(
            this.asset_id.filepath("models", ".json"),
            JSON.stringify({
                parent: this.parent_model_id?.toString() ?? undefined,
                textures: tex_
            }, null, 3)
        )
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