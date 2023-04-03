#!/usr/bin/env tsx
import chalk from "chalk";
import pkg from "./package.json";
import inquirer from 'inquirer';
import {GetPackSummaryDownload, GetPackVersions} from "./src/tools";
import ora from 'ora';

function choose_version() {
    console.log(
        chalk.green("McRScaffolder") +
        chalk.dim(` v${pkg.version}`))

    const spinner = ora("Getting versions...")
    spinner.start()
    GetPackVersions().then(value => {
        spinner.stop()
        return inquirer.prompt({
            name:"Select Minecraft version",
            type:"rawlist",
            choices:value.map(x => {
                return {
                    name: x.name,
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


choose_version()
