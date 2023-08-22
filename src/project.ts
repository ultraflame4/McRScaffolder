import {McRSConfig, ResourceName} from "./types";
import path from "path";
import fs from "fs";
import {GetVersionTag, resolvePathEnvVars} from "./tools";

/**
 * Represents an asset in the project that needs to be build and placed into a Resourcepack.
 */
export abstract class ProjectAsset {
    /** Resource name this asset represents.*/
    resourceName: ResourceName

    private asset_namespace: string // Namespace of this asset to bn
    private asset_path: string // File path
    private project: Project_;
    constructor(resourceName: ResourceName, project: Project_,asset_namespace,asset_path) {
        this.resourceName=resourceName
        this.project=project
        this.asset_namespace=asset_namespace
        this.asset_path=asset_path
    }

    public get assetPath(): string{
        return this.project.resolve('src', this.asset_namespace, this.asset_path)
    }
}


export class Project_ {

    /// Project Root
    #project_root: string | null

    /**
     * Returns the version tag for this project with the specific branch name
     * @param branch_name
     */
    public version_tag(branch_name:string):string {
        return GetVersionTag(this.config.version_id,branch_name)
    }

    public get project_root(): string {
        if (this.#project_root === null)
            throw new Error("Error while getting project root. project root not set!")
        return this.#project_root
    }

    /**
     * Resolves a path relative to the project root.
     * @param paths {string} path relative to the project root
     */
    public resolve(...paths: string[]) {
        return path.resolve(this.project_root, ...paths)
    }


    /// Project Config
    #config: McRSConfig | null
    public readonly d: string

    public get config(): McRSConfig {
        if (this.#config === null)
            throw new Error("Error while getting configuration. Config not loaded!")
        return this.#config
    }

    public get configPath() {
        return this.resolve("mcrs.config.json")
    }

    public saveConfig() {
        fs.mkdirSync(this.project_root, {recursive: true})
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 3))
    }

    /**
     * Attempts to load the config from an existing config file (defined by this.configPath).<br>
     * Returns true on success and vice versa
     */
    public loadConfig() {
        if (!fs.existsSync(this.configPath)) return false
        this.#config = JSON.parse(fs.readFileSync(this.configPath, {encoding: 'utf-8'}))
        return true
    }


    /**
     * Attempts to initialise the Project with a specific config
     * @param project_root The path for the root of the project
     * @param new_config Optional; The config for the project. When undefined, attempts to load the config with this.loadConfig()
     * @return {boolean} Returns true if config is successfully set or loaded.
     */
    public Initialise(project_root: string, new_config?: McRSConfig): boolean {
        this.#project_root = project_root
        if (new_config) {
            this.#config = new_config
            this.saveConfig()
            return true
        }
        return this.loadConfig()
    }

    public get mcResourcePackPath() {
        return path.resolve(resolvePathEnvVars(this.config.mc_resourcepack_folder))
    }

}

export const Project = new Project_()
