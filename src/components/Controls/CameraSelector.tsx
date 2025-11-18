import { Card, CardContent, MenuItem, Select, Typography } from '@mui/material'
import { PerspectiveCamera } from 'three'
import type { SceneData } from '../../types'

interface CameraSelectorProps {
  sceneData: SceneData
  onCameraChange: (index: number) => void
}

export function CameraSelector({ sceneData, onCameraChange }: CameraSelectorProps) {
  if (!sceneData.cameras || sceneData.cameras.length <= 1) {
    return null
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Camera Selection
        </Typography>
        <Select
          fullWidth
          value={sceneData.cameras.indexOf(sceneData.activeCamera)}
          onChange={e => onCameraChange(Number(e.target.value))}
        >
          {sceneData.cameras.map((camera, index) => (
            <MenuItem key={camera.uuid} value={index}>
              Camera {index + 1}{' '}
              {camera instanceof PerspectiveCamera ? `(FOV: ${camera.fov}°)` : ''}
            </MenuItem>
          ))}
        </Select>
      </CardContent>
    </Card>
  )
}
