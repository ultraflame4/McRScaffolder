import AssetManager from "../assets/AssetManager";
import {SearchList} from "../prompts/searchlist";


export async function menu_blocks_list() {
    AssetManager.blocks.load()
    const answer = await SearchList({
        message: "Existing Blocks",
        choices: AssetManager.blocks.assets.map(x=>{
            return {
                id: x.block_id,
                text: x.block_id
            }
        }),
        allowCancel: true
    })
}

