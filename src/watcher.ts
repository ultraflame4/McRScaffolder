import {Project} from "./project";
import chokidar from "chokidar"
import ora from "ora"
import chalk from "chalk";

import path from "path";
import * as readline from "readline";
import {program} from "commander";



class Watcher{
    private spinner = ora({
        color:"magenta",

    })
    private watcher: chokidar.FSWatcher;
    private logRaw(prefix: string, desc: string, path_: string) {
        this.spinner.clear()
        console.log(prefix,desc,chalk.cyan(this.relPath(path_)),chalk.dim("Reflected in",this.resolveDest(path_)))
    }
    private logAdd(path:string,type_:string) {
        this.logRaw(chalk.greenBright("+"),`Added ${type_}`,path)
    }
    private logModfied(path:string,type_:string) {
        this.logRaw(chalk.yellowBright("~"),`Modified ${type_}`,path)
    }
    private logRemove(path:string,type_:string) {
        this.logRaw(chalk.redBright("-"),`Removed ${type_}`,path)
    }

    /**
     * Returns the path relative to the project's resourcepack root
     * @param path_
     */
    private relPath(path_: string):string {
        return path.relative(Project.resolve(Project.config.pack_name),path_)
    }
    private resolveDest(path_: string) {
        return path.resolve(Project.mcResourcePackPath,Project.config.pack_name,this.relPath(path_))
    }

    private failWatch() {
        this.watcher.close().then(() => {
            this.spinner.clear()
            console.error("Error occurred while file watching. Watch stopped.")
            process.exit(100)
        })
    }
    public run() {
        const proj_pack_path = Project.resolve(Project.config.pack_name)

        this.spinner.start([
            "Watching",
            proj_pack_path,
            "for changes...",
            chalk.dim("(Ctrl+C to quit)")
        ].join(" "))

        this.watcher = chokidar.watch(proj_pack_path,{
            awaitWriteFinish: {
                pollInterval:100,
                stabilityThreshold:500
            },
            persistent:true,
        });

        this.watcher.on("add", (path)=>{
            this.logAdd(path,"file")

        });
        this.watcher.on("change", (path)=>{
           this.logModfied(path,"file")
        });
        this.watcher.on("unlink", (path)=>{
            this.logRemove(path,"file")
        });

        this.watcher.on("addDir", (path) => {
            const rel_path = this.relPath(path)
            if (rel_path === "") {
                return
            }
            this.logAdd(path,"directory");
        });
        this.watcher.on("unlinkDir", (path) => {
            const rel_path = this.relPath(path)
            if (rel_path === "") {
                this.failWatch()
                return
            }
            this.logRemove(path,"directory")
        });

        this.watcher.on("error", (e)=>{
            console.log("\n"+chalk.redBright(`x Error -`), e.message)
            // @ts-ignore
            if (e.code==="EPERM") {
                return
            }
            this.failWatch()
        })

        process.on('exit',()=>{
            this.spinner.fail("Stopped because process exited")
        })

        readline.emitKeypressEvents(process.stdin)
        process.stdin.on("keypress",(ch,key)=>{
            if (key && key.ctrl && key.name === "c") {
                process.exit()
            }
        })
        process.stdin.setRawMode(true)
    }
}

export default new Watcher()