import {AssetModel, ResourceName} from "../core/types";
import {Project_} from "../core/project";
import path from "path";
import fs from "fs";
import SummaryManager from "../resources/SummaryManager";

const RESOURCE_CTX = "models"
const RESOURCE_EXT = ".json"


/**
 * Independent class managing minecraft models
 */
export class AssetModelManager{
    private project: Project_;


    constructor(project_: Project_) {
        this.project = project_;
    }

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
            return await SummaryManager.read_model(model_id)
        }
    }


}