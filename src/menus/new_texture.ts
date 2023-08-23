import ora from "ora";
import SummaryManager from "../resources/SummaryManager";
import AssetsManager from "../resources/AssetsDownloader";
import {ResourceName} from "../core/types";
import {SearchList} from "../prompts/searchlist";

export async function ask_new_texture() {

    const spinner = ora("Getting textures...")
    spinner.start()
    const item_list = await SummaryManager.read_textures();
    spinner.succeed()

    const texture = (await SearchList(
        {
            message: "Search & download textures",
            choices: item_list.map(x => {
                return {id: x}
            }),
            allowCancel: true
        }
    ))
    if (texture === null) return;
    const spinner2 = ora(`Downloading texture ${texture.id}...`)
    spinner2.start()
    await AssetsManager.downloadTextures(ResourceName.fromString(texture.id))
    spinner2.succeed()

    return
}
