import {
  AnchorSession,
  AnchorSessionOptions,
} from './../Spatial Anchors/AnchorSession';

import { Anchor } from './../Spatial Anchors/Anchor';
import { AnchorComponent } from './../Spatial Anchors/AnchorComponent';
import { AnchorModule } from './../Spatial Anchors/AnchorModule';
import { PinchButton } from './../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import NativeLogger from '../SpectaclesInteractionKit/Utils/NativeLogger';

@component
export default class AnchorPlacementController extends BaseScriptComponent {
  @input anchorModule: AnchorModule;
  @input createAnchorButton: PinchButton; 
  

  @input camera: SceneObject;
  @input prefab: ObjectPrefab;

  private anchorCount : number = 0;
  private anchorArray : Anchor[] = [];
  private footprintArray : SceneObject[] = [];

  private log = new NativeLogger("AnchorPlacementController")

  private anchorSession?: AnchorSession;

  private previousPosition : vec3;

  private explorerFootprintTrackingDistanceThreshold : number = 400;

  private creatorMode : boolean = true;

  async onAwake() {
    // this.log.d("Awoke");

    this.createEvent('OnStartEvent').bind(() => {
      this.onStart();
    });


    this.previousPosition = this.camera.getTransform().getLocalPosition()
        this.createEvent("UpdateEvent").bind(() => {
            
            var currentPosition = this.camera.getTransform().getLocalPosition();
            if (currentPosition.distance(this.previousPosition) > 100) {
                // print("far enough away!")
                if (this.creatorMode){
                  this.createAnchor();
                  this.previousPosition = currentPosition
                } else {
                  this.showNearbyExplorer();
                }
            }  
        });
  }

  async onStart() {
    // this.log.d("Started");


    this.createAnchorButton.onButtonPinched.add(() => {
      // print("deleting")
      this.deleteAnchors();
    });



    // Set up the AnchorSession options to scan for World Anchors
    const anchorSessionOptions = new AnchorSessionOptions();
    anchorSessionOptions.scanForWorldAnchors = true;

    // Start scanning for anchors
    this.anchorSession =
      await this.anchorModule.openSession(anchorSessionOptions);

    // Listen for nearby anchors
    this.anchorSession.onAnchorNearby.add(this.onAnchorNearby.bind(this));
  }

  public onAnchorNearby(anchor: Anchor) {
    // Invoked when a new Anchor is found
    this.attachNewObjectToAnchor(anchor, false)
    // this.anchorSession.deleteAnchor(anchor);
  }

  public async createAnchor(position? : mat4) {


    // Compute the anchor position 5 units in front of user
    let toWorldFromDevice = this.camera.getTransform().getWorldTransform();
    let anchorPosition = position? position : toWorldFromDevice.mult(
      mat4.fromTranslation(new vec3(1, 0, 0))
    );

    // Create the anchor
    let anchor = await this.anchorSession.createWorldAnchor(anchorPosition);
    

    // Create the object and attach it to the anchor
    this.attachNewObjectToAnchor(anchor, true);

    // Save the anchor so it's loaded in future sessions
    try {
      this.anchorSession.saveAnchor(anchor);
    } catch (error) {
      print('Error saving anchor: ' + error);
    }
  }

  private attachNewObjectToAnchor(anchor: Anchor, enabled: boolean) {
    // Create a new object from the prefab
    var object: SceneObject = this.prefab.instantiate(this.getSceneObject());
    // Line Below DOES NOT WORK, ASK WHY
    object.getChild(0).getTransform().setLocalScale(new vec3(30,30,30));
    object.getChild(0).getTransform().setLocalRotation(object.getTransform().getLocalRotation().multiply(new quat(-.2,.15,0,0)));
    object.getChild(0).getTransform().setLocalPosition(object.getTransform().getLocalPosition().add(new vec3(0,-50,0)));

    if (!enabled) {
      object.enabled = false
    }


    // Add to arrays
    this.footprintArray.push(object);
    if (this.footprintArray.length > 4) this.footprintArray[this.footprintArray.length - 5].enabled = false;

    this.anchorArray.push(anchor)
    this.anchorCount = this.anchorArray.length;

    // Associate the anchor with the object by adding an AnchorComponent to the
    // object and setting the anchor in the AnchorComponent.
    let anchorComponent = object.createComponent(
      AnchorComponent.getTypeName()
    ) as AnchorComponent;
    anchorComponent.anchor = anchor;
  }

  private deleteAnchors = () => {
    for (var anchor of this.anchorArray) {
      this.anchorSession.deleteAnchor(anchor);
    }
    this.anchorArray = [];

    for (var footprint of this.footprintArray) {
      // footprint.enabled = false;
      footprint.destroy()
    }
    this.footprintArray = []
  }

  private async endAnchorSession() {
    await this.anchorSession.close();
  }

  // Gets called when a new footprint is created to disable all but most recent.
  // TODO, call once at start of session and then just disable the single 4th most recent footprint
  private disableOldPrints() {
    for (var i: number = 0; i < this.footprintArray.length - 2; i++) {
      this.footprintArray[i].enabled = false;
    }
  }


  // Gets run only when Explorer just got toggled
  private startExplorer() {
    this.showNearbyExplorer()
  }

  // Shows footprints in a radius around Explorer
  // TODO: Only show footprints belonging to this trail
  private showNearbyExplorer() {
    for (var footprint of this.footprintArray) {
      // print(footprint.getChild(0).getTransform().getLocalPosition().distance(this.camera.getTransform().getLocalPosition()))
      if (this.getDistanceFromCamera(footprint) < this.explorerFootprintTrackingDistanceThreshold) {
        footprint.enabled = true
      }
      else {footprint.enabled = false}
    }
  }

  private getDistanceFromCamera(obj : SceneObject) {
    //returns the distance between a sceneobject and the camera input
    return obj.getTransform().getLocalPosition().distance( this.camera.getTransform().getLocalPosition() );
  }

  // Gets called by ToggleUserMode script, triggered currently by the user_toggle button
  public toggleCreatorMode(creatorToggle : boolean) {
    // print("script toggled")
    this.creatorMode = creatorToggle
    this.startExplorer()

  }

  // Does not work, TODO: Find y value of floor to place footprints on
  public setFloor(y : number) {
    print("setting floor to: " + y)
  }
}