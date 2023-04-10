import {Project} from "./project";
import chokidar from "chokidar"
import ora from "ora"
import chalk from "chalk";

import path from "path";
import * as readline from "readline";
import {program} from "commander";
import fs from "fs";
import {pathIsDir} from "./tools";



class Watcher{
    private spinner = ora({
        color:"magenta",

    })
    private watcher: chokidar.FSWatcher;
    private logRaw(prefix: string, desc: string, path_: string,ignored:boolean=false) {
        this.spinner.clear()
        if (ignored){
            console.log(prefix,desc,chalk.cyan(this.relPath(path_)),chalk.dim.italic("Directory events are ignored."))
            return
        }
        console.log(prefix,desc,chalk.cyan(this.relPath(path_)),chalk.dim("Reflected in",this.resolveDest(path_)))
    }
    private logAdd(path:string,type_:string,ignored:boolean=false) {
        this.logRaw(chalk.greenBright("+"),`Added ${type_}`,path,ignored)
    }
    private logModfied(path:string,type_:string) {
        this.logRaw(chalk.yellowBright("~"),`Modified ${type_}`,path)
    }
    private logRemove(path:string,type_:string,ignored:boolean=false) {
        this.logRaw(chalk.redBright("-"),`Removed ${type_}`,path,ignored)
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
        if (!pathIsDir(Project.mcResourcePackPath)) {
            console.log(
                chalk.red.bold("Fatal Error !!"),
                "Minecraft resource pack folder:",
                chalk.yellow.bold(Project.mcResourcePackPath),
                "does not exist!"
            )
            console.log(chalk.cyan.dim("This is a precaution against accidental mistakes. Create the folder manually (and rerun) if you intend to continue."))
            return
        }


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
            disableGlobbing:false,
            ignored:(testString) =>{
                if (pathIsDir(testString)) {
                    return false
                }
                let regex = new RegExp(/^.*(\.png|\.json|\.fsh|\.vsh|\.glsl)$/)
                return !regex.test(testString);
            }
        });

        this.watcher.on("add", (path_)=>{
            this.logAdd(path_,"file")
            fs.cpSync(path_,this.resolveDest(path_),{
                recursive:true,
                force:true,
            })
        });
        this.watcher.on("change", (path_)=>{
           this.logModfied(path_,"file")
            fs.mkdirSync(path.dirname(path_),{recursive:true})
            fs.cpSync(path_,this.resolveDest(path_),{
                recursive:true,
                force:true,
            })
        });
        this.watcher.on("unlink", (path)=>{
            this.logRemove(path,"file")
            if (fs.existsSync(path)){
                fs.unlinkSync(this.resolveDest(path))
            }
        });

        this.watcher.on("addDir", (path) => {
            const rel_path = this.relPath(path)
            if (rel_path === "") {
                return
            }
            this.logAdd(path,"directory",true);
            // fs.mkdirSync(this.resolveDest(path),{recursive:true})
        });
        this.watcher.on("unlinkDir", (path) => {
            const rel_path = this.relPath(path)
            if (rel_path === "") {
                console.error("Watched path removed!",path)
                this.failWatch()
                return
            }
            this.logRemove(path,"directory",true)
            // fs.rmSync(this.resolveDest(path),{ recursive: true, force: true })
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
