import * as THREE from '../../three162/build/three.module.js'
import ActionMapping from './actionMap.js'

class Vr_Pointer {
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
		this.handlingController = null
		this.vec3 = new THREE.Vector3()
		this.mat4 = new THREE.Matrix4()
	}

	onPointerMove() {
		const _THIS = this
		function onHover(c) {
			_THIS.mat4.identity().extractRotation(c.matrixWorld)

			_THIS.raycaster.ray.origin.setFromMatrixPosition(
				_THIS.controller.matrixWorld
			)
			_THIS.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(_THIS.mat4)

			const intersects = _THIS.raycaster.intersectObject(_THIS.scene)
			const picked = intersects.filter((element) => {
				return element.object.userMark
			})[0]
			if (picked) {
				picked.object.userData['uv'] = picked.uv
				_THIS.selectedObject = picked
			}

			c.addEventListener('select', (e) => _THIS.onPointerActive())
			c.addEventListener('selectstart', (e) => onSelectStart(e))
			c.addEventListener('selectend', (e) => onSelectEnd(e))
		}

		if (this.controller) {
			onHover(this.controller)
		}

		if (this.controller1) {
			onHover(this.controller1)
		}
	}

	onPointerActive() {
		if (this.selectedObject != null) {
			this.actions.activeAction(
				this.selectedObject.object.userEvent,
				this.selectedObject.object.userMark
			)
		}
	}

	listen() {
		this.onPointerMove()
	}
}
export default Vr_Pointer
