import ora from "ora";
import SummaryManager from "../resources/SummaryManager";
import AssetsManager from "../resources/AssetsDownloader";
import {SearchList} from "../prompts/searchlist";

export async function ask_new_item() {

    const spinner = ora("Getting items...")
    spinner.start()
    const item_list = await SummaryManager.read_items();
    spinner.succeed()

    const item = (await SearchList(
        {
            message: "Select item",
            choices: item_list.map(x=> {return {id: x}}),
            allowCancel: true
        }
    ))
    if (item == null) return

    const item_model = await SummaryManager.get_item_model(item.id)

    const spinner2 = ora("Download textures...")
    spinner2.start()
    await AssetsManager.downloadTextures(...Object.values(item_model.textures))
    spinner2.succeed()

    return
}
