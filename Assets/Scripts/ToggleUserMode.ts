import { PinchButton } from "../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import AnchorPlacementController from "./AnchorPlacementController";

@component
export class ToggleUserMode extends BaseScriptComponent {

    @input toggleButton: PinchButton; 
    @input creatorScript: AnchorPlacementController;
    @input userModeText: Text;

    private creatorMode = true;


    onAwake() {
        this.createEvent('OnStartEvent').bind(() => {
            this.onStart();
          });
    }

    onStart() {
        this.toggleButton.onButtonPinched.add(() => {
            // print("toggleUser")
            if (this.creatorMode) { // Switch to Explorer
                this.userModeText.text = "Explorer"

            } else { // Switch to Creator
                this.userModeText.text = "Creator"
            }

            this.creatorMode = !this.creatorMode
            this.creatorScript.toggleCreatorMode(this.creatorMode);
        })
    }
}
