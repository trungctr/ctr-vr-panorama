//cần sửa lại đường dẫn mặc định của module three trong các file examples từ from 'three' thành  from '../../../build/three.module.js'
import { OrbitControls } from '/thre146/examples/jsm/controls/OrbitControls.js'

/** ambient light effect setting */
const ambientLight = new THREE.AmbientLight(0x333333)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(-30, 50, 0)
directionalLight.castShadow = false
directionalLight.shadow.camera.bottom = -10
scene.add(directionalLight)

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 30)
// scene.add(dLightHelper)

const dLightShadowHelper = new THREE.CameraHelper(
	directionalLight.shadow.camera
)
// scene.add(dLightShadowHelper)

/** spot light effect setting */
const spotLight = new THREE.SpotLight(0xff0000)
spotLight.position.set(30, 30, 15)
scene.add(spotLight)

const sLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(sLightHelper)

const sLightShadowHelper = new THREE.CameraHelper(spotLight.shadow.camera)
// scene.add(sLightShadowHelper)

// camera parameters: field od view, with/height, near(distance form camera to near plan) and far (distance form camera to far plan)
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)
const orbit = new OrbitControls(camera, renderer.domElement)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
camera.position.set(15, 15, 15)
camera.lookAt(0, 0, 0)
orbit.update()

/**
 * add xyz axis, x red, y green, z blue
 */
const axesHelper = new THREE.AxesHelper(100)
axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
scene.add(axesHelper)

/**
 * add a xz grid plane
 */
const gridsHelper = new THREE.GridHelper(30, 30)
scene.add(gridsHelper)

/**
 * add a sample plane
 */
const planeGeometry = new THREE.PlaneGeometry(30, 30)
const planeMaterial = new THREE.MeshStandardMaterial({
	color: 0xffffff,
	side: THREE.DoubleSide
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.rotation.x = -0.5 * Math.PI
plane.receiveShadow = true
scene.add(plane)

/**
 * add a cube
 */
const boxGeometry = new THREE.BoxGeometry()
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
const box = new THREE.Mesh(boxGeometry, boxMaterial)
box.position.set(0, 2, 0)
box.castShadow = true
box.receiveShadow = true
scene.add(box)

/**
 * add a sphere
 */
const sphereGeometry = new THREE.SphereGeometry(5, 100, 100)
const sphereMaterial = new THREE.MeshStandardMaterial({
	color: 0x0000ff,
	wireframe: false
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.position.set(-5, 10, 0)
sphere.castShadow = true
scene.add(sphere)

/**
 * set a example animation
 */
let step = 0
function setUp() {
	spotLight.castShadow = options['sLight shadow']
	spotLight.angle = options['sLight angle']
	spotLight.penumbra = options['sLight penumbra']
	spotLight.intensity = options['sLight intensity']
	sLightHelper.update(spotLight)
}

function maintainScene() {
	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize(window.innerWidth, window.innerHeight)
	})
}
maintainScene()

function cubeRotate(fps) {
	box.rotation.x += fps / 1000
	box.rotation.y += fps / 1000
}

function sphereJump() {
	step += options['Sphere jump speed']
	sphere.position.y = 10 * Math.abs(Math.sin(step))
}

function mainLoop() {
	setUp()
	cubeRotate(30)
	sphereJump()
	renderer.render(scene, camera)
}

/**
 * main loop
 */
if (WebGLcheck.isWebGLAvailable()) {
	renderer.setAnimationLoop(mainLoop)
} else {
	const warning = WebGLcheck.getWebGLErrorMessage()
	document.getElementById('container').appendChild(warning)
}
