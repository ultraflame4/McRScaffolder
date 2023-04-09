#!/usr/bin/env tsx
import pkg from "../package.json";
import {program} from "commander";
import {PrintVersion} from "./tools";
import path from "path";
import chalk from "chalk";
import {start_menu} from "./menus/general_menus";
import {Project} from "./project";
import {create_project_menu} from "./menus/create_project";
import inquirer from "inquirer";
import inquirer_search_list from "inquirer-search-list"

import watcher from "./watcher";

inquirer.registerPrompt('search-list', inquirer_search_list);


PrintVersion()
program.description(pkg.description)
    .version(pkg.version)

program.command("open")
    .argument("[project_path]",
        "Path to the project root where the mcrs.config.json config file is. " +
        "Will create a new project if the path or the file does not exist.",
        ".")
    .action(async (raw_project_path: string) => {
        const project_path = path.resolve(raw_project_path);
        console.log(chalk.whiteBright("Project root set to:"), chalk.greenBright(project_path))


        if (!Project.Initialise(project_path)) {
            await create_project_menu(project_path)
        }

        await start_menu()
    })


program.command("watch")
    .argument("[project_path]",
        "Path to the project root where the mcrs.config.json config file is.",
        ".")
    .action(async (raw_project_path: string) => {
        if (!Project.Initialise(path.resolve(raw_project_path))) {
            console.log(chalk.redBright("Error!"),"Cannot find project in current directory. Please initialise a project with `mcrs open` first!")
            return
        }
        watcher.run()
    })

program.parse()


