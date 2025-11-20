import { Box, Divider, FormControlLabel, Switch, ThemeProvider, Typography } from '@mui/material'
import { Canvas } from '@react-three/fiber'
import { type DragEvent, useCallback, useEffect, useMemo, useState } from 'react'
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
import { ErrorBoundary } from './components/ErrorBoundary'
import { Scene } from './components/Scene'
import { CurrentSettingsDisplay, SettingsImportExport } from './components/Settings'
import { useFileLoader, useSceneSetup, useSettingsManager } from './hooks'
import {
  clearSavedSettings,
  loadAxisLockSetting,
  saveAxisLockSetting,
  useSettingsStorage,
} from './hooks/useLocalStorage'
import { darkTheme } from './theme/theme'
import type { CurrentValues } from './types'
import { copyToClipboard } from './utils/clipboard'

function App() {
  const { loadFile, isLoading, error: loadError } = useFileLoader()
  const { sceneData, setupScene, clearScene, changeCamera } = useSceneSetup()
  const [savedSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('orbit-controls-settings')
      return saved ? JSON.parse(saved) : undefined
    } catch {
      return undefined
    }
  })
  const {
    settings,
    updateSetting,
    updateMultipleSettings,
    applyJsonSettings,
    getExportSettings,
    resetSettings,
    resetView,
    resetViewOnLoad,
  } = useSettingsManager(savedSettings)

  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [enableAxisLock, setEnableAxisLock] = useState(() => loadAxisLockSetting())
  const [enableAutoSave, setEnableAutoSave] = useState(true)

  useSettingsStorage(settings, enableAutoSave)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          resetView()
          break
        case ' ':
          e.preventDefault()
          updateSetting('autoRotate', !settings.autoRotate)
          break
        case 'escape':
          if (sceneData) {
            clearScene()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [resetView, updateSetting, settings.autoRotate, clearScene, sceneData])

  useEffect(() => {
    saveAxisLockSetting(enableAxisLock)
  }, [enableAxisLock])

  const currentValues: CurrentValues = useMemo(
    () => ({
      rotationX: settings.rotationX,
      rotationY: settings.rotationY,
      scale: settings.scale,
    }),
    [settings.rotationX, settings.rotationY, settings.scale]
  )

  const exportSettingsObj = useMemo(() => getExportSettings(), [getExportSettings])
  const hasExportSettings = useMemo(
    () => Object.keys(exportSettingsObj).length > 0,
    [exportSettingsObj]
  )

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length === 0) return

      const file = droppedFiles[0]
      const fileSizeMB = file.size / (1024 * 1024)

      if (fileSizeMB > 50) {
        const proceed = window.confirm(
          `Warning: This file is ${fileSizeMB.toFixed(1)} MB. Large files may cause the browser to freeze. Continue?`
        )
        if (!proceed) return
      }

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

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

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

  const handleCopySettings = useCallback(async () => {
    if (!hasExportSettings) {
      setJsonError('No settings to copy (all values are at defaults)')
      setTimeout(() => setJsonError(''), 3000)
      return
    }

    const jsonString = JSON.stringify(exportSettingsObj, null, 2)
    const success = await copyToClipboard(jsonString)

    if (success) {
      setJsonError('Settings copied to clipboard!')
      setTimeout(() => setJsonError(''), 3000)
    } else {
      setJsonError('Failed to copy to clipboard')
      setTimeout(() => setJsonError(''), 3000)
    }
  }, [exportSettingsObj, hasExportSettings])

  const handleControlsUpdate = useCallback(
    (rotationX: number, rotationY: number, scale: number) => {
      updateMultipleSettings({ rotationX, rotationY, scale })
    },
    [updateMultipleSettings]
  )

  const handleInteractiveChange = useCallback(
    (rotationX: number, rotationY: number, scale: number) => {
      updateMultipleSettings({ rotationX, rotationY, scale })
    },
    [updateMultipleSettings]
  )

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="app-container">
        <div className="canvas-container" onDrop={handleDrop} onDragOver={handleDragOver}>
          <ErrorBoundary>
            <Canvas>
              <Scene
                sceneData={sceneData}
                settings={settings}
                enableAxisLock={enableAxisLock}
                onControlsUpdate={handleControlsUpdate}
                onInteractiveChange={handleInteractiveChange}
              />
            </Canvas>
          </ErrorBoundary>
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
                🖱️ <strong>Drag left/right</strong> to spin • <strong>Drag up/down</strong> to tilt •{' '}
                <strong>Scroll</strong> to zoom
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

          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={enableAxisLock}
                  onChange={e => setEnableAxisLock(e.target.checked)}
                />
              }
              label="Lock Drag to Single Axis"
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              When enabled, dragging locks to horizontal or vertical rotation based on initial
              movement direction
            </Typography>
          </Box>

          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Keyboard Shortcuts
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
              <strong>R</strong> - Reset view • <strong>Space</strong> - Toggle auto-rotate •{' '}
              <strong>Esc</strong> - Clear scene
            </Typography>
          </Box>

          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={enableAutoSave}
                  onChange={e => setEnableAutoSave(e.target.checked)}
                />
              }
              label="Auto-Save Settings"
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Automatically saves and restores your settings between sessions
            </Typography>
            {enableAutoSave && (
              <Typography
                variant="caption"
                component="button"
                onClick={() => {
                  clearSavedSettings()
                  setJsonError('Saved settings cleared!')
                  setTimeout(() => setJsonError(''), 3000)
                }}
                sx={{
                  mt: 1,
                  display: 'block',
                  color: 'primary.main',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Clear saved settings
              </Typography>
            )}
          </Box>

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
