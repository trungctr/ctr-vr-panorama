import * as THREE from '../../three162/build/three.module.js'
import ActionMapping from './actionMap.js'
import GLOBAL_ENV from '../global.js'

class Keyboard {
	constructor(app) {
		//tham chieu app duoc truyen khi khoi tao instance trong file app.js
		this.actions = new ActionMapping(app)
		this.keyMap = {
			ArrowLeft: 'previousArea',
			ArrowRight: 'nextArea',
			ArrowUp: 'moveForward',
			ArrowDown: 'moveBackward',
			Space: 'moveUp',
			ControlLeft: 'moveDown'
		}
	}
	active(action, payload) {
		this.actions.activeAction(action, payload)
	}
	run(event) {
		const action = this.keyMap[event]
		if (action) {
			this.active(action)
		}
	}
	listen() {
		const _THIS = this
		document.onkeydown = (e) => {
			console.log(e.code)
			_THIS.run(e.code)
		}
	}
}
export default Keyboard
