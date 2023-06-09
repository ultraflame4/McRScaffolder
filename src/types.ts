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
    namespace: string
    path: string[]

    constructor(namespace:string, path:string[]) {
        this.namespace = namespace;
        this.path = path;
    }

    static fromString(resource_path: string):ResourceName {
        if (!resource_path.includes(":")){
            resource_path="minecraft:"+resource_path
        }
        let a = resource_path.split(":")
        let namespace = a[0]
        let path = a[1].split("/")
        return new ResourceName(namespace, path)
    }

    /**
     * Converts this resource name into a path relative to the resource pack root. (where pack.mcmeta is)
     * @param ctx The context for the resource name, eg. textures to get filepath for a texture
     */
    public rel_path(ctx:string) {

        return path.join("assets",this.namespace,ctx,...this.path)
    }

    /**
     * Converts this resource name into a real absolute filepath given the context.
     * @param ctx The context for the resource name, eg. textures to get filepath for a texture
     * @param ext The file extension with the . eg, ".png". Leave null to have no ext
     */
    public filepath(ctx:string,ext:string=null) {
        if (ext === null) {
            return Project.resolve(Project.config.pack_name,"assets",this.namespace,ctx,...this.path)
        }
        return path.format({
            ...path.parse(Project.resolve(Project.config.pack_name,"assets",this.namespace,ctx,...this.path)),
             base: '',
            ext:ext
        });
    }
}

export interface ShaderResource{
    name:string,
    files:ResourceName[]
}
