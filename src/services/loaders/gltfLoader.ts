import type { Object3D, WebGLRenderer } from 'three'
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

let dracoLoaderInstance: DRACOLoader | null = null
let ktx2LoaderInstance: KTX2Loader | null = null

const getDracoLoader = (): DRACOLoader => {
  if (!dracoLoaderInstance) {
    dracoLoaderInstance = new DRACOLoader()
    dracoLoaderInstance.setDecoderPath('/libs/draco/')
  }
  return dracoLoaderInstance
}

const getKTX2Loader = (): KTX2Loader => {
  if (!ktx2LoaderInstance) {
    ktx2LoaderInstance = new KTX2Loader()
    ktx2LoaderInstance.setTranscoderPath('/libs/basis/')
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (gl) {
      ktx2LoaderInstance.detectSupport({ getContext: () => gl } as unknown as WebGLRenderer)
    }
  }
  return ktx2LoaderInstance
}

export const loadGltf = (arrayBuffer: ArrayBuffer): Promise<Object3D> => {
  return new Promise((resolve, reject) => {
    try {
      const loader = new GLTFLoader()
      loader.setDRACOLoader(getDracoLoader())
      loader.setKTX2Loader(getKTX2Loader())

      loader.parse(
        arrayBuffer,
        '',
        gltf => {
          console.log('GLTF loaded:', gltf)
          resolve(gltf.scene)
        },
        error => {
          reject(error)
        }
      )
    } catch (error) {
      reject(error)
    }
  })
}

export const disposeLoaders = () => {
  if (dracoLoaderInstance) {
    dracoLoaderInstance.dispose()
    dracoLoaderInstance = null
  }
  if (ktx2LoaderInstance) {
    ktx2LoaderInstance.dispose()
    ktx2LoaderInstance = null
  }
}
