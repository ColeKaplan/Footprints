import { PinchButton } from "../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import AnchorPlacementController from "./AnchorPlacementController";
import { MicController } from "./voiceRecognition";

@component
export class ToggleUserMode extends BaseScriptComponent {

    @input undefined: PinchButton; 
    @input creator: PinchButton; 
    @input explorer: PinchButton; 
    @input creatorScript: AnchorPlacementController;
    @input voiceRecognition: MicController;
    @input userModeText: Text;
    @input bubbleToggle: PinchButton
    @input bubbleToggleText: Text;

    private creatorMode = true;


    onAwake() {
        this.createEvent('OnStartEvent').bind(() => {
            this.onStart();
          });
    }

    onStart() {
        this.undefined.onButtonPinched.add(() => {
            this.creatorScript.toggleMode(0);
        })

        this.creator.onButtonPinched.add(() => {
            this.creatorScript.toggleMode(1);
        })

        this.explorer.onButtonPinched.add(() => {
            this.creatorScript.toggleMode(2);
        })

        this.bubbleToggleText.text = "Bubble Start"

        this.bubbleToggle.onButtonPinched.add(() => {
            this.voiceRecognition.toggleBubble();
            if (this.bubbleToggleText.text === "Bubble Start") {
                this.bubbleToggleText.text = "Bubble Stop"
            } else {
                this.bubbleToggleText.text = "Bubble Start"
            }
        })
    }
}
