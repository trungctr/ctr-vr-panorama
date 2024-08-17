import Pointer from './pointerControl.js'
import Keyboard from './keyboardControl.js'
import Vr_Pointer from './vrPoniterControl.js'
import VRgamePad from './vrGamepadControl.js'

class Control {
	constructor(app) {
		this.app = app
	}
	pointer() {
		const pointer = new Pointer(this.app)
		pointer.listen()
	}
	Keyboard() {
		const keyboard = new Keyboard(this.app)
		keyboard.listen()
	}
	gamePad() {
		const gamePad = new VRgamePad(this.app)
		gamePad.listen()
	}
	vrPointer() {
		const pointer = new Vr_Pointer(this.app)
		pointer.listen()
	}
}

export default Control