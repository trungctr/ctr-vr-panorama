import Env from './environment.js'
class EnvInit {
	static formatButton(renderer, button) {
		function isOculus() {
			const toMatch = [/oculus/i, /meta/i]
			return toMatch.some((toMatchItem) => {
				return navigator.userAgent.match(toMatchItem)
			})
		}
		function showEnterVR(/*device*/) {
			let currentSession = null

			async function onSessionStarted(session) {
				session.addEventListener('end', onSessionEnded)

				await renderer.xr.setSession(session)
				console.log('VR session started !!')
				currentSession = session
			}

			function onSessionEnded(/*event*/) {
				currentSession.removeEventListener('end', onSessionEnded)
				console.log('VR session ended !!')
				currentSession = null
			}

			button.style.backgroundColor = 'rgba(0,200,0,0.8)'
			button.textContent = 'BẮT ĐẦU THAM QUAN'
			button.onclick = function () {
				if (currentSession === null) {
					// WebXR's requestReferenceSpace only works if the corresponding feature
					// was requested at session creation time. For simplicity, just ask for
					// the interesting ones as optional features, but be aware that the
					// requestReferenceSpace call will fail if it turns out to be unavailable.
					// ('local' is always available for immersive sessions and doesn't need to
					// be requested separately.)
					Env.VR()
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
			button.style.background = 'rgba(0,0,255,0.8)'
			button.textContent = 'BẮT ĐẦU THAM QUAN'
			button.onclick = () => {
				Env.webGL()
			}
			console.log('Using WebGL')
		}

		function showWebXRNotFound() {
			turnToWebGL()
		}

		function showVRNotAllowed(exception) {
			turnToWebGL()
			console.warn(
				'Exception when trying to call xr.isSessionSupported, turn to WebGL',
				exception
			)
		}

		if ('xr' in navigator) {
			turnToWebGL()

			navigator.xr
				.isSessionSupported('immersive-vr')
				.then(function (supported) {
					const condition = supported && isOculus()

					condition ? showEnterVR() : showWebXRNotFound()

					if (condition && EnvInit.xrSessionIsGranted) {
						button.click()
					}
				})
				.catch((e)=>showVRNotAllowed())

			return button
		} else {
			if (window.isSecureContext === false) {
				var result = confirm(
					'WEBXR cần HTTPS Bạn có muốn chuyển sang HTTPS?'
				)
				if (result == true) {
					location.replace(
						document.location.href.replace(/^http:/, 'https:')
					)
				} else {
					turnToWebGL()
				}
			} else {
				message.href = 'https://immersiveweb.dev/'
				message.innerHTML = 'WEBXR NOT AVAILABLE'
			}
			turnToWebGL(button)

			return message
		}
	}

	static xrSessionIsGranted = false

	static registerSessionGrantedListener() {
		if ('xr' in navigator) {
			// WebXRViewer (based on Firefox) has a bug where addEventListener
			// throws a silent exception and aborts execution entirely.
			if (/WebXRViewer\//i.test(navigator.userAgent)) return

			navigator.xr.addEventListener('sessiongranted', () => {
				EnvInit.xrSessionIsGranted = true
			})
		}
	}
}

EnvInit.registerSessionGrantedListener()

export { EnvInit }


