import inquirer, {Answers, QuestionCollection} from "inquirer";
import ora from "ora";
import SummaryManager from "../resources/SummaryManager";
import AssetsManager from "../resources/AssetsManager";
import chalk from "chalk";
import {SearchList} from "../prompts/searchlist";

export async function ask_new_block() {

    const spinner = ora("Getting blocks...")
    spinner.start()
    const item_list = await SummaryManager.read_blocks();
    spinner.succeed()

    const block = (await SearchList(
        {
            message: "Select block",
            choices:item_list.map(x=>{
                return {
                    id: x,
                    text: x
                }
            })
        }
    )).id

    let textures = await SummaryManager.get_block_textures(block)
    if (textures.length < 1) {
        console.log(chalk.redBright(`Error: ${block} does not have any textures!`))
        return
    }
    const spinner2 = ora(`Downloading ${textures.length} block textures...`);
    spinner2.start()
    await AssetsManager.downloadTextures(...textures)
    spinner2.succeed()

    return
}
