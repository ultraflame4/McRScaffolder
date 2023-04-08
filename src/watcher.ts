class Watcher{
    public isRunning: boolean = false;

    /**
     * Starts watching for file changes
     */
    public start() {
        this.isRunning=true
    }

    /**
     * Stops watching for file changes.
     */
    public stop() {
        this.isRunning=false
    }
}

export default new Watcher()
