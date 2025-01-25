// voice.ts

import { EventDispatcher2 } from './eventDispatcher2';

@component
export class voiceRecognition2 extends BaseScriptComponent {
    private vmlModule: VoiceMLModule = require("LensStudio:VoiceMLModule");
    private isListening: boolean = false;

    public events: EventDispatcher2 = new EventDispatcher2();

    onAwake() {
        this.createEvent('OnStartEvent').bind(() => {
            this.onStart();
          });
    }

    onStart() {
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
