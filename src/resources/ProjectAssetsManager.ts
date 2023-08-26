import {ResourcePackItemAsset} from "./common";
import SummaryManager from "./SummaryManager";

export interface ProjectAsset<A> {
    added: boolean
    asset: A
}


class AssetManager_{

    public async get_items(): Promise<ProjectAsset<ResourcePackItemAsset>[]> {
        let all_items: ProjectAsset<ResourcePackItemAsset>[] =
            await Promise.all(
                (await SummaryManager.get_items()).map( async  x=>  {
                    return {added: false, asset: await ResourcePackItemAsset.fromItemId(x)}
                })
            )

        return all_items
    }
}

export const ProjectAssetsManager = new AssetManager_()