// voice.ts

import AnchorPlacementController from './AnchorPlacementController';

@component
export class MicController extends BaseScriptComponent {

    @input AnchorController : AnchorPlacementController;

    private vmlModule: VoiceMLModule = require("LensStudio:VoiceMLModule");
    private isListening: boolean = false;

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
                if (this.containsAnyOf(transcription, ["pop", "pap", "pup", "top", "pot"])) {
                    this.textRecording = false;
                    const endSnapIndex = this.findEarliest(this.text, ["pop", "pap", "pup", "top", "pot"])
                    this.AnchorController.sendRecording(this.text.substring(0,endSnapIndex))
                    this.text = ""
                }
            }
            else if (this.containsAnyOf(transcription, ["start trail", "tart trail", "star trail"])) {
                this.AnchorController.toggleMode(1)
            }
            else if (this.containsAnyOf(transcription, ["join trail", "joint rail", "jiont trail", "join rail"])) {
                this.AnchorController.toggleMode(2)
            }
            else if (this.containsAnyOf(transcription, ["snap", "snip", "nap", "snack"])) {
                this.textRecording = true;
                print("recording")
                this.AnchorController.playBubbleAudio()
                // TODO: start recording transcript
                // TODO: if "end snap" detected, stop transcription
                // Optional: use GPT to perform grammatical correction
                // Send to a text object that is connected to the bubble
                // 
            } else if (this.containsAnyOf(transcription, ["end trail", "in trail", "entrail", "into trail", "in the trail"])) {
                this.AnchorController.toggleMode(0)
            } else if (this.containsAnyOf(transcription, ["clear", "clean"])) {
                this.AnchorController.clear()
            }
        }
    }

    private containsAnyOf(transcription : string, keywords : string[]) : boolean {
        var found = false;
        for (var word of keywords) {
            if (transcription.includes(word)) {
                return true
            }
        }
        return false
    }

    private findEarliest(transcription : string, keywords : string[]) : number {
        var closestIndex = -1;
        for (var word of keywords) {
            if (transcription.includes(word)) {
                var index = transcription.indexOf(word)
                closestIndex = closestIndex == -1 ? index : Math.min(closestIndex, index)
                print("closestIndex: " + closestIndex)
            }
        }
        return closestIndex
    }

    public toggleBubble() {
        if (this.textRecording == false) {
            this.textRecording = true;
            print("recording")
        } else {
            this.textRecording = false;
            this.AnchorController.sendRecording(this.text)
            this.text = ""
        }
    }


}