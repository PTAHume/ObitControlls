import type { Object3D } from 'three'
import { isZipFile, loadGltf } from './gltfLoader'
import { loadObj } from './objLoader'
import { loadJsonScene } from './sceneLoader'
import { loadZip } from './zipLoader'

export const loadFileByExtension = async (
  file: File,
  arrayBuffer: ArrayBuffer
): Promise<Object3D> => {
  const fileName = file.name.toLowerCase()
  console.log(`Processing file: ${file.name} (${file.size} bytes, type: ${file.type})`)

  // Check magic bytes first found this is more reliable than file extension
  if (isZipFile(arrayBuffer)) {
    console.log(
      `Detected ZIP file by magic bytes: ${Array.from(new Uint8Array(arrayBuffer).slice(0, 4))
        .map(b => `0x${b.toString(16).padStart(2, '0')}`)
        .join(' ')}`
    )
    return await loadZip(arrayBuffer)
  }

  if (fileName.endsWith('.zip')) {
    return await loadZip(arrayBuffer)
  }

  if (fileName.endsWith('.json')) {
    const decoder = new TextDecoder()
    const text = decoder.decode(arrayBuffer)
    return await loadJsonScene(text)
  }

  if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
    return await loadGltf(arrayBuffer)
  }

  if (fileName.endsWith('.obj')) {
    const decoder = new TextDecoder()
    const text = decoder.decode(arrayBuffer)
    return loadObj(text)
  }

  throw new Error(
    `Unsupported file type: ${file.name}. Please use .json, .gltf, .glb, .obj, or .zip`
  )
}
