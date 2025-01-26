// voice.ts

import AnchorPlacementController from './AnchorPlacementController';
import { mainStateMachine } from './mainStateMachine';

@component
export class MicController extends BaseScriptComponent {

    @input AnchorController : AnchorPlacementController;

    private vmlModule: VoiceMLModule = require("LensStudio:VoiceMLModule");
    private isListening: boolean = false;
    private stateMachine: mainStateMachine = new mainStateMachine();

    private text : string = "";
    private textRecording : boolean = false


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
            if (this.textRecording) {
                this.text += transcription
                if (transcription.includes("end snap")) {
                    this.textRecording = false;
                    const endSnapIndex = this.text.indexOf("end snap")
                    this.AnchorController.sendRecording(this.text.substring(0,endSnapIndex))
                    print(this.text)
                    print(this.text.substring(0,endSnapIndex))
                    this.text = ""
                }
            }
            else if (transcription.includes("start trail")) {
                this.stateMachine.handleCommand("start")
                this.AnchorController.toggleMode(1)
            }
            else if (transcription.includes("join trail")) {
                this.stateMachine.handleCommand("join")
                this.AnchorController.toggleMode(2)
            }
            else if (transcription.includes("snap")) {
                this.stateMachine.handleCommand("snap")
                this.textRecording = true;
                // TODO: start recording transcript
                // TODO: if "end snap" detected, stop transcription
                // Optional: use GPT to perform grammatical correction
                // Send to a text object that is connected to the bubble
                // 
            } else if (transcription.includes("end trail")) {
                this.AnchorController.toggleMode(0)
            }
        }
    }
}
