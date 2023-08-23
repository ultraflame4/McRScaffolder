import {BlockAsset} from "./BlockAsset";
import fs from "fs";
import {Project} from "../core/project";

class AssetRegistry<T> {
    public items: T[] = []
    private registry_name: string

    constructor(registry_name) {
        this.registry_name = registry_name;
    }

    public add(asset: T): T {
        this.items.push(asset)
        return asset
    }

    public get filepath(): string {
        return Project.resolve(`mcrs.${this.registry_name}.assets.json`)
    }

    public write() {
        fs.writeFileSync(this.filepath, JSON.stringify(this.items))
    }

}

class AssetManager {


    public readonly blocks = new AssetRegistry<BlockAsset>("blocks")


    public Write() {
        this.blocks.write()
    }
}

export default new AssetManager()