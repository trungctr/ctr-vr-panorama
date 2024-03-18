import app from './app.js'
import GLOBAL_ENV from './global.js'
import ENV_driver from './environmentDriven.js'

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
	GLOBAL_ENV.sfx.play()
	GLOBAL_ENV.bgm.play()
	GLOBAL_ENV.bgm.volume = 0.4
}
soundButton2.onclick = () => {
	showIntro()
	GLOBAL_ENV.sfx.pause()
	GLOBAL_ENV.bgm.pause()
	GLOBAL_ENV.sfx.volume = 0
	GLOBAL_ENV.bgm.volume = 0
}

GLOBAL_ENV.startButton.addEventListener('click', () => { 
	document.getElementById('introContainer').classList.add('hide')
})



if (GLOBAL_ENV.webGLcompatibility)
{
	const environmentDriven = new ENV_driver(app)
	environmentDriven.drive()
} else {
	const warning = WebGLcheck.getWebGLErrorMessage()
	document.getElementById('start-button').style.background = 'rgba(255,0,0,1)'
	document.getElementById('start-button').innerText =
		'TRÌNH DUYỆT KHÔNG TƯƠNG THÍCH'
}
