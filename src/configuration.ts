import path from "path";
import {McRSConfig} from "./types";
import fs from "fs";

export function GetConfigPath(project_root: string) {
    return path.resolve(project_root, "mcrs.config.json")
}

/**
 * Finds and returns the project configuration<br>
 * Returns null if it does not exist.<br>
 * @param root_path
 */
export function GetProjectConfig(root_path: string): McRSConfig | null {
    const config_path = GetConfigPath(root_path)
    if (!fs.existsSync(config_path)) {
        return null
    }
    return JSON.parse(fs.readFileSync(config_path, {encoding: 'utf-8'}))
}

export function SaveProjectConfig(root_path: string, new_config:McRSConfig) {
    fs.mkdirSync(root_path, {recursive: true})
    fs.writeFileSync(GetConfigPath(root_path), JSON.stringify(new_config, null, 3))
}

