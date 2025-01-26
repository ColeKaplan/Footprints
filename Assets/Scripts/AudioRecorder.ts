@component
export class AudioController extends BaseScriptComponent {
    private vmlModule: VoiceMLModule = require("LensStudio:VoiceMLModule");
    private isListening: boolean = false;
    private createOrFollowDetected: boolean = false;
    private isCreator: boolean = false;

    onAwake() {
        this.vmlModule.onListeningEnabled.add(() => {
            let options = VoiceML.ListeningOptions.create();
            options.shouldReturnInterimAsrTranscription = true;
            this.vmlModule.onListeningUpdate.add(this.onSpeak);
            this.vmlModule.startListening(options);
            this.isListening = true;
        });
    }

    onSpeak = (result: VoiceML.ListeningUpdateEventArgs) => {
        if (!this.createOrFollowDetected && result.isFinalTranscription) {
            if (result.transcription.toLowerCase().includes("start")) {
                print("start: in creator mode")
                this.createOrFollowDetected = true
                this.isCreator = true
                // TODO: trigger creator event
            }
            else if (result.transcription.toLowerCase().includes("follow")) {
                print("follow: in follower mode")
                this.createOrFollowDetected = true
                this.isCreator = false
                // TODO: check if there is a trail nearby
                // TODO: if yes, trigger follow
            }
            else if (result.transcription.toLowerCase().includes("snap")) {
                print("snap: 'error, not in creator or follower mode'")

            }
        }
        if (this.checkIsCreator() && result.isFinalTranscription) {
            if (result.transcription.toLowerCase().includes("snap")) {
                print("snap: create new memory")
                // TODO: call a function to trigger memory creation
            }
        }
    }

    checkIsCreator = (): boolean => {
        if (this.createOrFollowDetected && this.isCreator) {
            return true;
        } else if (this.createOrFollowDetected && !this.isCreator) {
            return false;
        } else {
            // throw new Error("not in creator or follower mode");
        }

    }
}