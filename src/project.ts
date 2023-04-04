import {McRSConfig} from "./types";
import path from "path";
import fs from "fs";


class Project_ {

    /// Project Root
    #project_root: string | null
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
     * Attempts to initialise the Project
     * @param project_root The path for the root of the project
     * @param new_config Optional; The config for the project. When undefined, attempts to load the config with this.loadConfig()
     * @return {boolean} Returns true if config is successfully set or loaded.
     */
    public Initialise(project_root: string, new_config?: McRSConfig) {
        this.#project_root = project_root
        if (new_config) {
            this.#config = new_config
            this.saveConfig()
            return true
        }

        return this.loadConfig()

    }


}

export const Project = new Project_()
