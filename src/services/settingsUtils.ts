import type { ModelControlsSettings } from '../types'
import { roundNumber } from '../utils/helpers'

export const applyOrbitControlsMapping = (
  parsed: Record<string, unknown>
): Partial<ModelControlsSettings> => {
  const updates: Partial<ModelControlsSettings> = {}
  if (typeof parsed.minPolarAngle === 'number') {
    updates.minRotationX = parsed.minPolarAngle
    updates.useRotationXConstraints = true
  }
  if (typeof parsed.maxPolarAngle === 'number') {
    updates.maxRotationX = parsed.maxPolarAngle
    updates.useRotationXConstraints = true
  }
  if (typeof parsed.minAzimuthAngle === 'number') {
    updates.minRotationY = parsed.minAzimuthAngle
    updates.useRotationYConstraints = true
  }
  if (typeof parsed.maxAzimuthAngle === 'number') {
    updates.maxRotationY = parsed.maxAzimuthAngle
    updates.useRotationYConstraints = true
  }

  if (typeof parsed.rotationX === 'number') updates.rotationX = parsed.rotationX
  if (typeof parsed.rotationY === 'number') updates.rotationY = parsed.rotationY
  if (typeof parsed.scale === 'number') updates.scale = parsed.scale
  if (typeof parsed.positionX === 'number') updates.positionX = parsed.positionX
  if (typeof parsed.positionY === 'number') updates.positionY = parsed.positionY
  if (typeof parsed.positionZ === 'number') updates.positionZ = parsed.positionZ

  if (typeof parsed.minRotationX === 'number') {
    updates.minRotationX = parsed.minRotationX
    updates.useRotationXConstraints = true
  }
  if (typeof parsed.maxRotationX === 'number') {
    updates.maxRotationX = parsed.maxRotationX
    updates.useRotationXConstraints = true
  }
  if (typeof parsed.minRotationY === 'number') {
    updates.minRotationY = parsed.minRotationY
    updates.useRotationYConstraints = true
  }
  if (typeof parsed.maxRotationY === 'number') {
    updates.maxRotationY = parsed.maxRotationY
    updates.useRotationYConstraints = true
  }

  if (typeof parsed.enableDamping === 'boolean') updates.enableDamping = parsed.enableDamping
  if (typeof parsed.dampingFactor === 'number') updates.dampingFactor = parsed.dampingFactor
  if (typeof parsed.autoRotate === 'boolean') updates.autoRotate = parsed.autoRotate
  if (typeof parsed.autoRotateSpeed === 'number') updates.autoRotateSpeed = parsed.autoRotateSpeed

  return updates
}

export const buildMinimalExportSettings = (
  settings: ModelControlsSettings
): Record<string, unknown> => {
  const exportSettings: Record<string, unknown> = {}
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

  if (settings.enableDamping) {
    exportSettings.enableDamping = true
    if (roundNumber(settings.dampingFactor) !== 0.05) {
      exportSettings.dampingFactor = roundNumber(settings.dampingFactor)
    }
  }

  if (settings.autoRotate) {
    exportSettings.autoRotate = true
    if (roundNumber(settings.autoRotateSpeed) !== 2) {
      exportSettings.autoRotateSpeed = roundNumber(settings.autoRotateSpeed)
    }
  }

  return exportSettings
}

