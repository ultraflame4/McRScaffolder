import ora from "ora";
import SummaryManager from "../resources/SummaryManager";
import AssetsManager from "../resources/AssetsDownloader";
import chalk from "chalk";
import {SearchList} from "../prompts/searchlist";
import TextureManager, {BlockTextureAsset} from "../project/TextureManager";
import {Project} from "../project/project";

export async function ask_new_block() {

    const spinner = ora("Getting blocks...")
    spinner.start()
    const item_list = await SummaryManager.read_blocks();
    spinner.succeed()

    const block = (await SearchList(
        {
            message: "Select block",
            choices: item_list.map(x => {
                return {id: x, text: x}
            }),
            allowCancel: true
        }
    ))
    if (block === null) return;


    const blockAsset = TextureManager.addTextureAsset(new BlockTextureAsset(Project, block.id))
    let textures = await blockAsset.GetResourceNames()
    if (textures.length < 1) {
        console.log(chalk.redBright(`Error: ${block} does not have any textures!`))
        return
    }
    const spinner2 = ora(`Downloading ${textures.length} block textures...`);
    spinner2.start()
    await blockAsset.downloadTextures()
    blockAsset.saveConfig();
    spinner2.succeed()


    //
    // let textures = await SummaryManager.get_block_textures(block.id)
    // if (textures.length < 1) {
    //     console.log(chalk.redBright(`Error: ${block} does not have any textures!`))
    //     return
    // }
    // const spinner2 = ora(`Downloading ${textures.length} block textures...`);
    // spinner2.start()
    // await AssetsManager.downloadTextures(...textures)
    // spinner2.succeed()

    return
}
