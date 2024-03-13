/**
 * @method drive environment depend on compatibility}
 * @param main type=object - the main thread to run
 */
class ENV_driven {
	static drive(main) {
		function showEnterVR(/*device*/) {
			let currentSession = null

			async function onSessionStarted(session) {
				session.addEventListener('end', onSessionEnded)

				await main.renderer.xr.setSession(session)
				console.log('VR session started !!')
				currentSession = session
			}

			function onSessionEnded(/*event*/) {
				currentSession.removeEventListener('end', onSessionEnded)
				console.log('VR session ended !!')
				currentSession = null
			}

			main.GLOBAL_ENV.startButton.style.backgroundColor = 'rgba(0,200,0,0.8)'
			main.GLOBAL_ENV.startButton.textContent = 'BẮT ĐẦU THAM QUAN'
			main.GLOBAL_ENV.startButton.onclick = function () {
				if (currentSession === null) {
					// WebXR's requestReferenceSpace only works if the corresponding feature
					// was requested at session creation time. For simplicity, just ask for
					// the interesting ones as optional features, but be aware that the
					// requestReferenceSpace call will fail if it turns out to be unavailable.
					// ('local' is always available for immersive sessions and doesn't need to
					// be requested separately.)
					main.VRrender()
					const sessionInit = {
						optionalFeatures: [
							'local-floor'
							// 'bounded-floor',
							// 'hand-tracking',
							// 'layers'
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
			main.GLOBAL_ENV.startButton.style.background = 'rgba(0,0,255,0.8)'
			main.GLOBAL_ENV.startButton.textContent = 'BẮT ĐẦU THAM QUAN'
			main.GLOBAL_ENV.startButton.onclick = () => {
				main.WebGLrender()
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

		if (
			main.GLOBAL_ENV.isOculus
			// 'xr' in navigator
		) {
			// turnToWebGL()

			navigator.xr
				.isSessionSupported('immersive-vr')
				.then(function (supported) {
					const condition = supported

					condition ? showEnterVR() : showWebXRNotFound()

					if (condition && ENV_driven.xrSessionIsGranted) {
						main.GLOBAL_ENV.startButton.click()
					}
				})
				.catch((e) => showVRNotAllowed())

			return main.GLOBAL_ENV.startButton
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
				main.GLOBAL_ENV.devLog.error('WEBXR NOT AVAILABLE: <a href="https://immersiveweb.dev/">https://immersiveweb.dev/</a>')
			}
			turnToWebGL(main.GLOBAL_ENV.startButton)

			return 0
		}
	}

	static xrSessionIsGranted = false

	static registerSessionGrantedListener() {
		if ('xr' in navigator) {
			// WebXRViewer (based on Firefox) has a bug where addEventListener
			// throws a silent exception and aborts execution entirely.
			if (/WebXRViewer\//i.test(navigator.userAgent)) return

			navigator.xr.addEventListener('sessiongranted', () => {
				ENV_driven.xrSessionIsGranted = true
			})
		}
	}
}

ENV_driven.registerSessionGrantedListener()

export default ENV_driven

