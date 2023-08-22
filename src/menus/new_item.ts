import ora from "ora";
import SummaryManager from "../resources/SummaryManager";
import AssetsManager from "../resources/AssetsManager";
import {SearchList} from "../prompts/searchlist";

export async function ask_new_item() {

    const spinner = ora("Getting items...")
    spinner.start()
    const item_list = await SummaryManager.read_items();
    spinner.succeed()

    const item = (await SearchList(
        {
            message: "Select item",
            choices: item_list.map(x=> {return {id: x}})
        }
    )).id

    const spinner2 = ora("Download textures...")
    spinner2.start()
    await AssetsManager.downloadTextures(...await SummaryManager.get_item_textures(item))
    spinner2.succeed()

    return
}
