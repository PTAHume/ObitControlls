import JSZip from 'jszip'
import { type Object3D } from 'three'
import { loadGltf } from './gltfLoader'
import { loadObj } from './objLoader'
import { loadJsonScene } from './sceneLoader'

export const loadZip = async (arrayBuffer: ArrayBuffer): Promise<Object3D> => {
  const zip = new JSZip()
  const loadedZip = await zip.loadAsync(arrayBuffer)

  const fileEntries = Object.entries(loadedZip.files)

  for (const [filename, zipEntry] of fileEntries) {
    if (zipEntry.dir || filename.includes('__MACOSX') || filename.startsWith('.')) {
      continue
    }

    const lowerName = filename.toLowerCase()

    if (lowerName.endsWith('.json')) {
      console.log(`Loading JSON scene from ZIP: ${filename}`)
      const content = await zipEntry.async('string')
      return await loadJsonScene(content)
    }

    if (lowerName.endsWith('.gltf')) {
      console.log(`Loading GLTF from ZIP: ${filename}`)
      const content = await zipEntry.async('string')
      return await loadJsonScene(content)
    }

    if (lowerName.endsWith('.glb')) {
      console.log(`Loading GLB from ZIP: ${filename}`)
      const buffer = await zipEntry.async('arraybuffer')
      return await loadGltf(buffer)
    }

    if (lowerName.endsWith('.obj')) {
      console.log(`Loading OBJ from ZIP: ${filename}`)
      const content = await zipEntry.async('string')
      return loadObj(content)
    }
  }

  throw new Error('No supported 3D file found in ZIP (.json, .gltf, .glb, .obj)')
}

