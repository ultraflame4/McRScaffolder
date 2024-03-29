#!/usr/bin/env node
import pkg from "../package.json";
import {program} from "commander";
import {PrintVersion} from "./core/tools";
import path from "path";
import chalk from "chalk";
import {Project} from "./core/project";
import {create_project_menu} from "./menus/create_project";
import watcher from "./watcher";
import {MenuManager} from "./prompts/menu";
import {menu_start} from "./menus/general_menus";

PrintVersion()
program.description(pkg.description)
    .version(pkg.version)

program.command("open")
    .description("Opens or creates an existing project.")
    .argument("[project_path]",
        "Path to the project root where the mcrs.config.json config file is. " +
        "Will create a new project if the path or the file does not exist.",
        ".")
    .action(async (raw_project_path: string) => {
        const project_path = path.resolve(raw_project_path);
        console.log(chalk.whiteBright("Resolved path to:"), chalk.greenBright(project_path))
        if (!Project.Initialise(project_path)) {
            console.log(chalk.greenBright("No existing project found. Creating new project..."))
            await create_project_menu(project_path)
        }
        console.log(chalk.whiteBright("Opening project at"), chalk.greenBright(project_path))
        await MenuManager.show(menu_start)
    })


program.command("watch")
    .description("Watch mode, will copy whatever in the project resource pack into the minecraft resource pack folder (specified in mcrs.config.json)." +
        "Useful when working on and testing a resource pack; changes will be copied over, however f3+T is still needed to reload the resource pack.")
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


