import { useEffect } from 'react'
import type { ModelControlsSettings } from '../types'

const STORAGE_KEY = 'orbit-controls-settings'
const AXIS_LOCK_KEY = 'orbit-controls-axis-lock'

export const useSettingsStorage = (
  settings: ModelControlsSettings,
  enabled: boolean,
  setSettings: (settings: ModelControlsSettings) => void
) => {
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY)
    if (savedSettings && enabled) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch {
        // Invalid saved data, ignore
      }
    }
  }, [enabled, setSettings])

  useEffect(() => {
    if (enabled) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    }
  }, [settings, enabled])
}

export const loadAxisLockSetting = (): boolean => {
  const saved = localStorage.getItem(AXIS_LOCK_KEY)
  return saved !== null ? JSON.parse(saved) : true
}

export const saveAxisLockSetting = (enabled: boolean) => {
  localStorage.setItem(AXIS_LOCK_KEY, JSON.stringify(enabled))
}

export const clearSavedSettings = () => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(AXIS_LOCK_KEY)
}
