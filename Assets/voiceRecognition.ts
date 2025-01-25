// voice.ts

import { mainStateMachine } from './mainStateMachine';

@component
export class MicController extends BaseScriptComponent {
    private vmlModule: VoiceMLModule = require("LensStudio:VoiceMLModule");
    private isListening: boolean = false;
    private stateMachine: mainStateMachine;

    onAwake() {
        this.vmlModule.onListeningEnabled.add(() => {
            let options = VoiceML.ListeningOptions.create();
            options.shouldReturnInterimAsrTranscription = true;
            this.vmlModule.onListeningUpdate.add(this.onSpeak);
            this.vmlModule.startListening(options);
            this.isListening = true;

        });
        print("voice recognition awake")
    }

    onSpeak = (result: VoiceML.ListeningUpdateEventArgs) => {
        if (result.isFinalTranscription) {
            const transcription = result.transcription.toLowerCase();
            if (transcription.includes("start trail")) {
                this.stateMachine.handleCommand("start")
            }
            else if (transcription.includes("join trail")) {
                this.stateMachine.handleCommand("join")
            }
            else if (transcription.includes("snap this")) {
                this.stateMachine.handleCommand("snap")
            }
        }
    }
}
