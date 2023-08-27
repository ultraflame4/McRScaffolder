import {ISaveableAsset, ResourcePackItemAsset} from "./common";
import SummaryManager from "./SummaryManager";

export interface ProjectAsset<A> {
    added: boolean
    asset: A
}

class AssetManager_{

    public async get_items(): Promise<ProjectAsset<ResourcePackItemAsset>[]> {
        return await Promise.all(
            (await SummaryManager.get_items()).map(async x => {
                let item = await ResourcePackItemAsset.fromItemId(x)
                return {added: item.exists(), asset: item}
            })
        )
    }

    public async save_item(item_asset: ProjectAsset<ISaveableAsset>) {
        await item_asset.asset.write()
    }
}

export const ProjectAssetsManager = new AssetManager_()