import {
  AnchorSession,
  AnchorSessionOptions,
} from './../Spatial Anchors/AnchorSession';

import { Anchor } from './../Spatial Anchors/Anchor';
import { AnchorComponent } from './../Spatial Anchors/AnchorComponent';
import { AnchorModule } from './../Spatial Anchors/AnchorModule';
import { PinchButton } from './../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import NativeLogger from '../SpectaclesInteractionKit/Utils/NativeLogger';
import { Interactable } from '../SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable';
import { InteractorEvent } from '../SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

interface Object_Path {
  sceneObject : SceneObject
  path_id : string 
}

@component
export default class AnchorPlacementController extends BaseScriptComponent {
  @input anchorModule: AnchorModule;
  @input deleteButton: PinchButton; 
  @input modeText: Text;
  @input pathCountText: Text;
  @input trailText: Text;
  

  @input camera: SceneObject;
  @input footprintPrefab: ObjectPrefab;
  @input trailHeadPrefab: ObjectPrefab;
  @input bubblePrefab: ObjectPrefab

  @input toggleAudio: AudioComponent
  @input bubbleAudio: AudioComponent

  private anchorCount : number = 0;
  private anchorArray : Anchor[] = [];
  private footprintArray : SceneObject[] = [];
  private pathArray : Object_Path[] = [];
  private trailHeadArray : SceneObject[] = [];
  private bubbleArray : SceneObject[] = [];
  private pathCount : number = 0
  private trail : string = "-1"
  private currentTrailPrintCount : number = 0

  private footprintDistance : number = 700
  private trailHeadDistance: number = 12000
  private bubbleDistance : number = 1400

  private trailHead : boolean = true

  private log = new NativeLogger("AnchorPlacementController")

  private anchorSession?: AnchorSession;

  private previousPosition : vec3;

  private mode : number = 0

  private store = global.persistentStorageSystem.store;



  async onAwake() {
    // this.log.d("Awoke");
    // print("printing text object here")
    // var textObject = this.sampleTextPrefab.instantiate(this.getSceneObject())
    // var textComponent = textObject.getComponent("Component.Text")
    // if (textComponent){
    //   textComponent.text = "updated"
    // }

    this.createEvent('OnStartEvent').bind(() => {
      this.onStart();
    });


    this.previousPosition = this.camera.getTransform().getLocalPosition()
        this.createEvent("UpdateEvent").bind(() => {
            
            var currentPosition = this.camera.getTransform().getLocalPosition();

            if (currentPosition.distance(this.previousPosition) > 100 && this.mode == 1) {
              if(this.trailHead) {
                this.createAnchor("trailhead", "" + this.pathCount , "")
                this.trailHead = false
              } else {
                this.createAnchor("footprint", "" + this.pathCount , "")
                this.currentTrailPrintCount++
                if (this.footprintArray.length > 6) {
                  this.footprintArray[this.footprintArray.length - 6].enabled = false
                }
              }
              this.previousPosition = currentPosition
            }

            else if ( this.mode == 2) {
              this.showNearbyExplorer();
              this.previousPosition = currentPosition
            
            } else if ( this.mode == 0) {
              this.startUndefined();
              this.previousPosition = currentPosition
            }
          
        });
  }

  async onStart() {
    this.modeText.text = "Searching"
    this.startUndefined()

    this.pathCount = this.store.getInt("pathCount")
    this.pathCountText.text = "Total Trails: " + this.pathCount
    this.deleteButton.onButtonPinched.add(() => {
      this.deleteAnchors();
    });



    // Set up the AnchorSession options to scan for World Anchors
    const anchorSessionOptions = new AnchorSessionOptions();
    anchorSessionOptions.scanForWorldAnchors = true;
    // anchorSessionOptions.area = "area"

    // Start scanning for anchors
    this.anchorSession =
      await this.anchorModule.openSession(anchorSessionOptions);

    // Listen for nearby anchors
    this.anchorSession.onAnchorNearby.add(this.onAnchorNearby.bind(this));
  }

  public onAnchorNearby(anchor: Anchor) {
    // Invoked when a new Anchor is found

    let anchorData = this.store.getStringArray(anchor.id)

    // let toStore = ["prefab (footprint | trailhead | bubble)", "trail number (-1 if none)", "if bubble, text goes here"]
    // print(anchorData)

    this.attachNewObjectToAnchor(anchor, false, anchorData)
    // this.anchorSession.deleteAnchor(anchor);
  }

  public async createAnchor(prefab : string, trailNumber : string, text : string) {

    let toWorldFromDevice = this.camera.getTransform().getWorldRotation();
    let eulerRotation = toWorldFromDevice.toEulerAngles();
    let yOnlyQuat = quat.fromEulerAngles(0, eulerRotation.y, 0);  

    if (prefab == "bubble") { 
      print("bubble prefab")
      // let offset = new vec3(Math.cos(eulerRotation.y), 0, Math.sin(eulerRotation.y));
      // let unitRight = this.camera.getTransform().right.normalize()
      // let unitForward = this.camera.getTransform().forward.normalize()
      let offset = this.camera.getTransform().right.uniformScale(100).add(this.camera.getTransform().forward.uniformScale(-80))
      var anchorPosition = mat4.compose(this.camera.getTransform().getWorldPosition().add(offset), yOnlyQuat, new vec3(1,1,1))
    } else {
      print("not bubble prefab")
      var anchorPosition = mat4.compose(this.camera.getTransform().getWorldPosition(), yOnlyQuat, new vec3(1,1,1))
    }


    // Create the anchor
    let anchor = await this.anchorSession.createWorldAnchor(anchorPosition);

    // let toStore = ["prefab (footprint | trailhead | bubble)", "trail number (-1 if none)", "if bubble, text goes here"]

    let toStore = [prefab, trailNumber, text]
    this.store.putStringArray(anchor.id, toStore)

    // Create the object and attach it to the anchor
    this.attachNewObjectToAnchor(anchor, true, toStore);

    // Save the anchor so it's loaded in future sessions
    try {
      this.anchorSession.saveAnchor(anchor);
    } catch (error) {
      print('Error saving anchor: ' + error);
    }
  }

  private attachNewObjectToAnchor(anchor: Anchor, enabled: boolean, anchorData : string[]) {

    var object : SceneObject
    switch(anchorData[0]) {
      case "footprint":
        object = this.footprintPrefab.instantiate(this.getSceneObject())
        object.getChild(0).getTransform().setLocalScale(new vec3(30,30,30));
        object.getChild(0).getTransform().setLocalPosition(object.getTransform().getLocalPosition().add(new vec3(0,-150,0)));
        object.getChild(0).getTransform().setLocalRotation(object.getTransform().getLocalRotation().multiply(new quat(-.2,.15,0,0)));


        this.footprintArray.push(object);
        // if (this.footprintArray.length > 7) this.footprintArray[this.footprintArray.length - 8].enabled = false;
        var path : Object_Path = {sceneObject : object, path_id : anchorData[1]}
        this.pathArray.push(path)
        break

      case "trailhead":
        object = this.trailHeadPrefab.instantiate(this.getSceneObject())
        
        object.getChild(0).getTransform().setLocalScale(new vec3(20,200,20));
        object.getChild(0).getTransform().setLocalPosition(object.getTransform().getLocalPosition().add(new vec3(0,-75,0)));

        this.trailHeadArray.push(object)
        var path : Object_Path = {sceneObject : object, path_id : anchorData[1]}
        this.pathArray.push(path)
        break

      case "bubble":
        object = this.bubblePrefab.instantiate(this.getSceneObject())
        object.getChild(0).getTransform().setLocalPosition(object.getTransform().getLocalPosition().add(new vec3(0,0,0)));
        object.getChild(0).getTransform().setLocalScale(new vec3(50,50,50));
        this.bubbleArray.push(object)
        var path : Object_Path = {sceneObject : object, path_id : anchorData[1]}
        this.pathArray.push(path)
        
        let textObj = object.getChild(0).getComponent("Component.Text") 
        if (textObj){
          // textObj.text = anchorData[2]
          textObj.text = "text test"
          textObj.horizontalOverflow = 4
        }

        let buttonInteraction = object.getChild(0).getComponent(
          Interactable.getTypeName()
        );

        let onTriggerStartCallback = (event: InteractorEvent) => {
          if (textObj){
            textObj.horizontalOverflow = textObj.horizontalOverflow == 4 ? 2 : 4
          }
        };
    
        buttonInteraction.onInteractorTriggerStart(onTriggerStartCallback);

        

        object.enabled = true
        object.getChild(0).enabled = true

        break
    }

    

    if (enabled == false) {
      object.enabled = false
    }


    // Add to arrays
    // this.footprintArray.push(object);
    // print(this.footprintArray)

    this.anchorArray.push(anchor)
    this.anchorCount = this.anchorArray.length;
    // this.pathArray.push("" + this.pathCount)


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

    for (var trailHead of this.trailHeadArray) {
      trailHead.destroy()
    }
    this.trailHeadArray = []
    
    for (var bubble of this.bubbleArray) {
      bubble.destroy()
    }
    this.bubbleArray = []

    this.pathArray = []
    this.pathCount = 0
    this.pathCountText.text = "Total Trails: "

    this.store.clear()
  }

  private async endAnchorSession() {
    await this.anchorSession.close();
  }

  // Gets called when a new footprint is created to disable all but most recent.
  // Not relevant since we added dedicated trail creation
  private disableOldPrints() {
    if (this.footprintArray.length > 6) {
      for (var i: number = 0; i < this.footprintArray.length - 6; i++) {
        this.footprintArray[i].enabled = false;
      }
      for (var i: number = this.footprintArray.length - 6; i < this.footprintArray.length; i++) {
        this.footprintArray[i].enabled = true;
      }
    }
  }


  // Gets run only when Explorer just got toggled
  private startExplorer() {
    this.disableEverything()
    this.showNearbyExplorer()
  }

  // Shows footprints in a radius around Explorer
  // TODO: Only show footprints belonging to this trail
  private showNearbyExplorer() {

    for (var footprint of this.footprintArray) {
      var distance = (footprint.getTransform().getLocalPosition().distance(this.camera.getTransform().getLocalPosition()))
      // print("distance is: " + distance)
      if (distance < this.footprintDistance) {
        const objectPath = this.pathArray.find(item => item.sceneObject === footprint);
        if (objectPath && objectPath.path_id == this.trail) {
          footprint.enabled = true
        } else {
          footprint.enabled = false
        }
      }
      else {footprint.enabled = false}
    }

    for (var trailHead of this.trailHeadArray) {
      var distance = (trailHead.getTransform().getLocalPosition().distance(this.camera.getTransform().getLocalPosition()))
      if (distance < this.trailHeadDistance) {
        const objectPath = this.pathArray.find(item => item.sceneObject === trailHead);
        if (objectPath && objectPath.path_id == this.trail) {
          trailHead.enabled = true
        } else {
          trailHead.enabled = false
        }
      }
      else {trailHead.enabled = false}
    }

    for (var bubble of this.bubbleArray) {
      var distance = (bubble.getTransform().getLocalPosition().distance(this.camera.getTransform().getLocalPosition()))
      if (distance < this.bubbleDistance) {
        const objectPath = this.pathArray.find(item => item.sceneObject === bubble);
        if (objectPath && objectPath.path_id == this.trail) {
          bubble.enabled = true
        } else {
          bubble.enabled = false
        }
      }
      else {bubble.enabled = false}
    }
  }

  // TODO: put a circle around player to indicate they have started creation
  private startCreator() {
    this.disableEverything()
    this.currentTrailPrintCount = 0
    this.pathCount += 1
    this.pathCountText.text = "Total Trails: " + this.pathCount
    this.trail = "" + this.pathCount
    this.trailText.text = "Current Trail: " + this.trail
    this.store.putInt("pathCount", this.pathCount)
    this.trailHead = true
  }

  private disableEverything() {

    for (var footprint of this.footprintArray) {
      footprint.enabled = false;
    }

    for (var trailHead of this.trailHeadArray) {
      trailHead.enabled = false;
    }
    
    for (var bubble of this.bubbleArray) {
      bubble.enabled = false;
    }
  }

  // This is to get the closest trail to the user so they can join as an explorer. If none, return -1
  private getNearestTrail() : string{

    var nearestTrail = "-1"
    var nearestTrailDistance = 1000
    for (var footprint of this.footprintArray) {

      var distance = footprint.getTransform().getLocalPosition().distance(this.camera.getTransform().getLocalPosition()) 
      if (distance < this.footprintDistance) {
        if (distance < nearestTrailDistance) {
          nearestTrailDistance = distance
          const objectPath = this.pathArray.find(item => item.sceneObject === footprint);
          nearestTrail = objectPath? objectPath.path_id : "-1"
        }
      }
    }
    return nearestTrail
  }

  private startUndefined() {
    this.trail = "-1"
    this.trailText.text = "Current Trail: " + this.trail

    for (var footprint of this.footprintArray) {
      if ((footprint.getTransform().getLocalPosition().distance(this.camera.getTransform().getLocalPosition())) < this.footprintDistance) {
        footprint.enabled = true
      }
      else {footprint.enabled = false}
    }

    for (var trailHead of this.trailHeadArray) {
      var distance = (trailHead.getTransform().getLocalPosition().distance(this.camera.getTransform().getLocalPosition()))
      if (distance < this.trailHeadDistance) {
        trailHead.enabled = true
      }
      else {trailHead.enabled = false}
    }

    for (var bubble of this.bubbleArray) {
      var distance = (bubble.getTransform().getLocalPosition().distance(this.camera.getTransform().getLocalPosition()))
      if (distance < this.bubbleDistance) {
        bubble.enabled = true
      }
      else {bubble.enabled = false}
    }

  }

  // Gets called by ToggleUserMode script, triggered currently by the user_toggle button
  public toggleCreatorMode(creatorToggle : boolean) {
    // print("script toggled")
    this.mode = creatorToggle? 1 : 2
    if (creatorToggle && this.mode == 0) {
      this.startCreator();
    } else if (creatorToggle && this.mode == 2){
      this.startExplorer()
    }
  }

  // Gets called from voice command, 0 = undefined | 1 = creator | 2 = explorer
  public toggleMode(mode : number) {

    this.toggleAudio.play(1);
    
    if (this.mode == 0 && mode == 1) {
      this.mode = 1
      this.modeText.text = "Creator"
      this.startCreator()
    } else if (this.mode == 0 && mode == 2) {
      var trail = this.getNearestTrail()
      if (trail !== "-1") {
        this.mode = 2
        this.modeText.text = "Explorer"
        this.trail = trail
        this.trailText.text = "Current Trail: " + trail
        this.startExplorer()
      }
    } else if (this.mode == 1 && mode == 0) {
      this.startUndefined()
      this.mode = 0
      this.modeText.text = "Searching"
    } else if (this.mode == 2 && mode == 0) {
      this.startUndefined()
      this.mode = 0
      this.modeText.text = "Searching"
    }
  }

  public sendRecording(text : string) {
    this.createAnchor("bubble", "" + this.trail , text)
    this.playBubbleAudio()
  }

  public playBubbleAudio() {
    this.bubbleAudio.play(1)
  }

  public clear() {
    if (this.mode == 0) {
      this.deleteAnchors()
    }
  }

  // Does not work, TODO: Find y value of floor to place footprints on
  public setFloor(y : number) {
    print("setting floor to: " + y)
  }
}