import {ResourceName} from "../core/types";
import SummaryManager from "./SummaryManager";

type ResourcePackTexture = { name: string, path: ResourceName }

interface ITextureAsset {
    GetTextures(): ResourcePackTexture[]
}

export class ResourcePackItemAsset implements ITextureAsset {
    item_id: ResourceName
    model: ResourcePackModel

    constructor(item_id: ResourceName, model: ResourcePackModel) {
        this.item_id = item_id;
        this.model = model;
    }

    GetTextures(): ResourcePackTexture[] {
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
    block_id: ResourceName
    models: ResourcePackModel[]

    constructor(block_id: ResourceName, models: ResourcePackModel[]) {
        this.block_id = block_id;
        this.models = models;
    }

    GetTextures(): ResourcePackTexture[] {
        return this.models.flatMap(x => x.textures);
    }
}

class ResourcePackModel {
    model_id: ResourceName
    parent_model_id: ResourceName | null
    textures: ResourcePackTexture[]

    constructor(model_id: ResourceName, parent_model_id: ResourceName, textures: ResourcePackTexture[]) {
        this.model_id = model_id;
        this.parent_model_id = parent_model_id;
        this.textures = textures;
    }

    static async fromModelId(model_id: ResourceName): Promise<ResourcePackModel>{
        let data = await SummaryManager.read_model(model_id);
        return new ResourcePackModel(
            model_id,
            ResourceName.fromString(data["parent"] as string) ?? null,
            Object.entries(data["textures"]??{}).map(([k,v])=>{
                return {
                    name: k,
                    path: ResourceName.fromString(v as string)
                }
            })
        )
    }
}