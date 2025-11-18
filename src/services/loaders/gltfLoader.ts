import { type Object3D, type WebGLRenderer } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'

export const isZipFile = (arrayBuffer: ArrayBuffer): boolean => {
  const uint8Array = new Uint8Array(arrayBuffer)
  const magicBytes = uint8Array.slice(0, 4)
  return (
    magicBytes[0] === 0x50 &&
    magicBytes[1] === 0x4b &&
    (magicBytes[2] === 0x03 || magicBytes[2] === 0x05 || magicBytes[2] === 0x07)
  )
}

export const loadGltf = (arrayBuffer: ArrayBuffer): Promise<Object3D> => {
  return new Promise((resolve, reject) => {
    try {
      const loader = new GLTFLoader()

      // Set up Draco decoder for compressed models
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
      loader.setDRACOLoader(dracoLoader)

      // Set up KTX2 decoder for compressed textures
      const ktx2Loader = new KTX2Loader()
      ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.181.1/examples/jsm/libs/basis/')
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        ktx2Loader.detectSupport({ getContext: () => gl } as unknown as WebGLRenderer)
      }
      loader.setKTX2Loader(ktx2Loader)

      loader.parse(
        arrayBuffer,
        '',
        gltf => {
          console.log('GLTF loaded:', gltf)
          dracoLoader.dispose()
          ktx2Loader.dispose()
          resolve(gltf.scene)
        },
        error => {
          dracoLoader.dispose()
          ktx2Loader.dispose()
          reject(error)
        }
      )
    } catch (error) {
      reject(error)
    }
  })
}

