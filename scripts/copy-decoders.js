import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

function copyDirectory(src, dest) {
  mkdirSync(dest, { recursive: true })
  
  const entries = readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
      console.log(`Copied: ${entry.name}`)
    }
  }
}

console.log('Copying Draco decoder files...')
const dracoSrc = join(projectRoot, 'node_modules/three/examples/jsm/libs/draco')
const dracoDest = join(projectRoot, 'public/libs/draco')
copyDirectory(dracoSrc, dracoDest)

console.log('\nCopying KTX2/Basis decoder files...')
const basisSrc = join(projectRoot, 'node_modules/three/examples/jsm/libs/basis')
const basisDest = join(projectRoot, 'public/libs/basis')
copyDirectory(basisSrc, basisDest)

console.log('\n✅ Decoder files copied successfully!')

