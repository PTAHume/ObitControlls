import { useCallback, useState } from 'react'
import type { Object3D } from 'three'
import { setupSceneWithCamera } from '../services/sceneSetup'
import type { SceneData } from '../types'

export const useSceneSetup = () => {
  const [sceneData, setSceneData] = useState<SceneData | null>(null)

  const setupScene = useCallback((loadedScene: Object3D) => {
    const data = setupSceneWithCamera(loadedScene)
    setSceneData(data)
    return data
  }, [])

  const clearScene = useCallback(() => {
    setSceneData(null)
  }, [])

  const changeCamera = useCallback((cameraIndex: number) => {
    setSceneData(prev => {
      if (!prev?.cameras[cameraIndex]) return prev
      return { ...prev, activeCamera: prev.cameras[cameraIndex] }
    })
  }, [])

  return { sceneData, setupScene, clearScene, changeCamera }
}
