import { ObjectLoader, type Object3D } from 'three'

export const loadJsonScene = (data: string): Promise<Object3D> => {
  return new Promise((resolve, reject) => {
    try {
      const json = JSON.parse(data)
      const loader = new ObjectLoader()

      loader.parse(json, object => {
        resolve(object)
      })
    } catch (error) {
      reject(error)
    }
  })
}

