import { Center, Grid } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { type Group, PerspectiveCamera } from 'three'
import type { ModelControlsSettings, SceneData } from '../../types'
import { SceneModel } from './SceneModel'

interface SceneProps {
  sceneData: SceneData | null
  settings: ModelControlsSettings
  onControlsUpdate: (rotationX: number, rotationY: number, scale: number) => void
  onInteractiveChange: (rotationX: number, rotationY: number, scale: number) => void
}

export function Scene({ sceneData, settings, onControlsUpdate, onInteractiveChange }: SceneProps) {
  const modelGroupRef = useRef<Group>(null)
  const { camera, gl } = useThree()
  const currentRotationX = useRef(0)
  const currentRotationY = useRef(0)
  const currentScale = useRef(1)
  const isDragging = useRef(false)
  const previousMouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (sceneData?.activeCamera) {
      const activeCamera = sceneData.activeCamera

      camera.position.copy(activeCamera.position)
      camera.rotation.copy(activeCamera.rotation)

      // Handle perspective camera properties
      if (activeCamera instanceof PerspectiveCamera && camera instanceof PerspectiveCamera) {
        camera.fov = activeCamera.fov
        camera.near = activeCamera.near
        camera.far = activeCamera.far
        camera.zoom = activeCamera.zoom
        camera.updateProjectionMatrix()
      }
    }
  }, [sceneData?.activeCamera, camera])

  useEffect(() => {
    const canvas = gl.domElement

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      previousMouse.current = { x: e.clientX, y: e.clientY }
      canvas.style.cursor = 'grabbing'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const deltaX = e.clientX - previousMouse.current.x
      const deltaY = e.clientY - previousMouse.current.y

      previousMouse.current = { x: e.clientX, y: e.clientY }

      const rotationSpeedX = 0.005
      const rotationSpeedY = 0.005

      const newRotationX = currentRotationX.current - deltaY * rotationSpeedX
      const newRotationY = currentRotationY.current + deltaX * rotationSpeedY

      // Apply constraints only if enabled
      const constrainedX = settings.useRotationXConstraints
        ? Math.max(settings.minRotationX, Math.min(settings.maxRotationX, newRotationX))
        : newRotationX

      let constrainedY = newRotationY
      if (settings.useRotationYConstraints) {
        const minY =
          settings.minRotationY === Number.NEGATIVE_INFINITY
            ? Number.NEGATIVE_INFINITY
            : settings.minRotationY
        const maxY =
          settings.maxRotationY === Number.POSITIVE_INFINITY
            ? Number.POSITIVE_INFINITY
            : settings.maxRotationY
        constrainedY = Math.max(minY, Math.min(maxY, newRotationY))
      }

      // Update the actual rotation values
      currentRotationX.current = constrainedX
      currentRotationY.current = constrainedY

      // Update the settings so sliders reflect the change
      onInteractiveChange(constrainedX, constrainedY, currentScale.current)
    }

    const handleMouseUp = () => {
      isDragging.current = false
      canvas.style.cursor = 'grab'
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      // Zoom speed multiplier
      const zoomSpeed = 0.001
      const newScale = currentScale.current - e.deltaY * zoomSpeed

      // Always enforce minimum 0.01 to prevent zero/negative scale
      const constrainedScale = Math.max(0.01, newScale)

      currentScale.current = constrainedScale

      // Update the settings so slider reflects the change
      onInteractiveChange(currentRotationX.current, currentRotationY.current, constrainedScale)
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    canvas.style.cursor = 'grab'

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.style.cursor = 'default'
    }
  }, [gl, settings, onInteractiveChange])

  // Apply model transformations
  useFrame((_state, delta) => {
    const group = modelGroupRef.current
    if (!group) return

    // Auto-rotate if enabled
    if (settings.autoRotate) {
      currentRotationY.current += settings.autoRotateSpeed * delta
    } else {
      // Manual control from settings when not auto-rotating
      currentRotationX.current = settings.rotationX
      currentRotationY.current = settings.autoRotate ? currentRotationY.current : settings.rotationY
      currentScale.current = settings.scale
    }

    // Apply constraints only if enabled (skip Y constraints if auto-rotating)
    if (settings.useRotationXConstraints) {
      currentRotationX.current = Math.max(
        settings.minRotationX,
        Math.min(settings.maxRotationX, currentRotationX.current)
      )
    }
    if (!settings.autoRotate && settings.useRotationYConstraints) {
      // Handle Infinity constraints properly
      const minY =
        settings.minRotationY === Number.NEGATIVE_INFINITY
          ? Number.NEGATIVE_INFINITY
          : settings.minRotationY
      const maxY =
        settings.maxRotationY === Number.POSITIVE_INFINITY
          ? Number.POSITIVE_INFINITY
          : settings.maxRotationY
      currentRotationY.current = Math.max(minY, Math.min(maxY, currentRotationY.current))
    }
    // Always enforce minimum 0.01 to prevent zero/negative scale
    currentScale.current = Math.max(0.01, currentScale.current)

    // Apply transformations
    group.rotation.x = currentRotationX.current
    group.rotation.y = currentRotationY.current
    group.scale.setScalar(currentScale.current)
    group.position.set(settings.positionX, settings.positionY, settings.positionZ)

    // Apply damping if enabled
    if (settings.enableDamping && !settings.autoRotate) {
      // Smoothly interpolate towards target values
      const dampingAmount = 1 - settings.dampingFactor

      const targetX = settings.rotationX
      const targetY = settings.rotationY
      const targetScale = settings.scale

      currentRotationX.current += (targetX - currentRotationX.current) * dampingAmount
      currentRotationY.current += (targetY - currentRotationY.current) * dampingAmount
      currentScale.current += (targetScale - currentScale.current) * dampingAmount
    }

    // Notify parent of current values
    onControlsUpdate(currentRotationX.current, currentRotationY.current, currentScale.current)
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <Center>
        <group ref={modelGroupRef}>
          <SceneModel sceneData={sceneData} />
        </group>
      </Center>
      <Grid args={[20, 20]} cellSize={1} cellColor="#444" sectionSize={5} sectionColor="#888" />
    </>
  )
}
