import {ResourcePackItemAsset} from "./common";
import SummaryManager from "./SummaryManager";

interface ProjectAsset<A> {
    added: boolean
    asset: A
}


class AssetManager_{

    public async get_items(): Promise<ProjectAsset<ResourcePackItemAsset>[]> {
        let raw_itemlist = await SummaryManager.get_items()

        let all_items: ProjectAsset<ResourcePackItemAsset>[] =
            await Promise.all(
                raw_itemlist.map( async  x=>  {
                    return {added: false, asset: await ResourcePackItemAsset.fromItemId(x)}
                })
            )

        return all_items
    }
}

export const ProjectAssetsManager = new AssetManager_()