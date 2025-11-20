import { useCallback, useState } from 'react'
import { applyOrbitControlsMapping, buildMinimalExportSettings } from '../services/settingsUtils'
import type { ModelControlsSettings } from '../types'

const DEFAULT_SETTINGS: ModelControlsSettings = {
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
}

export const useSettingsManager = () => {
  const [settings, setSettings] = useState<ModelControlsSettings>(DEFAULT_SETTINGS)

  const updateSetting = useCallback(
    <K extends keyof ModelControlsSettings>(key: K, value: ModelControlsSettings[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }))
    },
    []
  )

  const updateMultipleSettings = useCallback((updates: Partial<ModelControlsSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const applyJsonSettings = useCallback(
    (jsonString: string): { success: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(jsonString)
        const updates = applyOrbitControlsMapping(parsed)
        setSettings(prev => ({ ...prev, ...updates }))
        return { success: true }
      } catch (_error) {
        return { success: false, error: 'Invalid JSON format. Please check your input.' }
      }
    },
    []
  )

  const getExportSettings = useCallback(() => {
    return buildMinimalExportSettings(settings)
  }, [settings])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const resetView = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      positionX: 0,
      positionY: 0,
      positionZ: 0,
    }))
  }, [])

  const resetViewOnLoad = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      positionX: 0,
      positionY: 0,
      positionZ: 0,
    }))
  }, [])

  return {
    settings,
    updateSetting,
    updateMultipleSettings,
    applyJsonSettings,
    getExportSettings,
    resetSettings,
    resetView,
    resetViewOnLoad,
  }
}
