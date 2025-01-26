// voice.ts

import AnchorPlacementController from './AnchorPlacementController';
import { mainStateMachine } from './mainStateMachine';

@component
export class MicController extends BaseScriptComponent {

    @input AnchorController : AnchorPlacementController;

    private vmlModule: VoiceMLModule = require("LensStudio:VoiceMLModule");
    private isListening: boolean = false;
    private stateMachine: mainStateMachine = new mainStateMachine();


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
            print(transcription)
            if (transcription.includes("start trail")) {
                this.stateMachine.handleCommand("start")
                this.AnchorController.toggleMode(1)
            }
            else if (transcription.includes("join trail")) {
                this.stateMachine.handleCommand("join")
                this.AnchorController.toggleMode(2)
            }
            else if (transcription.includes("snap")) {
                this.stateMachine.handleCommand("snap")
            } else if (transcription.includes("end trail")) {
                this.AnchorController.toggleMode(0)
            }
        }
    }
}
