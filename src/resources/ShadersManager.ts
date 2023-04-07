import {Project} from "../project";

class ShadersManager{
    /**
     * Release time of 21w10a, the version where vanilla shaders were made available
     */
    public readonly shaders_avail_time:number = Date.parse("2021-03-10T15:24:38+00:00")

    public get available():boolean {
        return Date.parse(Project.config.version_release_time) >= this.shaders_avail_time
    }
}

export default new ShadersManager()
