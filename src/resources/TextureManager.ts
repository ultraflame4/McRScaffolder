import {ResourceName} from "../types";
import {Project_} from "../project";
import path from "path";
import AssetsDownloader from "./AssetsDownloader";
import SummaryManager from "./SummaryManager";
import fs from "fs";

/**
 * Represents an asset in the project that needs to be build and placed into a Resourcepack.
 * A texture asset can have multiple assets if needed.
 */
export abstract class BaseTextureAsset {

    /** Type of texture. Eg: blocks */
    protected texture_type: string
    protected texture_id: string // id texture. Depends on texture type (Does not include namespace. Purely the filename)
    protected project: Project_;
    protected constructor( project: Project_, texture_type:string, texture_name:string) {
        this.project=project
        this.texture_type = texture_type;
        this.texture_id = texture_name;

    }

    /**
     * Returns the path to the folder that contains this texture asset. eg: test_project/src/textures/minecraft.white_wool/
     */
    public get AssetRoot(): string{
        return this.project.resolve('src','textures', this.texture_type, `minecraft.${this.texture_id}`)
    }

    /**
     * Returns the path that points to this texture asset's config file. eg: test_project/src/textures/minecraft.white_wool/textures.asset.json
     */
    public get AssetConfigFile():string {
        return path.join(this.AssetRoot,"textures.asset.json")
    }

    private ResourceNames: ResourceName[] | null = null
    protected abstract _GetResourceNames(): Promise<ResourceName[]>

    /**
     * Gets the textures for this texture asset. (And caches them in a variable)
     */
    public async GetResourceNames():Promise<ResourceName[]>{
        if (this.ResourceNames === null) {
            this.ResourceNames = await this._GetResourceNames()
        }
        return this.ResourceNames;
    }

    /**
     * Downloads the textures for ths texture asset.
     * Return true on success. Certain error strings on failure
     */
    public async downloadTextures(): Promise<void>{
        let resourceNames = await this.GetResourceNames()
        let assetPaths = await AssetsDownloader.downloadAsset(resourceNames,"textures",".png")
        for (let i = 0; i < assetPaths.length; i++) {
            let dlPath = assetPaths[i].path
            let resName = assetPaths[i].resource
            fs.mkdirSync(this.AssetRoot,{recursive:true})
            fs.copyFileSync(dlPath,path.resolve(this.AssetRoot, resName.filename(".png")))

        }
    }
}

export class BlockTextureAsset extends BaseTextureAsset{
    public constructor( project: Project_, block_id: string) {
        super( project, "block", block_id);
    }

    async _GetResourceNames(): Promise<ResourceName[]> {
        return await SummaryManager.get_block_textures(this.texture_id);
    }
}

class TextureManager{

    public addTextureAsset<T extends BaseTextureAsset>(asset:T):T  {
        return asset
    }
}

export default new TextureManager()