import * as THREE from '../../three162/build/three.module.js'
import ActionMapping from './actionMap.js'

class VRgamePad {
	constructor(app) {
		//tham chieu app duoc truyen khi khoi tao instance trong file index.js
		this.selectedObject = app.state.selectedObject
		this.camera = app.camera
		this.group = app.scene.getObjectByName('trackGroup')
		this.scene = app.scene
		this.raycaster = new THREE.Raycaster()
		this.pointer = new THREE.Vector2()
		this.actions = new ActionMapping(app)
		this.controller = app.controller
		this.controller1 = app.controller1
		this.vec3 = new THREE.Vector3()
		this.mat4 = new THREE.Matrix4()
	}
	
	listen() {
		this.controller.addEventListener('select', (e) => onSelect(e))
		this.controller.addEventListener('selectstart', (e) => onSelectStart(e))
		this.controller.addEventListener('selectend', (e) => onSelectEnd(e))
		this.controller1.addEventListener('select', (e) => onSelect(e))
		this.controller1.addEventListener('selectstart', (e) => onSelectStart(e))
		this.controller1.addEventListener('selectend', (e) => onSelectEnd(e))
		this.controller.addEventListener('squeeze', (e) => onSqueeze(e))
	}
}
export default VRgamePad
