import {Project} from "../project";
import {ResourceName, ShaderResource} from "../types";
import {GetVersionTag} from "../tools";
import {octokit} from "../github";

class ShadersManager {
    /**
     * Release time of 21w10a, the version where vanilla shaders were made available
     */
    public readonly shaders_avail_time: number = Date.parse("2021-03-10T15:24:38+00:00")

    public get available(): boolean {
        return Date.parse(Project.config.version_release_time) >= this.shaders_avail_time
    }

    public get shader_treesha(): string {
        let v_tag = Project.version_tag("assets")
        let asset_path = encodeURIComponent("assets/minecraft/shaders")
        return `${v_tag}:${asset_path}`
    }

    public async getShadersList(): Promise<ShaderResource[]> {
        if (!this.available) {
            return []
        }
        let data = await octokit.request("GET /repos/{owner}/{repo}/git/trees/{tree_sha}", {
            owner: "misode",
            repo: "mcmeta",
            recursive: "true",
            tree_sha: this.shader_treesha
        })

        let files = data.data.tree;

        let shaders: Record<string, ShaderResource> = {};
        files.forEach(x => {
            let shader_name = x.path.replace(/\.[^/.]+$/, "")
            if (shaders[shader_name] === undefined && x.type === "blob") {
                shaders[shader_name] = {
                    name: shader_name,
                    files: []
                }
            }
            shaders[shader_name].files.push(new ResourceName("minecraft", x.path))
        })

        return Object.values(shaders)
    }
}

export default new ShadersManager()
