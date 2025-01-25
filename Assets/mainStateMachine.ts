// main.ts

// type Mode = "creator" | "explorer" | "undefined";

// class User {
//     public mode: Mode;
//     trail_id: number;
//     constructor(mode: Mode = "undefined") {
//         this.mode = mode;
//         this.trail_id = -1;
//     }

//     setMode(mode: Mode) {
//         this.mode = mode;
//         print(`User mode changed to: ${mode}`);
//     }
// }

export class mainStateMachine {
    // private user: User;

    private trail_id: number = -1;
    private mode: number = 0

    public handleCommand(command: string) {
        print("we got a command!!!")
        if (this.mode == 0) {
            print("we got inside undefined")
            if (command === "start") {
                // this.mode = "creator";
                this.createTrail();
            } else if (command === "join") {
                // this.mode = "explorer"
                let memoriesNearby = this.locateMemories();
                if (memoriesNearby) {
                    // join nearest trail
                }
                else {
                    // play error sound
                }
            }
        }
        print("mode is: " + this.mode)
        if (command == "snap") {
            // if (this.user.mode === "undefined") {
            //     this.createMemory(-1);
            // }
            // else {
            //     this.createMemory(this.user.trail_id);
            // }

        }
    }

    private createTrail() {
        print("Creating trail");
        // Add logic for creating a trail here
    }

    private createMemory(trail_id: number = -1) {

        print(`Creating memory for trail ${trail_id}`);
        // Add logic for creating a memory here
    }

    private locateMemories(): boolean {
        print("Finding memories nearby");
        // Add logic for locating memories here
        return true; // Assuming the function returns true after locating memories
    }
}
