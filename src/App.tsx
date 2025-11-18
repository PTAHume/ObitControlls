import { Box, Divider, ThemeProvider, Typography, createTheme } from '@mui/material'
import { Canvas } from '@react-three/fiber'
import JSZip from 'jszip'
import type React from 'react'
import { useCallback, useState } from 'react'
import {
  Box3,
  Camera,
  type Object3D,
  ObjectLoader,
  PerspectiveCamera,
  Vector3,
  type WebGLRenderer,
} from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import './App.css'
import {
  AutoRotateControl,
  CameraSelector,
  DampingControl,
  ModelInfo,
  OrbitControlsMapping,
  PositionControl,
  RotationControl,
  ScaleControl,
} from './components/Controls'
import { Scene } from './components/Scene'
import { CurrentSettingsDisplay, SettingsImportExport } from './components/Settings'
import type { CurrentValues, ModelControlsSettings, SceneData } from './types'
import { roundNumber } from './utils/helpers'

// Create dark theme for MUI
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4a9eff',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
  },
  components: {
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
          },
        },
      },
    },
  },
})

function App() {
  const [sceneData, setSceneData] = useState<SceneData | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [currentValues, setCurrentValues] = useState<CurrentValues>({
    rotationX: 0,
    rotationY: 0,
    scale: 1,
  })
  const [settings, setSettings] = useState<ModelControlsSettings>({
    rotationX: 0,
    rotationY: 0,
    scale: 1,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    minRotationX: -Math.PI,
    maxRotationX: Math.PI,
    minRotationY: Number.NEGATIVE_INFINITY,
    maxRotationY: Number.POSITIVE_INFINITY,
    enableDamping: false,
    dampingFactor: 0.05,
    autoRotate: false,
    autoRotateSpeed: 2,
    useRotationXConstraints: false,
    useRotationYConstraints: false,
  })

  const handleControlsUpdate = useCallback(
    (rotationX: number, rotationY: number, scale: number) => {
      setCurrentValues({ rotationX, rotationY, scale })
    },
    []
  )

  const handleInteractiveChange = useCallback(
    (rotationX: number, rotationY: number, scale: number) => {
      setSettings(prev => ({
        ...prev,
        rotationX,
        rotationY,
        scale,
      }))
    },
    []
  )

  const updateSetting = <K extends keyof ModelControlsSettings>(
    key: K,
    value: ModelControlsSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleCameraChange = useCallback(
    (cameraIndex: number) => {
      if (!sceneData) return

      const newCamera = sceneData.cameras[cameraIndex]
      if (newCamera) {
        setSceneData(prev => (prev ? { ...prev, activeCamera: newCamera } : null))
      }
    },
    [sceneData]
  )

  // Setup scene with camera auto-positioning
  const setupSceneWithCamera = useCallback(
    (loadedScene: Object3D) => {
      // Find all cameras in the scene
      const cameras: Camera[] = []
      loadedScene.traverse(obj => {
        if (obj instanceof Camera) {
          cameras.push(obj)
        }
      })

      // Calculate bounding box of entire scene
      const bbox = new Box3().setFromObject(loadedScene)
      const size = new Vector3()
      const center = new Vector3()
      bbox.getSize(size)
      bbox.getCenter(center)

      // Handle edge cases for bounding box dimensions
      const maxDim = Math.max(size.x, size.y, size.z)
      const isInvalidDimension =
        maxDim === 0 || !Number.isFinite(maxDim) || maxDim < 0.0001 || maxDim > 10000

      let activeCamera: Camera

      if (cameras.length > 0) {
        activeCamera = cameras[0]
      } else {
        // Create default perspective camera with adaptive positioning
        const perspCamera = new PerspectiveCamera(
          50,
          window.innerWidth / window.innerHeight,
          0.1,
          2000
        )

        if (isInvalidDimension) {
          // Fallback for invalid dimensions
          perspCamera.position.set(5, 5, 5)
          perspCamera.lookAt(0, 0, 0)
          perspCamera.near = 0.01
          perspCamera.far = 1000
        } else {
          // Calculate optimal camera distance based on bounding box
          const aspect = window.innerWidth / window.innerHeight
          const fov = perspCamera.fov * (Math.PI / 180)
          const verticalFit = size.y / 2 / Math.tan(fov / 2)
          const horizontalFit = size.x / 2 / Math.tan(fov / 2) / aspect

          // Use the larger distance to ensure entire model is visible, with padding
          let cameraDistance = Math.max(verticalFit, horizontalFit) * 2.0

          // Add extra padding based on depth
          cameraDistance = Math.max(cameraDistance, size.z * 1.5)

          // Position camera at calculated distance
          const direction = new Vector3(1, 1, 1).normalize()
          perspCamera.position.copy(center).addScaledVector(direction, cameraDistance)
          perspCamera.lookAt(center)

          // Set near/far planes adaptively
          perspCamera.near = Math.max(0.01, cameraDistance * 0.01)
          perspCamera.far = Math.max(100, cameraDistance * 10)
        }

        perspCamera.updateProjectionMatrix()
        activeCamera = perspCamera
        cameras.push(perspCamera)
      }

      setSceneData({ scene: loadedScene, cameras, activeCamera })

      // Auto-reset rotation, scale, and position when loading new model
      if (sceneData) {
        setSettings(prev => ({
          ...prev,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          positionX: 0,
          positionY: 0,
          positionZ: 0,
        }))
      }

      setJsonError('Model loaded successfully!')
      setTimeout(() => setJsonError(''), 3000)
    },
    [sceneData]
  )

  // Helper function to load JSON scene
  const loadJsonScene = useCallback(
    (data: string) => {
      try {
        const json = JSON.parse(data)
        const loader = new ObjectLoader()

        loader.parse(json, object => {
          setupSceneWithCamera(object)
        })
      } catch (error: unknown) {
        console.error('Scene loading error:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        setJsonError(`Failed to parse scene JSON: ${errorMessage}`)
        setTimeout(() => setJsonError(''), 5000)
      }
    },
    [setupSceneWithCamera]
  )

  // Helper function to load GLTF/GLB
  const loadGltf = useCallback(
    (arrayBuffer: ArrayBuffer, fileName?: string) => {
      try {
        const loader = new GLTFLoader()

        // Set up Draco decoder for compressed models
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
        loader.setDRACOLoader(dracoLoader)

        // Set up KTX2 decoder for compressed textures
        const ktx2Loader = new KTX2Loader()
        ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.181.1/examples/jsm/libs/basis/')
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
        if (gl) {
          ktx2Loader.detectSupport({ getContext: () => gl } as unknown as WebGLRenderer)
        }
        loader.setKTX2Loader(ktx2Loader)

        // Check if this might actually be a ZIP file
        const uint8Array = new Uint8Array(arrayBuffer)
        const magicBytes = uint8Array.slice(0, 4)
        const isPossiblyZip =
          magicBytes[0] === 0x50 &&
          magicBytes[1] === 0x4b &&
          (magicBytes[2] === 0x03 || magicBytes[2] === 0x05 || magicBytes[2] === 0x07)

        if (isPossiblyZip) {
          console.warn(
            `File "${fileName}" appears to be a ZIP archive, not a GLB file. Attempting to extract...`
          )
          setJsonError('File appears to be a ZIP archive, not a GLB file. Attempting to extract...')
          setTimeout(() => setJsonError(''), 5000)
          loadZip(arrayBuffer)
          dracoLoader.dispose()
          ktx2Loader.dispose()
          return
        }

        loader.parse(
          arrayBuffer,
          '',
          gltf => {
            console.log('GLTF loaded:', gltf)
            setupSceneWithCamera(gltf.scene)
            dracoLoader.dispose()
            ktx2Loader.dispose()
          },
          error => {
            console.error('GLTF loading error:', error)
            const errorMessage = error instanceof Error ? error.message : String(error)
            setJsonError(`Failed to load GLTF/GLB: ${errorMessage}`)
            setTimeout(() => setJsonError(''), 5000)
            dracoLoader.dispose()
            ktx2Loader.dispose()
          }
        )
      } catch (error: unknown) {
        console.error('GLTF setup error:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        setJsonError(`GLTF setup failed: ${errorMessage}`)
        setTimeout(() => setJsonError(''), 5000)
      }
    },
    [setupSceneWithCamera]
  )

  // Helper function to load OBJ
  const loadObj = useCallback(
    (data: string) => {
      try {
        const loader = new OBJLoader()
        const obj = loader.parse(data)
        setupSceneWithCamera(obj)
      } catch (error: unknown) {
        console.error('OBJ loading error:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        setJsonError(`Failed to load OBJ: ${errorMessage}`)
        setTimeout(() => setJsonError(''), 5000)
      }
    },
    [setupSceneWithCamera]
  )

  // Helper function to load ZIP files
  const loadZip = useCallback(
    async (arrayBuffer: ArrayBuffer) => {
      try {
        const zip = new JSZip()
        const loadedZip = await zip.loadAsync(arrayBuffer)

        // Find the first 3D file in the ZIP
        const fileEntries = Object.entries(loadedZip.files)
        let found = false

        for (const [filename, zipEntry] of fileEntries) {
          // Skip directories and system files
          if (zipEntry.dir || filename.includes('__MACOSX') || filename.startsWith('.')) {
            continue
          }

          const lowerName = filename.toLowerCase()

          if (lowerName.endsWith('.json')) {
            console.log(`Loading JSON scene from ZIP: ${filename}`)
            const content = await zipEntry.async('string')
            loadJsonScene(content)
            found = true
            break
          }
          if (lowerName.endsWith('.gltf')) {
            console.log(`Loading GLTF from ZIP: ${filename}`)
            const content = await zipEntry.async('string')
            loadJsonScene(content)
            found = true
            break
          }
          if (lowerName.endsWith('.glb')) {
            console.log(`Loading GLB from ZIP: ${filename}`)
            const buffer = await zipEntry.async('arraybuffer')
            loadGltf(buffer, filename)
            found = true
            break
          }
          if (lowerName.endsWith('.obj')) {
            console.log(`Loading OBJ from ZIP: ${filename}`)
            const content = await zipEntry.async('string')
            loadObj(content)
            found = true
            break
          }
        }

        if (!found) {
          setJsonError(
            'No supported 3D file found in ZIP (.json, .gltf, .glb, .obj). Check the archive contents.'
          )
          setTimeout(() => setJsonError(''), 5000)
        }
      } catch (error: unknown) {
        console.error('ZIP loading error:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        setJsonError(`Failed to extract ZIP: ${errorMessage}`)
        setTimeout(() => setJsonError(''), 5000)
      }
    },
    [loadJsonScene, loadGltf, loadObj]
  )

  // Helper to determine file type and load accordingly
  const loadFileByExtension = useCallback(
    (file: File, arrayBuffer: ArrayBuffer) => {
      const fileName = file.name.toLowerCase()
      console.log(`Processing file: ${file.name} (${file.size} bytes, type: ${file.type})`)

      // Check for ZIP magic bytes first
      const uint8Array = new Uint8Array(arrayBuffer)
      const magicBytes = uint8Array.slice(0, 4)
      const isZipByMagicBytes =
        magicBytes[0] === 0x50 &&
        magicBytes[1] === 0x4b &&
        (magicBytes[2] === 0x03 || magicBytes[2] === 0x05 || magicBytes[2] === 0x07)

      if (isZipByMagicBytes) {
        console.log(
          `Detected ZIP file by magic bytes: ${Array.from(magicBytes.slice(0, 4))
            .map(b => `0x${b.toString(16).padStart(2, '0')}`)
            .join(' ')}`
        )
        loadZip(arrayBuffer)
        return
      }

      // Fall back to extension-based detection
      if (fileName.endsWith('.zip')) {
        loadZip(arrayBuffer)
      } else if (fileName.endsWith('.json')) {
        const decoder = new TextDecoder()
        const text = decoder.decode(arrayBuffer)
        loadJsonScene(text)
      } else if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
        loadGltf(arrayBuffer, file.name)
      } else if (fileName.endsWith('.obj')) {
        const decoder = new TextDecoder()
        const text = decoder.decode(arrayBuffer)
        loadObj(text)
      } else {
        setJsonError(
          `Unsupported file type: ${file.name}. Please use .json, .gltf, .glb, .obj, or .zip`
        )
        setTimeout(() => setJsonError(''), 5000)
      }
    },
    [loadZip, loadJsonScene, loadGltf, loadObj]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      const arrayBuffer = event.target?.result
      if (arrayBuffer instanceof ArrayBuffer) {
        loadFileByExtension(file, arrayBuffer)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleJsonInputChange = (value: string) => {
    setJsonInput(value)
    setJsonError('')
  }

  const applyJsonSettings = () => {
    try {
      const parsed = JSON.parse(jsonInput)

      // Start with current settings
      const validSettings: ModelControlsSettings = { ...settings }

      // Support OrbitControls-style properties
      if (typeof parsed.minPolarAngle === 'number') {
        validSettings.minRotationX = parsed.minPolarAngle
        validSettings.useRotationXConstraints = true
      }
      if (typeof parsed.maxPolarAngle === 'number') {
        validSettings.maxRotationX = parsed.maxPolarAngle
        validSettings.useRotationXConstraints = true
      }
      if (typeof parsed.minAzimuthAngle === 'number') {
        validSettings.minRotationY = parsed.minAzimuthAngle
        validSettings.useRotationYConstraints = true
      }
      if (typeof parsed.maxAzimuthAngle === 'number') {
        validSettings.maxRotationY = parsed.maxAzimuthAngle
        validSettings.useRotationYConstraints = true
      }

      // Support direct model control properties
      if (typeof parsed.rotationX === 'number') validSettings.rotationX = parsed.rotationX
      if (typeof parsed.rotationY === 'number') validSettings.rotationY = parsed.rotationY
      if (typeof parsed.scale === 'number') validSettings.scale = parsed.scale
      if (typeof parsed.positionX === 'number') validSettings.positionX = parsed.positionX
      if (typeof parsed.positionY === 'number') validSettings.positionY = parsed.positionY
      if (typeof parsed.positionZ === 'number') validSettings.positionZ = parsed.positionZ
      if (typeof parsed.minRotationX === 'number') {
        validSettings.minRotationX = parsed.minRotationX
        validSettings.useRotationXConstraints = true
      }
      if (typeof parsed.maxRotationX === 'number') {
        validSettings.maxRotationX = parsed.maxRotationX
        validSettings.useRotationXConstraints = true
      }
      if (typeof parsed.minRotationY === 'number') {
        validSettings.minRotationY = parsed.minRotationY
        validSettings.useRotationYConstraints = true
      }
      if (typeof parsed.maxRotationY === 'number') {
        validSettings.maxRotationY = parsed.maxRotationY
        validSettings.useRotationYConstraints = true
      }
      if (typeof parsed.enableDamping === 'boolean')
        validSettings.enableDamping = parsed.enableDamping
      if (typeof parsed.dampingFactor === 'number')
        validSettings.dampingFactor = parsed.dampingFactor
      if (typeof parsed.autoRotate === 'boolean') validSettings.autoRotate = parsed.autoRotate
      if (typeof parsed.autoRotateSpeed === 'number')
        validSettings.autoRotateSpeed = parsed.autoRotateSpeed

      setSettings(validSettings)
      setJsonError('Settings applied successfully!')
      setTimeout(() => setJsonError(''), 3000)
    } catch (_error) {
      setJsonError('Invalid JSON format. Please check your input.')
    }
  }

  // Build minimal export settings
  const getExportSettings = useCallback(() => {
    const exportSettings: Record<string, unknown> = {}

    // Only include rotation/scale/position if they differ from defaults
    if (roundNumber(settings.rotationX) !== 0)
      exportSettings.rotationX = roundNumber(settings.rotationX)
    if (roundNumber(settings.rotationY) !== 0)
      exportSettings.rotationY = roundNumber(settings.rotationY)
    if (roundNumber(settings.scale) !== 1) exportSettings.scale = roundNumber(settings.scale)
    if (roundNumber(settings.positionX) !== 0)
      exportSettings.positionX = roundNumber(settings.positionX)
    if (roundNumber(settings.positionY) !== 0)
      exportSettings.positionY = roundNumber(settings.positionY)
    if (roundNumber(settings.positionZ) !== 0)
      exportSettings.positionZ = roundNumber(settings.positionZ)

    // Add constraints only if enabled
    if (settings.useRotationXConstraints) {
      exportSettings.minRotationX = roundNumber(settings.minRotationX)
      exportSettings.maxRotationX = roundNumber(settings.maxRotationX)
    }
    if (settings.useRotationYConstraints) {
      exportSettings.minRotationY =
        settings.minRotationY === Number.NEGATIVE_INFINITY
          ? Number.NEGATIVE_INFINITY
          : roundNumber(settings.minRotationY)
      exportSettings.maxRotationY =
        settings.maxRotationY === Number.POSITIVE_INFINITY
          ? Number.POSITIVE_INFINITY
          : roundNumber(settings.maxRotationY)
    }

    // Only include damping if enabled
    if (settings.enableDamping) {
      exportSettings.enableDamping = true
      if (roundNumber(settings.dampingFactor) !== 0.05) {
        exportSettings.dampingFactor = roundNumber(settings.dampingFactor)
      }
    }

    // Only include auto-rotate if enabled
    if (settings.autoRotate) {
      exportSettings.autoRotate = true
      if (roundNumber(settings.autoRotateSpeed) !== 2) {
        exportSettings.autoRotateSpeed = roundNumber(settings.autoRotateSpeed)
      }
    }

    return exportSettings
  }, [settings])

  const copyCurrentSettings = () => {
    const exportSettings = getExportSettings()
    if (Object.keys(exportSettings).length === 0) {
      setJsonError('All settings are at default values - nothing to export!')
      setTimeout(() => setJsonError(''), 3000)
      return
    }
    const jsonString = JSON.stringify(exportSettings, null, 2)
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
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      minRotationX: -Math.PI,
      maxRotationX: Math.PI,
      minRotationY: Number.NEGATIVE_INFINITY,
      maxRotationY: Number.POSITIVE_INFINITY,
      enableDamping: false,
      dampingFactor: 0.05,
      autoRotate: false,
      autoRotateSpeed: 2,
      useRotationXConstraints: false,
      useRotationYConstraints: false,
    })
  }

  const clearScene = () => {
    setSceneData(null)
    setJsonError('Scene cleared. Drop a 3D file to load.')
    setTimeout(() => setJsonError(''), 3000)
  }

  const resetView = () => {
    setSettings(prev => ({
      ...prev,
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      positionX: 0,
      positionY: 0,
      positionZ: 0,
    }))
    setJsonError('View reset to defaults.')
    setTimeout(() => setJsonError(''), 2000)
  }

  const exportSettingsObj = getExportSettings()
  const hasExportSettings = Object.keys(exportSettingsObj).length > 0

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="app">
        <div
          className={`canvas-container ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Canvas>
            <Scene
              sceneData={sceneData}
              settings={settings}
              onControlsUpdate={handleControlsUpdate}
              onInteractiveChange={handleInteractiveChange}
            />
          </Canvas>
          {!sceneData && (
            <div className="drop-zone">
              <p>Drag and drop your 3D model here</p>
              <ul className="file-types">
                <li>Three.js Scene (.json)</li>
                <li>GLTF / GLB (.gltf, .glb)</li>
                <li>Wavefront OBJ (.obj)</li>
                <li>ZIP archives (.zip) containing any of the above</li>
              </ul>
            </div>
          )}
          {sceneData && (
            <div className="interaction-hint">
              <p>
                🖱️ <strong>Drag</strong> to rotate • <strong>Scroll</strong> to zoom
              </p>
            </div>
          )}
        </div>

        <Box
          sx={{
            width: 450,
            bgcolor: 'background.paper',
            p: 3,
            overflowY: 'auto',
            borderLeft: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h5" gutterBottom>
            Model Controls
          </Typography>

          <ModelInfo
            currentValues={currentValues}
            hasScene={!!sceneData}
            onResetControls={resetControls}
            onResetView={resetView}
            onClearScene={clearScene}
          />

          {sceneData && (
            <CameraSelector sceneData={sceneData} onCameraChange={handleCameraChange} />
          )}

          <OrbitControlsMapping />

          <RotationControl
            axis="X"
            value={settings.rotationX}
            minValue={settings.minRotationX}
            maxValue={settings.maxRotationX}
            useConstraints={settings.useRotationXConstraints}
            sliderMin={settings.minRotationX}
            sliderMax={settings.maxRotationX}
            onValueChange={value => updateSetting('rotationX', value)}
            onMinChange={value => updateSetting('minRotationX', value)}
            onMaxChange={value => updateSetting('maxRotationX', value)}
            onConstraintsToggle={enabled => updateSetting('useRotationXConstraints', enabled)}
          />

          <RotationControl
            axis="Y"
            value={settings.rotationY}
            minValue={settings.minRotationY}
            maxValue={settings.maxRotationY}
            useConstraints={settings.useRotationYConstraints}
            sliderMin={
              settings.minRotationY === Number.NEGATIVE_INFINITY ? -Math.PI : settings.minRotationY
            }
            sliderMax={
              settings.maxRotationY === Number.POSITIVE_INFINITY ? Math.PI : settings.maxRotationY
            }
            disabled={settings.autoRotate}
            onValueChange={value => updateSetting('rotationY', value)}
            onMinChange={value => updateSetting('minRotationY', value)}
            onMaxChange={value => updateSetting('maxRotationY', value)}
            onConstraintsToggle={enabled => updateSetting('useRotationYConstraints', enabled)}
          />

          <ScaleControl value={settings.scale} onChange={value => updateSetting('scale', value)} />

          <PositionControl
            positionX={settings.positionX}
            positionY={settings.positionY}
            positionZ={settings.positionZ}
            onPositionXChange={value => updateSetting('positionX', value)}
            onPositionYChange={value => updateSetting('positionY', value)}
            onPositionZChange={value => updateSetting('positionZ', value)}
          />

          <DampingControl
            enabled={settings.enableDamping}
            factor={settings.dampingFactor}
            onEnabledChange={enabled => updateSetting('enableDamping', enabled)}
            onFactorChange={factor => updateSetting('dampingFactor', factor)}
          />

          <AutoRotateControl
            enabled={settings.autoRotate}
            speed={settings.autoRotateSpeed}
            onEnabledChange={enabled => updateSetting('autoRotate', enabled)}
            onSpeedChange={speed => updateSetting('autoRotateSpeed', speed)}
          />

          <Divider sx={{ my: 3 }} />

          <SettingsImportExport
            jsonInput={jsonInput}
            jsonError={jsonError}
            onJsonInputChange={handleJsonInputChange}
            onApplySettings={applyJsonSettings}
            onCopySettings={copyCurrentSettings}
          />

          <CurrentSettingsDisplay settings={exportSettingsObj} hasSettings={hasExportSettings} />
        </Box>
      </div>
    </ThemeProvider>
  )
}

export default App
