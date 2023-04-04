#!/usr/bin/env tsx
import pkg from "../package.json";
import {program} from "commander";
import {GetProjectConfig, PrintVersion} from "./tools";
import path from "path";
import chalk from "chalk";
import {create_project_menu, start_menu} from "./general_menus";

PrintVersion()
program
    .name(pkg.name)
    .description(pkg.description)
    .version(pkg.version)
    .argument("[project_path]",
        "Path to the project root where the mcrs.config.json config file is. " +
        "Will create a new project if the path or the file does not exist.",
        ".")
    .action(async (raw_project_path: string) => {
        const project_path = path.resolve(raw_project_path);
        console.log(chalk.whiteBright("Project root set to:"),chalk.greenBright(project_path))

        let project_config = GetProjectConfig(project_path)
        if (project_config === null) {
            project_config = await create_project_menu(project_path)
        }
        await start_menu(project_config,project_path)
    })

program.parse()


