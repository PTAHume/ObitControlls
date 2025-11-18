import { Box3, Camera, type Object3D, PerspectiveCamera, Vector3 } from 'three'
import type { SceneData } from '../types'

export const setupSceneWithCamera = (loadedScene: Object3D): SceneData => {
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
    const perspCamera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000)

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

  return { scene: loadedScene, cameras, activeCamera }
}

