import { PinchButton } from "../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import AnchorPlacementController from "./AnchorPlacementController";

@component
export class ToggleUserMode extends BaseScriptComponent {

    @input undefined: PinchButton; 
    @input creator: PinchButton; 
    @input explorer: PinchButton; 
    @input creatorScript: AnchorPlacementController;
    @input userModeText: Text;

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
    }
}
