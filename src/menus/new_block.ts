import ora from "ora";
import SummaryManager from "../resources/SummaryManager";
import AssetManager from "../assets/AssetManager";
import {Project} from "../core/project";
import chalk from "chalk";
import {SearchList} from "../prompts/searchlist";
import AssetsDownloader from "../resources/AssetsDownloader";
import {BlockAsset} from "../assets/BlockAsset";

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


    const blockAsset = AssetManager.blocks.add(new BlockAsset(Project, block.id))
    if (! await blockAsset.LoadConfig()) {
        await blockAsset.LoadDefaults()

        let textures =  Object.values(blockAsset.GetTextures());
        if (textures.length < 1) {
            console.log(chalk.redBright(`Error: ${block} does not have any textures!`))
            return
        }

        const spinner2 = ora(`Downloading ${textures.length} block textures...`);
        spinner2.start()
        await AssetsDownloader.downloadTextures(...textures)
        spinner2.succeed()
    }

    AssetManager.blocks.write()

    return
}
