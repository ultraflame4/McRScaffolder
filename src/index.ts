#!/usr/bin/env tsx
import pkg from "../package.json";
import {program} from "commander";
import {PrintVersion} from "./tools";
import path from "path";
import chalk from "chalk";

PrintVersion()
program
    .name(pkg.name)
    .description(pkg.description)
    .version(pkg.version)
    .argument("[project_path]",
        "Path to the project root where the mcrs.config.json config file is. " +
        "Will create a new project if the path or the file does not exist.",
        ".")
    .action((raw_project_path: string) => {
        const project_path = path.resolve(raw_project_path);
        console.log(chalk.whiteBright("Resolved project path to:"),chalk.greenBright(project_path))
    })

program.parse()


