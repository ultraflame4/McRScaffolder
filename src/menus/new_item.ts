import inquirer, {Answers, QuestionCollection} from "inquirer";
import ora from "ora";
import SummaryManager from "../resources/SummaryManager";

export async function ask_new_item() {

    const spinner = ora("Getting items...")
    spinner.start()
    const item_list = await SummaryManager.read_items();
    spinner.stop()
    const item = (await inquirer.prompt(
        {
            name:"item_id",
            message: "Select item",
            //@ts-ignore
            type: "search-list",
            choices:item_list
        }
    ))["item_id"]

    console.log("\n\nItem textures")
    console.log(await SummaryManager.get_item_textures(item))

    return
}
