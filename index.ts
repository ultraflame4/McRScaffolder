#!/usr/bin/env tsx
import chalk from "chalk";
import pkg from "./package.json"

function main_menu() {
    console.log(
        chalk.green("McRScaffolder") +
        chalk.dim(` v${pkg.version}`))

}


main_menu()
