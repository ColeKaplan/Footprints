import NativeLogger from "../SpectaclesInteractionKit/Utils/NativeLogger";
import createAnchor from "./AnchorPlacementController";
require('LensStudio:RawLocationModule');

@component
export class MovementHandler extends BaseScriptComponent {

    // @input object: SceneObject; 
    @input cam : Camera;
    @input prefab: ObjectPrefab;
    

    private log = new NativeLogger("AnchorPlacementController")
    private previousPosition : vec3;

    onAwake() {
        this.previousPosition = this.cam.getTransform().getLocalPosition()


        this.createEvent("UpdateEvent").bind(() => {


            // Move this SceneObject up every frame with a speed of 5 units per second

            var currentPosition = this.cam.getTransform().getLocalPosition();
            if (currentPosition.distance(this.previousPosition) > 30) {
                print("far enough away!")
                let object: SceneObject = this.prefab.instantiate(this.getSceneObject());
                object.getTransform().setWorldScale(new vec3(.001,.001,.001));
                object.setParent(this.getSceneObject());
                this.previousPosition = currentPosition
            }  
            


        });

    }
}
