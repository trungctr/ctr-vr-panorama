import * as THREE from '../../three162/build/three.module.js'

class SpriteUI {
	constructor(inputContent, config) {
		this.config = config
		this.content = inputContent
		this.defaultConfig = {
			panelSize: { width: 100, height: 200, actualSize: 10 },
			backgroundColor: '#0000ff',
			backgroundTransparent: 'cc',
			borderRadius: 6,
			opacity: 0.7,
			padding: 15,
			/*font here*/
			fontFamily: 'Arial',
			fontSize: 16,
			color: '#ffffff',

			/*user data*/
			userData: {
				userMark: 'none',
				userEvent: 'none'
			}
		}
		this.defaultContent = '#NoContent'
		this.material = this.generateMaterial()
		this.material.transparent = true

		const panelWidth =
				this.config.panelSize.width || this.defaultConfig.panelSize.width,
			panelHeight =
				this.config.panelSize.height || this.defaultConfig.panelSize.height,
			actualSize =
				this.config.panelSize.actualSize ||
				this.defaultConfig.panelSize.actualSize,
			content = this.content || this.defaultContent,
			userType =
				this.config.userData.userType ||
				this.defaultConfig.userData.userType,
			userMark =
				this.config.userData.userMark ||
				this.defaultConfig.userData.userMark,
			userEvent =
				this.config.userData.userEvent ||
				this.defaultConfig.userData.userEvent

		this.sprite = new THREE.Sprite(this.material)
		this.sprite.scale.set(
			(this.width / this.height) * actualSize,
			actualSize,
			1
		)

		this.sprite.name = userMark
		this.sprite.userType = userType
		this.sprite.userMark = userMark
		this.sprite.userEvent = userEvent

		return this.sprite
	}
	generateMaterial() {
		const content = this.content || this.defaultContent,
			getConfig = this.config || this.defaultConfig,
			panelHeight = getConfig.panelSize.height,
			panelWidth = getConfig.panelSize.width,
			actualSize = getConfig.panelSize.actualSize,
			backgroundColor = getConfig.backgroundColor,
			backgroundTransparent = getConfig.backgroundTransparent,
			padding = getConfig.padding * actualSize,
			fontSize = getConfig.fontSize * actualSize,
			borderRadius = getConfig.borderRadius * actualSize,
			fontFamily = getConfig.fontFamily,
			textColor = getConfig.color,
			canvas = document.createElement('canvas'),
			context = canvas.getContext('2d')

		const font = `normal ${fontSize}px ${fontFamily}`

		context.font = font
		const metrics = context.measureText(content)

		canvas.width = metrics.actualBoundingBoxRight + 2 * padding
		canvas.height = fontSize + 0.5 * fontSize
		this.width = canvas.width
		this.height = canvas.height

		/**
		 * generate text content
		 */
		context.font = font
		context.textAlign = 'center'
		context.textBaseline = 'middle'
		context.fillStyle = textColor
		context.fillText(content, canvas.width / 2, (canvas.height+ 2*actualSize)/ 2)
		/**
		 * generate background
		 */
		context.beginPath()
		context.globalCompositeOperation = 'destination-over'
		context.fillStyle = `${backgroundColor}${backgroundTransparent}`
		context.roundRect(0, 0, canvas.width, canvas.height, borderRadius)
		context.fill()
		context.closePath()

		var texture = new THREE.Texture(canvas)
		texture.needsUpdate = true

		return new THREE.SpriteMaterial({
			map: texture
		})
	}
}

export default SpriteUI





