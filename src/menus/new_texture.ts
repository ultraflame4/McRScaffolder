import ora from "ora";
import SummaryManager from "../resources/SummaryManager";
import AssetsManager from "../resources/AssetsManager";
import {ResourceName} from "../types";
import {SearchList} from "../prompts/searchlist";

export async function ask_new_texture() {

    const spinner = ora("Getting textures...")
    spinner.start()
    const item_list = await SummaryManager.read_textures();
    spinner.succeed()

    const texture = (await SearchList(
        {
            message: "Search & download textures",
            choices:item_list.map(x=>{return {id:x}})
        }
    )).id

    const spinner2 = ora(`Downloading texture ${texture}...`)
    spinner2.start()
    await AssetsManager.downloadTextures(ResourceName.fromString(texture))
    spinner2.succeed()

    return
}
