// main.ts

import { MicController } from "./voiceRecognition"

type Mode = "creator" | "explorer" | "undefined";

class User {
    mode: Mode;
    trail_id: number;
    constructor(mode: Mode = "undefined") {
        this.mode = mode;
        this.trail_id = -1;
    }

    setMode(mode: Mode) {
        this.mode = mode;
        print(`User mode changed to: ${mode}`);
    }
}

@component
export class mainStateMachine extends BaseScriptComponent {
    private micController: MicController;
    private user: User;



    onAwake() {
        this.micController = new MicController();
        this.user = new User(); // Starts in "undefined" mode
        print('state machine awake')
    }

    public handleCommand(command: string) {
        if (this.user.mode === "undefined") {
            if (command === "start") {
                this.user.setMode("creator");
                this.createTrail();
            } else if (command === "join") {
                this.user.setMode("explorer");
                let memoriesNearby = this.locateMemories();
                if (memoriesNearby) {
                    // join nearest trail
                }
                else {
                    // play error sound
                }
            }
        }
        if (command == "snap") {
            if (this.user.mode === "undefined") {
                this.createMemory(-1);
            }
            else {
                this.createMemory(this.user.trail_id);
            }

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
