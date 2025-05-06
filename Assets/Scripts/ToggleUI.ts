import { Interactable } from "../SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable";
import { PinchButton } from "../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { InteractorEvent } from "../SpectaclesInteractionKit/Core/Interactor/InteractorEvent";

@component
export class ToggleUI extends BaseScriptComponent {

    @input Toggle : PinchButton
    @input ui : SceneObject

    private visible : boolean = false

    onAwake() {

        this.createEvent('OnStartEvent').bind(() => {
            this.onStart();
          });
    }

    onStart() {
        print("got to start UI toggling")

        this.Toggle.onButtonPinched.add(() => {
            print("clicked UI toggle")
            this.visible = !this.visible
            this.ui.enabled = this.visible
        })
    }
}
