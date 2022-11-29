class VRButton {
	static createButton() {
		const button = document.createElement('button')

		function showEnterVR(/*device*/) {
			button.style.display = ''
			button.style.cursor = 'pointer'
			button.style.left = 'calc(90% - 50px)'
			button.style.width = '100px'
			button.textContent = 'ENTER VR'

			stylizeElement(button, true)
			button.onmouseenter = function () {
				button.style.opacity = '1.0'
			}

			button.onmouseleave = function () {
				button.style.opacity = '0.5'
			}

			button.onclick = function () {
				location.replace('/ctr-3js-static/vr')
			}
		}

		function disableButton() {
			button.style.display = ''
			button.style.cursor = 'auto'
			button.style.left = 'calc(90% - 75px)'
			button.style.width = '150px'
			button.onmouseenter = null
			button.onmouseleave = null
			button.onclick = null
		}

		function showWebXRNotFound() {
			disableButton()

			button.textContent = 'VR NOT SUPPORTED'
			stylizeElement(button, false)
		}

		function showVRNotAllowed(exception) {
			disableButton()

			console.warn(
				'Exception when trying to call xr.isSessionSupported',
				exception
			)

			button.textContent = 'VR NOT ALLOWED'
			stylizeElement(button, false)
		}

		function stylizeElement(element, good = false) {
			if (good === true) {
				element.style.border = '1px solid #00ff00'
				element.style.background = 'rgba(0,250,0,0.2)'
				element.style.color = '#00ff00'
			}

			if (good === false) {
				element.style.border = '1px solid #ff0000'
				element.style.background = 'rgba(0,0,0,0.1)'
				element.style.color = '#ff0000'
			}
			element.style.position = 'absolute'
			element.style.bottom = '20px'
			element.style.padding = '12px 6px'
			element.style.borderRadius = '4px'
			element.style.font = 'normal 13px sans-serif'
			element.style.textAlign = 'center'
			element.style.opacity = '0.5'
			element.style.outline = 'none'
			element.style.zIndex = '999'
		}

		if ('xr' in navigator) {
			button.id = 'VRButton'
			button.style.display = 'none'

			navigator.xr
				.isSessionSupported('immersive-vr')
				.then(function (supported) {
					supported ? showEnterVR() : showWebXRNotFound()

					if (supported && VRButton.xrSessionIsGranted) {
						button.click()
					}
				})
				.catch(showVRNotAllowed)

			return button
		} else {
			const message = document.createElement('a')

			if (window.isSecureContext === false) {
				message.href = document.location.href.replace(/^http:/, 'https:')
				message.innerHTML = 'WEBXR NEEDS HTTPS' // TODO Improve message
			} else {
				message.href = 'https://immersiveweb.dev/'
				message.innerHTML = 'WEBXR NOT AVAILABLE'
			}

			message.style.left = 'calc(90% - 90px)'
			message.style.width = '180px'
			message.style.textDecoration = 'none'

			stylizeElement(message)

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
				VRButton.xrSessionIsGranted = true
			})
		}
	}
}

VRButton.registerSessionGrantedListener()

export { VRButton }

