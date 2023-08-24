import {BlockAsset} from "./BlockAsset";
import fs from "fs";
import {Project} from "../core/project";

class AssetRegistry<T> {
    public assets: T[] = []
    private registry_name: string

    constructor(registry_name) {
        this.registry_name = registry_name;
    }

    public add(asset: T): T {
        this.assets.push(asset)
        return asset
    }

    public get filepath(): string {
        return Project.resolve(`mcrs.${this.registry_name}.assets.json`)
    }

    public load() {
        let text = fs.readFileSync(this.filepath, {encoding:"utf-8"})
        this.assets = JSON.parse(text)
    }

    public write() {
        fs.writeFileSync(this.filepath, JSON.stringify(this.assets,null, 3))
    }

}

class AssetManager {
    public readonly blocks = new AssetRegistry<BlockAsset>("blocks")

}

export default new AssetManager()