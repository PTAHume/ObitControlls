import type { SceneData } from '../../types'

interface SceneModelProps {
  sceneData: SceneData | null
}

export function SceneModel({ sceneData }: SceneModelProps) {
  if (sceneData) {
    return <primitive object={sceneData.scene} />
  }
  return null
}
