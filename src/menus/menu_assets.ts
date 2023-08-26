import {IMenuConfig, MenuManager} from "../prompts/menu";
import {ISearchListChoice, SearchList} from "../prompts/searchlist";
import {ProjectAsset, ProjectAssetsManager} from "../resources/ProjectAssetsManager";
import figureSet from "figures";
import chalk from "chalk";
import {ITextureAsset, ResourcePackTexture} from "../resources/common"
import {input, select, Separator} from "@inquirer/prompts";
import _ from "lodash"
import {ResourceName} from "../core/types";
export type ProjectTexturedAsset = ProjectAsset<ITextureAsset>

enum AddTextureAssetConfigOption {
    _default = "default",
    _custom = "custom"
}

export async function modify_texture_config(asset: ProjectTexturedAsset) {
    let textures = await asset.asset.GetTextures()
    let grouped = _.groupBy(textures,x=>x.model_id)

    while (true){

        let choices: (ISearchListChoice | Separator)[] = []
        Object.entries(grouped).forEach(([k,v])=>{
            choices.push(new Separator(`-----Model: ${k}-----`))
            v.forEach(x=>{
                choices.push({
                    id: x.name,
                    text: `${x.name}: "${x.path.toString()}"`,
                    data: x
                })
            })
        })

        let ans = await SearchList({
            message: `Configuring Asset ${asset.asset.asset_id.toString()} textures`,
            allowCancel: true,
            choices
        })
        if (ans === null) break
        let data = ans.data as ResourcePackTexture

        let tex_path = await input({message:`Texture "${data.name}" resource path`, default:data.path.toString()})
        data.path = ResourceName.fromString(tex_path)
    }
}

export async function add_texture_asset(asset: ProjectTexturedAsset) {

    let option = await select<AddTextureAssetConfigOption>({
        message: "Add Texture Asset Config",
        choices: [
            {name: "Use Defaults", value: AddTextureAssetConfigOption._default},
            {name: "Custom", value: AddTextureAssetConfigOption._custom}
        ]
    })

    if (option == AddTextureAssetConfigOption._custom) {
        await modify_texture_config(asset)
    }
}

export async function menu_items() {

    let items_ = await ProjectAssetsManager.get_items()
    console.log(items_)
    const ans = await SearchList({
        message: "Item Assets",
        allowCancel: true,
        choices: items_.map(x => {
            return {
                id: x.asset.asset_id.toString(),
                text: `[${x.added ? figureSet.tick : figureSet.arrowDown}] ${x.asset.asset_id}`,
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

    if (!selected_item.added) {
        await add_texture_asset(selected_item)
    } else {

    }
}


export const menu_assets: IMenuConfig = {
    title: "Asset",
    options: [
        {title: "Items", custom: menu_items},
        {title: "Blocks"}
    ]
}