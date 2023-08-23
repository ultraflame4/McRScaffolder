/*
Test entry file for testing menu prompts
 */


import {MenuManager} from "./menu";
import {input} from "@inquirer/prompts";

async function testCustom():Promise<boolean>{
    let text = await input({
        message:"Do not enter anything!",
    })
    if (text.length > 0) {
        console.log("Oi! Are you blind? Try Again! ")
        return false
    }
    return true;
}

const program = await MenuManager.show({
    title: "Main Menu",
    options: [
        {
            title: "A", options: [
                {title: "1"},
                {title: "2"},
                {title: "3"},
                {title: "Test",custom: testCustom}
            ]
        },
        {title: "B"},
        {title: "C"},
    ]
})