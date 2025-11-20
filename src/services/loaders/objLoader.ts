import type { Object3D } from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

export const loadObj = (data: string): Object3D => {
  const loader = new OBJLoader()
  return loader.parse(data)
}
