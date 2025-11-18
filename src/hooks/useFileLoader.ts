import { useCallback, useState } from 'react'
import type { Object3D } from 'three'
import { loadFileByExtension } from '../services/loaders'

export const useFileLoader = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const loadFile = useCallback(async (file: File): Promise<Object3D | null> => {
    setIsLoading(true)
    setError('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const scene = await loadFileByExtension(file, arrayBuffer)
      setIsLoading(false)
      return scene
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }, [])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  return { loadFile, isLoading, error, clearError }
}

