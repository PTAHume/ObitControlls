import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center, Grid, Environment } from '@react-three/drei'
import { Object3D, ObjectLoader, Camera, PerspectiveCamera } from 'three'
import './App.css'

interface OrbitControlsSettings {
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
  minAzimuthAngle: number
  maxAzimuthAngle: number
  enableDamping: boolean
  dampingFactor: number
  autoRotate: boolean
  autoRotateSpeed: number
}

interface SceneData {
  scene: Object3D
  cameras: Camera[]
  activeCamera: Camera
}

function Model({ url, sceneData }: { url: string | null, sceneData: SceneData | null }) {
  if (sceneData) {
    return <primitive object={sceneData.scene} />
  }
  
  if (url) {
    const { scene } = useGLTF(url)
    return <primitive object={scene} />
  }
  
  return null
}

function Scene({ modelUrl, sceneData, settings }: { 
  modelUrl: string | null, 
  sceneData: SceneData | null,
  settings: OrbitControlsSettings 
}) {
  const controlsRef = useRef<any>(null)
  const modelGroupRef = useRef<Object3D>(null)

  // Update OrbitControls when camera changes
  useEffect(() => {
    if (controlsRef.current && sceneData?.activeCamera) {
      const camera = sceneData.activeCamera
      
      // Reset controls
      controlsRef.current.reset()
      
      // Set camera position
      controlsRef.current.object.position.copy(camera.position)
      
      // Set target to look at center
      controlsRef.current.target.set(0, 0, 0)
      
      // Update controls
      controlsRef.current.update()
    }
  }, [sceneData?.activeCamera])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
      <Environment preset="studio" />
      
      <group ref={modelGroupRef}>
        {(modelUrl || sceneData) && (
          <Center>
            <Model url={modelUrl} sceneData={sceneData} />
          </Center>
        )}
      </group>
      
      <OrbitControls
        ref={controlsRef}
        makeDefault
        minDistance={settings.minDistance}
        maxDistance={settings.maxDistance}
        minPolarAngle={settings.minPolarAngle}
        maxPolarAngle={settings.maxPolarAngle}
        minAzimuthAngle={settings.minAzimuthAngle}
        maxAzimuthAngle={settings.maxAzimuthAngle}
        enableDamping={settings.enableDamping}
        dampingFactor={settings.dampingFactor}
        autoRotate={settings.autoRotate}
        autoRotateSpeed={settings.autoRotateSpeed}
        enablePan={false}
      />
    </>
  )
}

function App() {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [sceneData, setSceneData] = useState<SceneData | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [jsonInput, setJsonInput] = useState<string>('')
  const [jsonError, setJsonError] = useState<string>('')
  const [settings, setSettings] = useState<OrbitControlsSettings>({
    minDistance: 1,
    maxDistance: 100,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    enableDamping: true,
    dampingFactor: 0.05,
    autoRotate: false,
    autoRotateSpeed: 2
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleCameraChange = (index: number) => {
    if (sceneData && sceneData.cameras[index]) {
      setSceneData({
        ...sceneData,
        activeCamera: sceneData.cameras[index]
      })
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.name.endsWith('.gltf') || file.name.endsWith('.glb')) {
        const url = URL.createObjectURL(file)
        setModelUrl(url)
        setSceneData(null)
      } else if (file.name.endsWith('.json')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string)
            
            // Handle Three.js Editor format
            if (json.metadata && json.metadata.type === "App") {
              // Find all cameras in the scene
              const cameras: Camera[] = []
              let defaultCamera: Camera | undefined

              // Check for camera in root
              if (json.camera) {
                const cam = new PerspectiveCamera(
                  json.camera.fov || 50,
                  window.innerWidth / window.innerHeight,
                  json.camera.near || 0.1,
                  json.camera.far || 1000
                )
                if (json.camera.position) {
                  cam.position.set(
                    json.camera.position.x || 0,
                    json.camera.position.y || 0,
                    json.camera.position.z || 0
                  )
                }
                if (json.camera.rotation) {
                  cam.rotation.set(
                    json.camera.rotation._x || 0,
                    json.camera.rotation._y || 0,
                    json.camera.rotation._z || 0
                  )
                }
                cameras.push(cam)
                defaultCamera = cam
              }

              // Look for cameras in children
              if (json.object?.children) {
                json.object.children.forEach((child: any) => {
                  if (child.type === "PerspectiveCamera") {
                    const cam = new PerspectiveCamera(
                      child.fov || 50,
                      window.innerWidth / window.innerHeight,
                      child.near || 0.1,
                      child.far || 1000
                    )
                    if (child.position) {
                      cam.position.set(
                        child.position.x || 0,
                        child.position.y || 0,
                        child.position.z || 0
                      )
                    }
                    if (child.rotation) {
                      cam.rotation.set(
                        child.rotation._x || 0,
                        child.rotation._y || 0,
                        child.rotation._z || 0
                      )
                    }
                    cameras.push(cam)
                    if (!defaultCamera) defaultCamera = cam
                  }
                })
              }

              // If no cameras found, create a default one
              if (cameras.length === 0) {
                const defaultCam = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
                defaultCam.position.set(5, 5, 5)
                cameras.push(defaultCam)
                defaultCamera = defaultCam
              }

              // Create scene
              const loader = new ObjectLoader()
              loader.parse(json.scene || json.object, (object) => {
                setSceneData({ 
                  scene: object, 
                  cameras: cameras,
                  activeCamera: defaultCamera!
                })
                setModelUrl(null)
                setJsonError('Scene loaded successfully!')
                setTimeout(() => setJsonError(''), 3000)
              })
            } else {
              // Try loading as regular Three.js scene
              const loader = new ObjectLoader()
              loader.parse(json, (object) => {
                const cameras: Camera[] = []
                let defaultCamera: Camera | undefined

                object.traverse((child) => {
                  if (child instanceof Camera) {
                    cameras.push(child)
                    if (!defaultCamera) defaultCamera = child
                  }
                })

                // If no cameras found, create a default one
                if (cameras.length === 0) {
                  const defaultCam = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
                  defaultCam.position.set(5, 5, 5)
                  cameras.push(defaultCam)
                  defaultCamera = defaultCam
                }

                setSceneData({ 
                  scene: object, 
                  cameras: cameras,
                  activeCamera: defaultCamera!
                })
                setModelUrl(null)
                setJsonError('Scene loaded successfully!')
                setTimeout(() => setJsonError(''), 3000)
              })
            }
          } catch (error) {
            console.error('Scene loading error:', error)
            setJsonError('Failed to parse scene JSON file. Make sure it\'s exported from Three.js Editor.')
            setTimeout(() => setJsonError(''), 5000)
          }
        }
        reader.readAsText(file)
      } else {
        alert('Please drop a .gltf, .glb, or .json file')
      }
    }
  }, [])

  const updateSetting = (key: keyof OrbitControlsSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleJsonInput = (value: string) => {
    setJsonInput(value)
    setJsonError('')
  }

  const applyJsonSettings = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      
      // Validate that all required keys are present and have correct types
      const validSettings: OrbitControlsSettings = {
        minDistance: typeof parsed.minDistance === 'number' ? parsed.minDistance : settings.minDistance,
        maxDistance: typeof parsed.maxDistance === 'number' ? parsed.maxDistance : settings.maxDistance,
        minPolarAngle: typeof parsed.minPolarAngle === 'number' ? parsed.minPolarAngle : settings.minPolarAngle,
        maxPolarAngle: typeof parsed.maxPolarAngle === 'number' ? parsed.maxPolarAngle : settings.maxPolarAngle,
        minAzimuthAngle: typeof parsed.minAzimuthAngle === 'number' ? parsed.minAzimuthAngle : settings.minAzimuthAngle,
        maxAzimuthAngle: typeof parsed.maxAzimuthAngle === 'number' ? parsed.maxAzimuthAngle : settings.maxAzimuthAngle,
        enableDamping: typeof parsed.enableDamping === 'boolean' ? parsed.enableDamping : settings.enableDamping,
        dampingFactor: typeof parsed.dampingFactor === 'number' ? parsed.dampingFactor : settings.dampingFactor,
        autoRotate: typeof parsed.autoRotate === 'boolean' ? parsed.autoRotate : settings.autoRotate,
        autoRotateSpeed: typeof parsed.autoRotateSpeed === 'number' ? parsed.autoRotateSpeed : settings.autoRotateSpeed,
      }
      
      setSettings(validSettings)
      setJsonError('Settings applied successfully!')
      setTimeout(() => setJsonError(''), 3000)
    } catch (error) {
      setJsonError('Invalid JSON format. Please check your input.')
    }
  }

  const copyCurrentSettings = () => {
    const jsonString = JSON.stringify(settings, null, 2)
    setJsonInput(jsonString)
    navigator.clipboard.writeText(jsonString)
    setJsonError('Settings copied to clipboard!')
    setTimeout(() => setJsonError(''), 3000)
  }

  return (
    <div className="app">
      <div className="canvas-container">
        <Canvas
          camera={sceneData?.activeCamera ? {
            fov: (sceneData.activeCamera as PerspectiveCamera).fov,
            position: [
              sceneData.activeCamera.position.x,
              sceneData.activeCamera.position.y,
              sceneData.activeCamera.position.z
            ],
            rotation: [
              sceneData.activeCamera.rotation.x,
              sceneData.activeCamera.rotation.y,
              sceneData.activeCamera.rotation.z
            ]
          } : {
            position: [5, 5, 5],
            fov: 50
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={isDragging ? 'dragging' : ''}
        >
          <Scene modelUrl={modelUrl} sceneData={sceneData} settings={settings} />
        </Canvas>
        {!modelUrl && !sceneData && (
          <div className="drop-zone">
            <p>Drag and drop a file here:</p>
            <ul className="file-types">
              <li>.gltf / .glb - 3D models</li>
              <li>.json - Three.js scene files</li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="controls-panel">
        <h2>OrbitControls Settings</h2>
        
        {sceneData?.cameras && sceneData.cameras.length > 1 && (
          <div className="camera-selector">
            <h3>Camera Selection</h3>
            <select 
              value={sceneData.cameras.indexOf(sceneData.activeCamera)}
              onChange={(e) => handleCameraChange(parseInt(e.target.value))}
              aria-label="Select camera view"
            >
              {sceneData.cameras.map((camera, index) => (
                <option key={index} value={index}>
                  Camera {index + 1} {camera instanceof PerspectiveCamera ? `(FOV: ${camera.fov}°)` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="control-group">
          <label>
            Min Distance: {settings.minDistance}
            <input
              type="range"
              min="0.1"
              max="50"
              step="0.1"
              value={settings.minDistance}
              onChange={(e) => updateSetting('minDistance', parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Max Distance: {settings.maxDistance}
            <input
              type="range"
              min="1"
              max="200"
              step="1"
              value={settings.maxDistance}
              onChange={(e) => updateSetting('maxDistance', parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Min Polar Angle: {(settings.minPolarAngle * 180 / Math.PI).toFixed(1)}°
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.01"
              value={settings.minPolarAngle}
              onChange={(e) => updateSetting('minPolarAngle', parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Max Polar Angle: {(settings.maxPolarAngle * 180 / Math.PI).toFixed(1)}°
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.01"
              value={settings.maxPolarAngle}
              onChange={(e) => updateSetting('maxPolarAngle', parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Min Azimuth Angle: {settings.minAzimuthAngle === -Infinity ? '-∞' : (settings.minAzimuthAngle * 180 / Math.PI).toFixed(1) + '°'}
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step="0.01"
              value={settings.minAzimuthAngle === -Infinity ? -Math.PI : settings.minAzimuthAngle}
              onChange={(e) => updateSetting('minAzimuthAngle', parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Max Azimuth Angle: {settings.maxAzimuthAngle === Infinity ? '∞' : (settings.maxAzimuthAngle * 180 / Math.PI).toFixed(1) + '°'}
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step="0.01"
              value={settings.maxAzimuthAngle === Infinity ? Math.PI : settings.maxAzimuthAngle}
              onChange={(e) => updateSetting('maxAzimuthAngle', parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={settings.enableDamping}
              onChange={(e) => updateSetting('enableDamping', e.target.checked)}
            />
            Enable Damping
          </label>
        </div>

        {settings.enableDamping && (
          <div className="control-group">
            <label>
              Damping Factor: {settings.dampingFactor}
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={settings.dampingFactor}
                onChange={(e) => updateSetting('dampingFactor', parseFloat(e.target.value))}
              />
            </label>
          </div>
        )}

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={settings.autoRotate}
              onChange={(e) => updateSetting('autoRotate', e.target.checked)}
            />
            Auto Rotate
          </label>
        </div>

        {settings.autoRotate && (
          <div className="control-group">
            <label>
              Auto Rotate Speed: {settings.autoRotateSpeed}
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={settings.autoRotateSpeed}
                onChange={(e) => updateSetting('autoRotateSpeed', parseFloat(e.target.value))}
              />
            </label>
          </div>
        )}

        <div className="values-display">
          <h3>Current Values:</h3>
          <pre>{JSON.stringify(settings, null, 2)}</pre>
          <button onClick={copyCurrentSettings} className="copy-button">
            Copy Current Settings
          </button>
        </div>

        <div className="json-input-section">
          <h3>Import JSON Settings:</h3>
          <textarea
            className="json-textarea"
            value={jsonInput}
            onChange={(e) => handleJsonInput(e.target.value)}
            placeholder="Paste your OrbitControls JSON configuration here..."
            rows={10}
          />
          <div className="json-controls">
            <button onClick={applyJsonSettings} className="apply-button">
              Apply Settings
            </button>
            {jsonError && (
              <div className={`json-message ${jsonError.includes('success') ? 'success' : 'error'}`}>
                {jsonError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
