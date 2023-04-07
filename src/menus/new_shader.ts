import inquirer from "inquirer";
import ShadersManager from "../resources/ShadersManager";
import chalk from "chalk";
import ora from "ora"
import {ShaderResource} from "../types";
import AssetsManager from "../resources/AssetsManager";

export async function ask_new_shader() {

    if (!ShadersManager.available) {
        console.log(chalk.redBright("Shaders not available for this version of minecraft!"))
        return
    }

    const spinner = ora("Getting shader list...")
    spinner.start()
    const shaders = await ShadersManager.getShadersList();
    spinner.succeed()

    const ans = await inquirer.prompt({
        name:"_",
        //@ts-ignore
        type: "search-list",
        message: "Select shader",
        choices:shaders.map(x=>{return {name:x.name,value:x}})
    })
    const shader:ShaderResource = ans["_"]
    const spinner2 = ora(`Downloading ${shader.files.length} shader files...`)
    spinner2.start()
    await AssetsManager.downloadAsset(shader.files,"shaders")
    spinner2.succeed()
    return
}
