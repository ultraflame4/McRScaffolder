import {IMenuConfig} from "../prompts/menu";
import {SearchList} from "../prompts/searchlist";
import {ProjectAsset, ProjectAssetsManager} from "../resources/ProjectAssetsManager";
import figureSet from "figures";
import chalk from "chalk";
import {ITextureAsset} from "../resources/common"

export type ProjectTexturedAsset = ProjectAsset<ITextureAsset>

export async function add_texture_asset(asset: ProjectTexturedAsset) {
    let textures = await asset.asset.GetTextures()
    // const
}

export async function menu_items() {

    let items_ = await ProjectAssetsManager.get_items()
    console.log(items_)
    const ans = await SearchList({
        message: "Item Assets",
        allowCancel: true,
        choices: items_.map(x => {
            return {
                id: x.asset.item_id.toString(),
                text: `[${x.added ? figureSet.tick : figureSet.arrowDown}] ${x.asset.item_id}`,
                // description: chalk.yellow("? Missing Item. ") + `Add ${x.asset.item_id.toString()} to the project`
                description:
                    chalk.yellow("? Missing Asset. ") +
                    chalk.greenBright.italic(`Select`) +
                    chalk.dim.italic(` to `) +
                    chalk.whiteBright.italic(`Download & Add`) +
                    chalk.dim.italic(` to project`),
                data: x as ProjectTexturedAsset
            }
        })
    })

    const selected_item = ans.data as ProjectTexturedAsset

    if (!selected_item.added){
        await add_texture_asset(selected_item)
    }
    else {

    }
}


export const menu_assets: IMenuConfig = {
    title: "Asset",
    options: [
        {title: "Items", custom: menu_items},
        {title: "Blocks"}
    ]
}