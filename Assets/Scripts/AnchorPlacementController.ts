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

  private creatorMode : boolean = true;

  async onAwake() {
    // this.log.d("Awoke");

    this.createEvent('OnStartEvent').bind(() => {
      this.onStart();
    });


    this.previousPosition = this.camera.getTransform().getLocalPosition()
        this.createEvent("UpdateEvent").bind(() => {
            
            var currentPosition = this.camera.getTransform().getLocalPosition();
            if (this.creatorMode &&  currentPosition.distance(this.previousPosition) > 30) {
                // print("far enough away!")
                this.createAnchor();
                this.previousPosition = currentPosition
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
    this.anchorArray.push(anchor)
    this.anchorCount = this.anchorArray.length;
    this.attachNewObjectToAnchor(anchor)
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
    this.attachNewObjectToAnchor(anchor);

    // Save the anchor so it's loaded in future sessions
    try {
      this.anchorSession.saveAnchor(anchor);
      this.anchorCount += 1;
      this.log.d("anchor count = " + this.anchorCount)
    } catch (error) {
      print('Error saving anchor: ' + error);
    }
  }

  private attachNewObjectToAnchor(anchor: Anchor) {
    // Create a new object from the prefab
    var object: SceneObject = this.prefab.instantiate(this.getSceneObject());
    // Line Below DOES NOT WORK, ASK WHY
    object.getChild(0).getTransform().setLocalScale(new vec3(10,10,10));
    object.getChild(0).getTransform().setLocalRotation(object.getTransform().getLocalRotation().multiply(new quat(-.5,.5,0,0)));
    object.getChild(0).getTransform().setLocalPosition(object.getTransform().getLocalPosition().add(new vec3(0,-10,0)));
    // object.setParent(this.getSceneObject());

    this.footprintArray.push(object);

    // Associate the anchor with the object by adding an AnchorComponent to the
    // object and setting the anchor in the AnchorComponent.
    let anchorComponent = object.createComponent(
      AnchorComponent.getTypeName()
    ) as AnchorComponent;
    anchorComponent.anchor = anchor;
  }

  private deleteAnchors() {
    for (var anchor of this.anchorArray) {
      this.anchorSession.deleteAnchor(anchor);
    }

    for (var footprint of this.footprintArray) {
      footprint.destroy()
      // footprint.getTransform().setLocalScale(footprint.getTransform().getLocalScale().add(new vec3(10,10,10)));
      // footprint.getTransform().setLocalRotation(footprint.getTransform().getLocalRotation().multiply(new quat(-.5,.5,0,0)));
      // footprint.getTransform().setLocalPosition(footprint.getTransform().getLocalPosition().add(new vec3(0,-10,0)));
    }
  }

  private async endAnchorSession() {
    await this.anchorSession.close();
  }

  public toggleCreatorMode(creatorToggle : boolean) {
    // print("script toggled")
    this.creatorMode = creatorToggle

  }

  public setFloor(y : number) {
    print("setting floor to: " + y)
  }
}