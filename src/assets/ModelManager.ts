import {AssetModel, ResourceName} from "../core/types";
import {Project_} from "../core/project";
import path from "path";
import fs from "fs";
import SummaryManager from "../resources/SummaryManager";
import {ReadJson} from "../core/tools";

const RESOURCE_CTX = "models"
const RESOURCE_EXT = ".json"

export class WritableAssetModel extends AssetModel{

    public static FromExisting(asset_model:AssetModel) {
        return  new WritableAssetModel(
            asset_model.model_id,
            asset_model.parent,
            structuredClone(asset_model.textures),
        )
    }
}

/**
 * Independent class managing minecraft models
 */
export class AssetModelManager{

    public ExistsModelInProject(model_id: ResourceName):boolean {
        let model_path = model_id.filepath(RESOURCE_CTX,RESOURCE_EXT)
        // Check if model file exists
        if (!fs.existsSync(model_path)) return false;
        // Check if model file is
        return true
    }

    public async GetModelFromProject(model_id: ResourceName): Promise<AssetModel> {
        // First check if model exists in project
        if (this.ExistsModelInProject(model_id)) {
            try{
                let json = await ReadJson(model_id.filepath(RESOURCE_CTX,RESOURCE_EXT))
                return new AssetModel(
                    model_id,
                    json.parent as string,

                )
            }
            catch (e) {

            }

        }
        // Else return default model
        return await SummaryManager.read_model(model_id)
    }


}