import * as THREE from '/ctr-3js-static/3js/build/three.module.js'
import htmlEnv from '/ctr-3js-static/js/htmlenv.js'
import vrEnv from '/ctr-3js-static/js/vr.js'
import WebGLcheck from '/ctr-3js-static/js/compatibility-check.js'
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
		
if (WebGLcheck.isWebGLAvailable()) {
	const button = document.getElementById('start-button')
	const img = document.getElementById('intro-img')
	const tutsButton = document.getElementById('tuts')

	function enterVR(/*device*/) {
		let currentSession = null
		async function onSessionStarted(session) {
			await renderer.xr.setSession(session)
			button.textContent = 'EXIT VR'
			currentSession = session
		}
		button.style.background = 'rgba(0,255,0,1)'
		button.textContent = 'BẮT ĐẦU THAM QUAN'
		button.onclick = function () {
			if (currentSession === null) {
				button.classList.add('hide')
				img.classList.add('hide')
				tutsButton.classList.add('hide')
				vrEnv.init(renderer)
				const sessionInit = {
					optionalFeatures: [
						'local-floor',
						'bounded-floor',
						'hand-tracking',
						'layers'
					]
				}
				navigator.xr
					.requestSession('immersive-vr', sessionInit)
					.then(onSessionStarted)
			} else {
				currentSession.end()
			}
		}
	}

	function turnToWebGL() {
		const htmlRun = htmlEnv.run
		button.style.background = 'rgba(0,0,255,1)'
		button.textContent = 'BẮT ĐẦU THAM QUAN'
		button.onclick = htmlRun
		console.log('usingWebGL')
	}

	function showVRNotAllowed(exception) {
		turnToWebGL()
		console.warn(
			'Exception when trying to call xr.isSessionSupported',
			exception
		)
	}

	let xrSessionIsGranted = false
	function registerSessionGrantedListener() {
		if ('xr' in navigator) {
			// WebXRViewer (based on Firefox) has a bug where addEventListener
			// throws a silent exception and aborts execution entirely.
			if (/WebXRViewer\//i.test(navigator.userAgent)) return

			navigator.xr.addEventListener('sessiongranted', () => {
				xrSessionIsGranted = true
			})
		}
	}
	registerSessionGrantedListener()

	if ('xr' in navigator) {
		navigator.xr
			.isSessionSupported('immersive-vr')
			.then(function (supported) {
				supported ? enterVR() : turnToWebGL()

				if (supported && xrSessionIsGranted) {
					button.click()
				}
			})
			.catch(showVRNotAllowed)
	} else {
		if (window.isSecureContext === false) {
			var result = confirm('WEBXR cần HTTPS Bạn có muốn chuyển sang HTTPS?')
			if (result == true) {
				location.replace(document.location.href.replace(/^http:/, 'https:'))
			} else {
				turnToWebGL()
			}
		}
	}
} else {
	const warning = WebGLcheck.getWebGLErrorMessage()
	document.getElementById('start-button').style.background =
		'rgba(255,0,0,0.8)'
	document.getElementById('start-button').innerText =
		'TRÌNH DUYỆT KHÔNG TƯƠNG THÍCH'
}
