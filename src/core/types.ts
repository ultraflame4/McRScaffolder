import {Project} from "./project";
import path from "path";

export interface McRSConfig {
    pack_name: string,
    description: string,
    version_id: string,
    version_release_time: string,
    pack_format: number,
    summary_download: string,
    mc_resourcepack_folder: string
}

export interface PackMcMeta {
    pack: {
        pack_format: number,
        description: string,
    }
    language?: Record<string, { name: string, region: string, bidirectional: boolean }>,

}

export interface VersionSummary {
    id: string
    name: string
    release_target: null | string
    type: "snapshot" | "release"
    stable: boolean
    data_version: number
    protocol_version: number
    data_pack_version: number
    resource_pack_version: number
    build_time: string
    release_time: string
    sha1: string

}

export class ResourceName {
    /**Namespace of which this resource it at. Eg: "minecraft" */
    namespace: string
    /**Path of which this resource is at. Eg. blocks/white_wool.png */
    path: string[]

    constructor(namespace: string, path: string[]) {
        this.namespace = namespace;
        this.path = path;
    }

    static fromString(resource_path: string): ResourceName {
        if (!resource_path.includes(":")) {
            resource_path = "minecraft:" + resource_path
        }
        let a = resource_path.split(":")
        let namespace = a[0]
        let path = a[1].split("/")
        return new ResourceName(namespace, path)
    }

    /**
     * Converts this resource name into a path relative to the resource pack root. (where pack.mcmeta is)
     * Example: this.rel_path("textures") will return ./assets/minecraft/textures/block/wool.png
     * @param ctx The context for the resource name, eg. textures to get filepath for a texture
     */
    public rel_path(ctx: string) {

        return path.join("assets", this.namespace, ctx, ...this.path)
    }

    /**
     * Converts this resource name into a real absolute filepath given the context.
     * @param ctx The context for the resource name, eg. textures to get filepath for a texture
     * @param ext The file extension with the . eg, ".png". Leave null to have no ext
     */
    public filepath(ctx: string, ext: string = null) {
        if (ext === null) {
            return Project.resolve(Project.config.pack_name, "assets", this.namespace, ctx, ...this.path)
        }
        return path.format({
            ...path.parse(Project.resolve(Project.config.pack_name, "assets", this.namespace, ctx, ...this.path)),
            base: '',
            ext: ext
        });
    }

    /**
     * Returns the filename for this resource name (ext not specified)
     * @param ext
     */
    public filename(ext:string|null =null){
        return this.path[this.path.length-1]+ext??""
    }

    public get resource_path(){return  this.path.join("/")}

    public toJSON() {
        return `${this.namespace}:` + this.path.join("/")
    }
}

export interface ShaderResource {
    name: string,
    files: ResourceName[]
}


export interface TextureAsset_Texture{
    /**
     * Path pointing to the albedo / color map / main texture file (relative to texture asset root)
     */
    albedo: string

    /**
     * Specular maps
     */
    specular?: {
        /**
         * Path pointing towards the roughness map (relative to texture asset root)
         */
        roughness?: string
        /**
         * Path pointing towards the metallic map (relative to texture asset root)
         */
        metallic?: string
        /**
         * Path pointing towards to the porosity map (relative to texture asset root)
         */
        porosity?: string
        /**
         * Path pointing towards to the emission map (relative to texture asset root)
         */
        emission?: string
    }
    /**
     * Normal maps + other maps
     */
    normals?:{
        /**
         * Path pointing towards to the normal map (relative to texture asset root) <br/>
         * The normal map follows DirectX's format
         */
        normal?: string
        /**
         * Path pointing towards to the ambient occlusion map (relative to texture asset root)
         */
        ambient_occlusion?: string
        /**
         * Path pointing towards to the height map (relative to texture asset root)
         */
        height_map?: string
    }

}

export class AssetModel {
    public readonly model_id: ResourceName
    public readonly parent: ResourceName
    public readonly textures: Record<string, ResourceName>

    constructor(model_id: ResourceName, parent: ResourceName, textures: Record<string, ResourceName>) {
        this.model_id = model_id;
        this.parent = parent;
        this.textures = textures;
    }
}