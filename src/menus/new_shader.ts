import ShadersManager from "../resources/ShadersManager";
import chalk from "chalk";
import ora from "ora"
import {ShaderResource} from "../core/types";
import AssetsManager from "../resources/AssetsDownloader";
import {SearchList} from "../prompts/searchlist";

export async function ask_new_shader() {

    if (!ShadersManager.available) {
        console.log(chalk.redBright("Shaders not available for this version of minecraft!"))
        return
    }

    const spinner = ora("Getting shader list...")
    spinner.start()
    const shaders = await ShadersManager.getShadersList();
    spinner.succeed()

    const ans = await SearchList({
        message: "Select shader",
        choices:shaders.map(x=>{return {id:x.name,data:x}}),
        allowCancel: true
    })
    if (ans === null) return;
    const shader = ans.data as ShaderResource
    const spinner2 = ora(`Downloading ${shader.files.length} shader files...`)
    spinner2.start()
    await AssetsManager.downloadAsset(shader.files,"shaders")
    spinner2.succeed()
    return
}
