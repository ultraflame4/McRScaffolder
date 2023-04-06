import inquirer, {Answers, QuestionCollection} from "inquirer";
import ora from "ora";
import SummaryManager from "../resources/SummaryManager";
import AssetsManager from "../resources/AssetsManager";

export async function ask_new_item() {

    const spinner = ora("Getting items...")
    spinner.start()
    const item_list = await SummaryManager.read_items();
    spinner.succeed()

    const item = (await inquirer.prompt(
        {
            name:"item_id",
            message: "Select item",
            //@ts-ignore
            type: "search-list",
            choices:item_list
        }
    ))["item_id"]

    const spinner2 = ora("Download textures...")
    spinner2.start()
    await AssetsManager.downloadTextures(...await SummaryManager.get_item_textures(item))
    spinner2.succeed()

    return
}
