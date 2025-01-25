// voice.ts

import { EventDispatcher } from './eventDispatcher';

@component
export class MicController extends BaseScriptComponent {
    private vmlModule: VoiceMLModule = require("LensStudio:VoiceMLModule");
    private isListening: boolean = false;

    public events: EventDispatcher = new EventDispatcher();

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
        if (result.isFinalTranscription) {
            const transcription = result.transcription.toLowerCase();
            if (transcription.includes("start")) {
                this.events.emit('commandDetected', 'start');
            }
            else if (transcription.includes("join")) {
                this.events.emit('commandDetected', 'join');
            }
        }
    }
}
