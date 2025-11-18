import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import RestoreIcon from '@mui/icons-material/Restore'
import { Button, Card, CardContent, Stack, Typography } from '@mui/material'
import type { CurrentValues } from '../../types'

interface ModelInfoProps {
  currentValues: CurrentValues
  hasScene: boolean
  onResetControls: () => void
  onResetView: () => void
  onClearScene: () => void
}

export function ModelInfo({
  currentValues,
  hasScene,
  onResetControls,
  onResetView,
  onClearScene,
}: ModelInfoProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Current Model Values
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            Rotation X: <strong>{((currentValues.rotationX * 180) / Math.PI).toFixed(1)}°</strong>
          </Typography>
          <Typography variant="body2">
            Rotation Y: <strong>{((currentValues.rotationY * 180) / Math.PI).toFixed(1)}°</strong>
          </Typography>
          <Typography variant="body2">
            Scale: <strong>{currentValues.scale.toFixed(2)}</strong>
          </Typography>
        </Stack>
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onResetControls}
            fullWidth
          >
            Reset Controls
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={onResetView}
            disabled={!hasScene}
            fullWidth
          >
            Reset View
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onClearScene}
            disabled={!hasScene}
            fullWidth
          >
            Clear Scene
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
