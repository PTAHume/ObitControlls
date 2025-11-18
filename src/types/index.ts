import type { Camera, Object3D } from 'three'

export interface ModelControlsSettings {
  rotationX: number
  rotationY: number
  scale: number
  positionX: number
  positionY: number
  positionZ: number
  minRotationX: number
  maxRotationX: number
  minRotationY: number
  maxRotationY: number
  enableDamping: boolean
  dampingFactor: number
  autoRotate: boolean
  autoRotateSpeed: number
  useRotationXConstraints: boolean
  useRotationYConstraints: boolean
}

export interface SceneData {
  scene: Object3D
  cameras: Camera[]
  activeCamera: Camera
}

export interface CurrentValues {
  rotationX: number
  rotationY: number
  scale: number
}
