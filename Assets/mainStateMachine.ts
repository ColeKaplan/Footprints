// main.ts

import { MicController } from "./voiceRecognition"
import { EventDispatcher } from './eventDispatcher';

type Mode = "creator" | "explorer" | "undefined";

class User {
    mode: Mode;

    constructor(mode: Mode = "undefined") {
        this.mode = mode;
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
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.micController.events.on('commandDetected', (command: string) => {
            this.handleCommand(command);
        });
    }

    private handleCommand(command: string) {
        if (this.user.mode === "undefined") {
            if (command === "start") {
                this.user.setMode("creator");
                this.createMemory();
            } else if (command === "join") {
                this.user.setMode("explorer");
                this.locateMemories();
            }
        } else {
            print(`Command "${command}" ignored. Already in ${this.user.mode} mode.`);
        }
    }

    private createMemory() {
        print("Creating memory");
        // Add logic for creating a memory here
    }

    private locateMemories() {
        print("Finding memories nearby");
        // Add logic for locating memories here
    }
}
