import {Project} from "./project";
import chokidar from "chokidar"
import ora from "ora"
import chalk from "chalk";



class Watcher{
    private spinner = ora({
        color:"magenta"
    })
    private logRaw(prefix: string, desc: string, path_: string) {
        this.spinner.clear()
        console.log(prefix,desc,chalk.dim(path_))
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
    public run() {
        const proj_pack_path = Project.resolve(Project.config.pack_name)

        this.spinner.start(`Watching ${proj_pack_path} for changes...`)

        const watcher = chokidar.watch(proj_pack_path,{
            awaitWriteFinish: {
                pollInterval:100,
                stabilityThreshold:500
            }
        });

        watcher.on("add", (path)=>{
            this.logAdd(path,"file")
        });
        watcher.on("change", (path)=>{
           this.logModfied(path,"file")
        });
        watcher.on("unlink", (path)=>{
            this.logRemove(path,"file")
        });

        watcher.on("addDir", (path) => {
            this.logAdd(path,"directory")
        });
        watcher.on("unlinkDir", (path) => {
            this.logRemove(path,"directory")
        });

        watcher.on("error", (e)=>{
            console.log("\n"+chalk.redBright(`x Error -`), e)
            watcher.close().then(value => this.spinner.fail("Error occured while file watching. Watch stopped."))

        })
    }
}

export default new Watcher()
