import {GetPackSummaryDownload, GetPackVersions} from "./tools";
import inquirer from "inquirer";
import chalk from "chalk";
import pkg from "../package.json";
import ora from 'ora';

function choose_version() {
    const spinner = ora("Getting versions...")
    spinner.start()
    GetPackVersions().then(value => {
        spinner.stop()
        return inquirer.prompt({
            name: "Select Minecraft version intended for the resourcepack",
            suffix: " The files included can vary even for versions within same pack format",
            type: "rawlist",
            default: value.findIndex(x => x.stable),
            choices: value.map(x => {
                return {
                    name: `${x.name}`,
                    value: x.id
                }
            })
        })
    }).then(value => {
        let downloadLink = GetPackSummaryDownload(value["Select Minecraft version"])
        console.log(
            chalk.green("Resolved download link to:"),
            chalk.underline.cyanBright(downloadLink)
        )
    })

}


function start_menu() {

}
