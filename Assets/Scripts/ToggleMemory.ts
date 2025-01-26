import { PinchButton } from "../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";

@component
export class ToggleMemory extends BaseScriptComponent {
    
    @input toggleButton: PinchButton;
    @input memoryButtonText: Text;
    @input @allowUndefined uiObject : SceneObject;

    //memory selection wheel(? ... think emote wheel) is initially set to false
    private memoryMode = false;
    private initialUiObjectState = false;


    onAwake() {
        this.createEvent('OnStartEvent').bind(() => {
            this.uiObject.enabled = this.initialUiObjectState;
            this.onStart();
          });
    }

    onStart() {
        this.toggleButton.onButtonPinched.add(() => {
            // print("toggleUser")
            if (this.memoryMode == true) { // memory mode is active, button now cancels memory mode
                this.memoryButtonText.text = "Create Memory";
                this.uiObject.enabled = false;
                this.memoryMode = false;

            } else { // Switch to MemoryMode
                this.memoryButtonText.text = "Cancel";
                this.uiObject.enabled = true;
                this.memoryMode = true;

            }
        })
    }

}
