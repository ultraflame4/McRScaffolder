import {select} from "@inquirer/prompts";
import AssetManager from "../assets/AssetManager";


async function menu_blocks_list() {
    AssetManager.blocks.load()
    const answer = await select({
        message: "Existing Blocks",
        choices: AssetManager.blocks.assets.map(x=>{
            return {
                name: x.block_id,
                value: x.block_id
            }
        })
    })
}

/**
 * main menu for editing assets
 */
export async function menu_assets(){
    const answer = await select(
        {
            message: "Existing Assets",
            choices: [
                // {name: "Items", value: "item"},
                {name: "Blocks", value: "block"}
            ]
        }
    )

     switch (answer) {
         case "block":
             await menu_blocks_list()
             break;

         default:
             break;
     }


    return
}