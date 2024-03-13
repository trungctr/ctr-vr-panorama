import App from './app.js'
import GLOBAL_ENV from './global.js'
import ENV_driven from './environmentDriven.js'

GLOBAL_ENV.bgm = document.getElementById('BGM-speaker')
GLOBAL_ENV.sfx = document.getElementById('SFX-speaker')
GLOBAL_ENV.speak = document.getElementById('speak-speaker')
let button1 = document.getElementById('start-button')
let button2 = document.getElementById('tuts')
let introNote = document.getElementById('confirm-sound')
let soundButton = document.getElementById('turn-it-on')
let soundButton2 = document.getElementById('keep-silent')

function showIntro() {
	button1.classList.remove('hide')
	button2.classList.remove('hide')
	introNote.classList.add('hide')
}
soundButton.onclick = () => {
	showIntro()
	sfx.play()
	bgm.play()
	bgm.volume = 0.4
}
soundButton2.onclick = () => {
	showIntro()
	sfx.pause()
	bgm.pause()
	sfx.volume = 0
	bgm.volume = 0
}



if (GLOBAL_ENV.webGLcompatibility)
{
	const app = new App
	window.app = app
	ENV_driven.drive(app)
} else {
	const warning = WebGLcheck.getWebGLErrorMessage()
	document.getElementById('start-button').style.background = 'rgba(255,0,0,1)'
	document.getElementById('start-button').innerText =
		'TRÌNH DUYỆT KHÔNG TƯƠNG THÍCH'
}
