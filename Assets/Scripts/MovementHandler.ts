@component
export class NewScript extends BaseScriptComponent {

    Update() {
        // Move this SceneObject up every frame with a speed of 5 units per second
        var transform = this.getTransform();
        var pos = transform.getLocalPosition();
        pos.y += getDeltaTime() * 5.0;
        transform.setLocalPosition(pos);
    }
}
