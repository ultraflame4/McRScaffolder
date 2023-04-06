import inquirer, {Answers, QuestionCollection} from "inquirer";
import ora from "ora";
import SummaryManager from "../resources/SummaryManager";
import AssetsManager from "../resources/AssetsManager";
import {ResourceName} from "../types";

export async function ask_new_texture() {

    const spinner = ora("Getting textures...")
    spinner.start()
    const item_list = await SummaryManager.read_textures();
    spinner.succeed()

    const texture = (await inquirer.prompt(
        {
            name:"texture_id",
            message: "Search & download textures",
            //@ts-ignore
            type: "search-list",
            choices:item_list
        }
    ))["texture_id"]

    const spinner2 = ora(`Downloading texture ${texture}...`)
    spinner2.start()
    await AssetsManager.downloadTextures(ResourceName.fromString(texture))
    spinner2.succeed()

    return
}
