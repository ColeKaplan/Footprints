import { PinchButton } from "../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";

@component
export class DeployOnPop extends BaseScriptComponent {

    @input @allowUndefined
    public storedPrefab : ObjectPrefab;

    @input @allowUndefined
    public pinchButtonComponent : PinchButton;
    

    onAwake() {
        this.createEvent('OnStartEvent').bind(() => {
            this.onStart();
          });
    }

    onStart() {
        this.pinchButtonComponent.onButtonPinched.add(() => {

            //Debug Print Statement
            //print("Pop!");
            
            this.storedPrefab.instantiate(null);
            this.pinchButtonComponent.getSceneObject().enabled = false;
            
        });
    }
}
