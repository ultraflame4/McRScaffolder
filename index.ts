#!/usr/bin/env tsx
import chalk from "chalk";

function main_menu() {
    console.log(
        chalk.green("McRScaffolder") +
        chalk.dim(` v${process.env.npm_package_version}`))

}


main_menu()
