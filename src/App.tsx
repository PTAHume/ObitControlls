import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, Grid, Environment } from '@react-three/drei'
import { Object3D, ObjectLoader, Camera, PerspectiveCamera } from 'three'
import './App.css'

interface ModelControlsSettings {
  rotationX: number
  rotationY: number
  scale: number
  minRotationX: number
  maxRotationX: number
  minRotationY: number
  maxRotationY: number
  minScale: number
  maxScale: number
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

function SceneModel({ sceneData }: { sceneData: SceneData | null }) {
  if (sceneData) {
    return <primitive object={sceneData.scene} />
  }
  return null
}

function Scene({ sceneData, settings, onControlsUpdate }: {
  sceneData: SceneData | null,
  settings: ModelControlsSettings,
  onControlsUpdate: (rotationX: number, rotationY: number, scale: number) => void
}) {
  const modelGroupRef = useRef<any>(null)
  const { camera } = useThree()
  const currentRotationX = useRef(0)
  const currentRotationY = useRef(0)
  const currentScale = useRef(1)

  // Set camera when scene data changes
  useEffect(() => {
    if (sceneData?.activeCamera) {
      const activeCamera = sceneData.activeCamera
      camera.position.copy(activeCamera.position)
      camera.rotation.copy(activeCamera.rotation)
      if (activeCamera instanceof PerspectiveCamera) {
        (camera as PerspectiveCamera).fov = activeCamera.fov
        camera.updateProjectionMatrix()
      }
    }
  }, [sceneData?.activeCamera, camera])

  // Apply model transformations
  useFrame((_state, delta) => {
    if (modelGroupRef.current) {
      // Handle auto rotation
      if (settings.autoRotate) {
        currentRotationY.current += delta * settings.autoRotateSpeed * 0.5
        // Don't apply Y constraints during auto-rotate for continuous rotation
      }

      // Apply damping or direct values
      if (settings.enableDamping) {
        currentRotationX.current += (settings.rotationX - currentRotationX.current) * settings.dampingFactor
        if (!settings.autoRotate) {
          currentRotationY.current += (settings.rotationY - currentRotationY.current) * settings.dampingFactor
        }
        currentScale.current += (settings.scale - currentScale.current) * settings.dampingFactor
      } else {
        currentRotationX.current = settings.rotationX
        currentRotationY.current = settings.autoRotate ? currentRotationY.current : settings.rotationY
        currentScale.current = settings.scale
      }

      // Apply constraints (skip Y constraints if auto-rotating)
      currentRotationX.current = Math.max(settings.minRotationX, Math.min(settings.maxRotationX, currentRotationX.current))
      if (!settings.autoRotate) {
        currentRotationY.current = Math.max(settings.minRotationY, Math.min(settings.maxRotationY, currentRotationY.current))
      }
      currentScale.current = Math.max(settings.minScale, Math.min(settings.maxScale, currentScale.current))

      // Apply transformations
      modelGroupRef.current.rotation.x = currentRotationX.current
      modelGroupRef.current.rotation.y = currentRotationY.current
      modelGroupRef.current.scale.setScalar(currentScale.current)

      // Report current values
      onControlsUpdate(currentRotationX.current, currentRotationY.current, currentScale.current)
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
      <Environment preset="studio" />

      <group ref={modelGroupRef}>
        {sceneData && (
          <Center>
            <SceneModel sceneData={sceneData} />
          </Center>
        )}
      </group>
    </>
  )
}

function App() {
  const [sceneData, setSceneData] = useState<SceneData | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [jsonInput, setJsonInput] = useState<string>('')
  const [jsonError, setJsonError] = useState<string>('')
  const [currentValues, setCurrentValues] = useState({
    rotationX: 0,
    rotationY: 0,
    scale: 1
  })
  const [settings, setSettings] = useState<ModelControlsSettings>({
    rotationX: 0,
    rotationY: 0,
    scale: 1,
    minRotationX: -Math.PI,
    maxRotationX: Math.PI,
    minRotationY: -Infinity,
    maxRotationY: Infinity,
    minScale: 0.1,
    maxScale: 5,
    enableDamping: true,
    dampingFactor: 0.05,
    autoRotate: false,
    autoRotateSpeed: 2
  })

  const handleControlsUpdate = useCallback((rotationX: number, rotationY: number, scale: number) => {
    setCurrentValues({ rotationX, rotationY, scale })
  }, [])

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
    if (file && file.name.endsWith('.json')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string)

          const loader = new ObjectLoader()
          const cameras: Camera[] = []
          let defaultCamera: Camera | undefined

          // Simple parse - let ObjectLoader handle the format detection
          loader.parse(json, (object) => {
            // Find all cameras in the scene
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
              defaultCam.lookAt(0, 0, 0)
              cameras.push(defaultCam)
              defaultCamera = defaultCam
            }

            setSceneData({
              scene: object,
              cameras: cameras,
              activeCamera: defaultCamera!
            })
            setJsonError('Scene loaded successfully!')
            setTimeout(() => setJsonError(''), 3000)
          })
        } catch (error: any) {
          console.error('Scene loading error:', error)
          setJsonError(`Failed to parse scene JSON: ${error?.message || error}`)
          setTimeout(() => setJsonError(''), 5000)
        }
      }
      reader.readAsText(file)
    } else {
      alert('Please drop a .json scene file')
    }
  }, [])

  const updateSetting = (key: keyof ModelControlsSettings, value: number | boolean) => {
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
      const validSettings: ModelControlsSettings = {
        rotationX: typeof parsed.rotationX === 'number' ? parsed.rotationX : settings.rotationX,
        rotationY: typeof parsed.rotationY === 'number' ? parsed.rotationY : settings.rotationY,
        scale: typeof parsed.scale === 'number' ? parsed.scale : settings.scale,
        minRotationX: typeof parsed.minRotationX === 'number' ? parsed.minRotationX : settings.minRotationX,
        maxRotationX: typeof parsed.maxRotationX === 'number' ? parsed.maxRotationX : settings.maxRotationX,
        minRotationY: typeof parsed.minRotationY === 'number' ? parsed.minRotationY : settings.minRotationY,
        maxRotationY: typeof parsed.maxRotationY === 'number' ? parsed.maxRotationY : settings.maxRotationY,
        minScale: typeof parsed.minScale === 'number' ? parsed.minScale : settings.minScale,
        maxScale: typeof parsed.maxScale === 'number' ? parsed.maxScale : settings.maxScale,
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

  const resetControls = () => {
    setSettings({
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      minRotationX: -Math.PI,
      maxRotationX: Math.PI,
      minRotationY: -Infinity,
      maxRotationY: Infinity,
      minScale: 0.1,
      maxScale: 5,
      enableDamping: true,
      dampingFactor: 0.05,
      autoRotate: false,
      autoRotateSpeed: 2
    })
  }

  return (
    <div className="app">
      <div className="canvas-container">
        <Canvas
          camera={sceneData?.activeCamera ? {
            fov: (sceneData.activeCamera as PerspectiveCamera).fov || 50,
            position: [
              sceneData.activeCamera.position.x,
              sceneData.activeCamera.position.y,
              sceneData.activeCamera.position.z
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
          <Scene
            sceneData={sceneData}
            settings={settings}
            onControlsUpdate={handleControlsUpdate}
          />
        </Canvas>
        {!sceneData && (
          <div className="drop-zone">
            <p>Drag and drop a Three.js scene.json file here</p>
          </div>
        )}
      </div>

      <div className="controls-panel">
        <h2>Model Controls</h2>

        <div className="model-info-display">
          <h3>Current Model Values</h3>
          <div className="model-values">
            <div>Rotation X: <strong>{(currentValues.rotationX * 180 / Math.PI).toFixed(1)}°</strong></div>
            <div>Rotation Y: <strong>{(currentValues.rotationY * 180 / Math.PI).toFixed(1)}°</strong></div>
            <div>Scale: <strong>{currentValues.scale.toFixed(2)}</strong></div>
          </div>
          <button onClick={resetControls} className="reset-button">
            Reset to Default
          </button>
        </div>

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

        <details className="orbit-controls-mapping">
          <summary style={{ cursor: 'pointer', padding: '0.75rem', backgroundColor: '#1a1a1a', borderRadius: '8px', marginBottom: '1rem' }}>
            <strong style={{ color: '#4a9eff' }}>📚 OrbitControls → Model Controls Mapping</strong>
          </summary>
          <div style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              This tool achieves the same visual results as OrbitControls but by manipulating the model instead of the camera:
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #444' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#4a9eff' }}>OrbitControls</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#4a9eff' }}>Model Controls</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '0.5rem' }}>minPolarAngle / maxPolarAngle</td>
                  <td style={{ padding: '0.5rem' }}>minRotationX / maxRotationX</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '0.5rem' }}>minAzimuthAngle / maxAzimuthAngle</td>
                  <td style={{ padding: '0.5rem' }}>minRotationY / maxRotationY</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '0.5rem' }}>minDistance / maxDistance</td>
                  <td style={{ padding: '0.5rem' }}>maxScale / minScale (inverted)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '0.5rem' }}>enableDamping / dampingFactor</td>
                  <td style={{ padding: '0.5rem' }}>enableDamping / dampingFactor</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '0.5rem' }}>autoRotate / autoRotateSpeed</td>
                  <td style={{ padding: '0.5rem' }}>autoRotate / autoRotateSpeed</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '0.5rem' }}>enableZoom</td>
                  <td style={{ padding: '0.5rem' }}>Scale constraints</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '0.5rem' }}>enableRotate</td>
                  <td style={{ padding: '0.5rem' }}>Rotation constraints</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem' }}>enablePan</td>
                  <td style={{ padding: '0.5rem' }}>Not needed (camera fixed)</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: '1rem', marginBottom: '0', fontStyle: 'italic', color: '#888' }}>
              💡 Tip: Scale is inverted - smaller scale = camera farther away, larger scale = camera closer
            </p>
          </div>
        </details>

        <div className="control-group main">
          <label>
            Rotation X: {(settings.rotationX * 180 / Math.PI).toFixed(1)}°
            <input
              type="range"
              min={settings.minRotationX}
              max={settings.maxRotationX}
              step="0.01"
              value={settings.rotationX}
              onChange={(e) => updateSetting('rotationX', parseFloat(e.target.value))}
            />
          </label>
          <div className="control-help">
            Rotates the model up and down (pitch)
          </div>
        </div>

        <div className="constraint-group">
          <h4>X Rotation Constraints</h4>
          <div className="control-help" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Similar to OrbitControls' minPolarAngle/maxPolarAngle but for model rotation.
            In OrbitControls: camera orbits vertically. Here: model rotates up/down.
          </div>
          <div className="control-group constraint">
            <label>
              Min Rotation X: {(settings.minRotationX * 180 / Math.PI).toFixed(1)}°
              <input
                type="range"
                min={-Math.PI}
                max={0}
                step="0.01"
                value={settings.minRotationX}
                onChange={(e) => updateSetting('minRotationX', parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="control-group constraint">
            <label>
              Max Rotation X: {(settings.maxRotationX * 180 / Math.PI).toFixed(1)}°
              <input
                type="range"
                min={0}
                max={Math.PI}
                step="0.01"
                value={settings.maxRotationX}
                onChange={(e) => updateSetting('maxRotationX', parseFloat(e.target.value))}
              />
            </label>
          </div>
        </div>

        <div className="control-group main">
          <label>
            Rotation Y: {(settings.rotationY * 180 / Math.PI).toFixed(1)}°
            <input
              type="range"
              min={settings.minRotationY === -Infinity ? -Math.PI : settings.minRotationY}
              max={settings.maxRotationY === Infinity ? Math.PI : settings.maxRotationY}
              step="0.01"
              value={settings.rotationY}
              onChange={(e) => updateSetting('rotationY', parseFloat(e.target.value))}
              disabled={settings.autoRotate}
            />
          </label>
          <div className="control-help">
            Rotates the model left and right (yaw)
          </div>
        </div>

        <div className="constraint-group">
          <h4>Y Rotation Constraints</h4>
          <div className="control-help" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Similar to OrbitControls' minAzimuthAngle/maxAzimuthAngle but for model rotation.
            In OrbitControls: camera orbits horizontally. Here: model rotates left/right.
            Note: Constraints don't apply during auto-rotate for continuous spin.
          </div>
          <div className="control-group constraint">
            <label>
              Min Rotation Y: {settings.minRotationY === -Infinity ? '-∞' : (settings.minRotationY * 180 / Math.PI).toFixed(1) + '°'}
              <input
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step="0.01"
                value={settings.minRotationY === -Infinity ? -Math.PI : settings.minRotationY}
                onChange={(e) => updateSetting('minRotationY', parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="control-group constraint">
            <label>
              Max Rotation Y: {settings.maxRotationY === Infinity ? '∞' : (settings.maxRotationY * 180 / Math.PI).toFixed(1) + '°'}
              <input
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step="0.01"
                value={settings.maxRotationY === Infinity ? Math.PI : settings.maxRotationY}
                onChange={(e) => updateSetting('maxRotationY', parseFloat(e.target.value))}
              />
            </label>
          </div>
        </div>

        <div className="control-group main">
          <label>
            Scale: {settings.scale.toFixed(2)}
            <input
              type="range"
              min={settings.minScale}
              max={settings.maxScale}
              step="0.01"
              value={settings.scale}
              onChange={(e) => updateSetting('scale', parseFloat(e.target.value))}
            />
          </label>
          <div className="control-help">
            Adjusts the size of the model
          </div>
        </div>

        <div className="constraint-group">
          <h4>Scale Constraints</h4>
          <div className="control-help" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Similar to OrbitControls' minDistance/maxDistance but inverted for model scale.
            In OrbitControls: camera zoom limits. Here: model size limits.
            Small scale = zoomed out view, Large scale = zoomed in view.
          </div>
          <div className="control-group constraint">
            <label>
              Min Scale: {settings.minScale.toFixed(2)}
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.01"
                value={settings.minScale}
                onChange={(e) => updateSetting('minScale', parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="control-group constraint">
            <label>
              Max Scale: {settings.maxScale.toFixed(2)}
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={settings.maxScale}
                onChange={(e) => updateSetting('maxScale', parseFloat(e.target.value))}
              />
            </label>
          </div>
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
          <div className="control-help">
            Smooths out model movements
          </div>
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
            <div className="control-help">
              Lower values = smoother movement
            </div>
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
          <h3>Current Settings:</h3>
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
            placeholder="Paste your model control JSON configuration here..."
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