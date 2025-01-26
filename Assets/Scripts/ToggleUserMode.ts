import { ButtonFeedback } from "../SpectaclesInteractionKit/Components/Helpers/ButtonFeedback";
import { PinchButton } from "../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import AnchorPlacementController from "./AnchorPlacementController";
import { MicController } from "./voiceRecognition";

@component
export class ToggleUserMode extends BaseScriptComponent {

    //search is in reference to search mode
    @input search: PinchButton; 
    @input searchBFComponent : ButtonFeedback;

    @input creator: PinchButton;
    @input creatorBFComponent : ButtonFeedback;

    @input explorer: PinchButton; 
    @input explorerBFComponent : ButtonFeedback;

    @input creatorScript: AnchorPlacementController;
    @input voiceRecognition: MicController;
    @input userModeText: Text;
    @input bubbleToggle: PinchButton
    @input bubbleToggleText: Text;

    private creatorMode = true;

    //sysset round 7 is unselected idle
    //sysset round 2 is selected idle
    @input unselectedMaterial : Material;
    @input selectedMaterial : Material;


    onAwake() {
        this.createEvent('OnStartEvent').bind(() => {
            //this.searchBFComponent.meshIdleMaterial = this.selectedMaterial;


            this.onStart();
          });
    }

    onStart() {
        this.search.onButtonPinched.add(() => {
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
