import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center, Grid, Environment } from '@react-three/drei'
import { Object3D } from 'three'
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

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function Scene({ modelUrl, settings }: { modelUrl: string | null, settings: OrbitControlsSettings }) {
  const controlsRef = useRef<any>(null)

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
      <Environment preset="studio" />
      
      {modelUrl && (
        <Center>
          <Model url={modelUrl} />
        </Center>
      )}
      
      <OrbitControls
        ref={controlsRef}
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
      />
    </>
  )
}

function App() {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.gltf') || file.name.endsWith('.glb'))) {
      const url = URL.createObjectURL(file)
      setModelUrl(url)
    } else {
      alert('Please drop a .gltf or .glb file')
    }
  }, [])

  const updateSetting = (key: keyof OrbitControlsSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="app">
      <div className="canvas-container">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={isDragging ? 'dragging' : ''}
        >
          <Scene modelUrl={modelUrl} settings={settings} />
        </Canvas>
        {!modelUrl && (
          <div className="drop-zone">
            <p>Drag and drop a .gltf or .glb file here</p>
          </div>
        )}
      </div>
      
      <div className="controls-panel">
        <h2>OrbitControls Settings</h2>
        
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
        </div>
      </div>
    </div>
  )
}

export default App
