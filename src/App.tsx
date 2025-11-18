import { Box, Divider, ThemeProvider, Typography } from '@mui/material'
import { Canvas } from '@react-three/fiber'
import { useCallback, useMemo, useState } from 'react'
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
import { useFileLoader, useSceneSetup, useSettingsManager } from './hooks'
import { darkTheme } from './theme/theme'
import type { CurrentValues } from './types'

function App() {
  const { loadFile, isLoading, error: loadError } = useFileLoader()
  const { sceneData, setupScene, clearScene, changeCamera } = useSceneSetup()
  const {
    settings,
    updateSetting,
    applyJsonSettings,
    getExportSettings,
    resetSettings,
    resetView,
    resetViewOnLoad,
  } = useSettingsManager()

  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')

  // Calculate current values for display
  const currentValues: CurrentValues = useMemo(
    () => ({
      rotationX: settings.rotationX,
      rotationY: settings.rotationY,
      scale: settings.scale,
    }),
    [settings.rotationX, settings.rotationY, settings.scale]
  )

  // Export settings
  const exportSettingsObj = useMemo(() => getExportSettings(), [getExportSettings])
  const hasExportSettings = useMemo(
    () => Object.keys(exportSettingsObj).length > 0,
    [exportSettingsObj]
  )

  // Handle file drop
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length === 0) return

      const file = droppedFiles[0]
      const loadedScene = await loadFile(file)

      if (loadedScene) {
        setupScene(loadedScene)
        resetViewOnLoad()
        setJsonError('Model loaded successfully!')
        setTimeout(() => setJsonError(''), 3000)
      } else {
        setJsonError(loadError || 'Failed to load file')
        setTimeout(() => setJsonError(''), 5000)
      }
    },
    [loadFile, setupScene, resetViewOnLoad, loadError]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Handle JSON settings import
  const handleJsonInputChange = useCallback((value: string) => {
    setJsonInput(value)
    setJsonError('')
  }, [])

  const handleApplySettings = useCallback(() => {
    if (!jsonInput.trim()) {
      setJsonError('Please enter JSON settings to apply.')
      return
    }

    const result = applyJsonSettings(jsonInput)
    if (result.success) {
      setJsonError('Settings applied successfully!')
      setTimeout(() => setJsonError(''), 3000)
    } else {
      setJsonError(result.error || 'Failed to apply settings')
    }
  }, [jsonInput, applyJsonSettings])

  // Handle copy current settings
  const handleCopySettings = useCallback(() => {
    if (!hasExportSettings) {
      setJsonError('No settings to copy (all values are at defaults)')
      setTimeout(() => setJsonError(''), 3000)
      return
    }

    const jsonString = JSON.stringify(exportSettingsObj, null, 2)
    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        setJsonError('Settings copied to clipboard!')
        setTimeout(() => setJsonError(''), 3000)
      })
      .catch(() => {
        setJsonError('Failed to copy to clipboard')
        setTimeout(() => setJsonError(''), 3000)
      })
  }, [exportSettingsObj, hasExportSettings])

  // Handle controls update from Scene (called during user interaction)
  const handleControlsUpdate = useCallback(
    (rotationX: number, rotationY: number, scale: number) => {
      updateSetting('rotationX', rotationX)
      updateSetting('rotationY', rotationY)
      updateSetting('scale', scale)
    },
    [updateSetting]
  )

  // Handle interactive change from Scene (same as handleControlsUpdate for now)
  const handleInteractiveChange = useCallback(
    (rotationX: number, rotationY: number, scale: number) => {
      updateSetting('rotationX', rotationX)
      updateSetting('rotationY', rotationY)
      updateSetting('scale', scale)
    },
    [updateSetting]
  )

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="app-container">
        <div
          className="canvas-container"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
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
          {isLoading && (
            <div className="loading-overlay">
              <p>Loading model...</p>
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
            onResetControls={resetSettings}
            onResetView={resetView}
            onClearScene={() => {
              clearScene()
              setJsonError('Scene cleared!')
              setTimeout(() => setJsonError(''), 3000)
            }}
          />

          {sceneData && <CameraSelector sceneData={sceneData} onCameraChange={changeCamera} />}

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
            onApplySettings={handleApplySettings}
            onCopySettings={handleCopySettings}
          />

          <CurrentSettingsDisplay settings={exportSettingsObj} hasSettings={hasExportSettings} />
        </Box>
      </div>
    </ThemeProvider>
  )
}

export default App
