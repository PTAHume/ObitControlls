import { Box, FormControlLabel, Slider, Switch, Typography } from '@mui/material'

interface DampingControlProps {
  enabled: boolean
  factor: number
  onEnabledChange: (enabled: boolean) => void
  onFactorChange: (factor: number) => void
}

export function DampingControl({
  enabled,
  factor,
  onEnabledChange,
  onFactorChange,
}: DampingControlProps) {
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={e => onEnabledChange(e.target.checked)} />}
          label="Enable Damping"
        />
        <Typography variant="caption" display="block" color="text.secondary">
          Smooths out model movements
        </Typography>
      </Box>

      {enabled && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Damping Factor: {factor}
          </Typography>
          <Slider
            value={factor}
            onChange={(_e, newValue) => onFactorChange(newValue as number)}
            min={0.01}
            max={0.2}
            step={0.01}
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Lower values = smoother movement
          </Typography>
        </Box>
      )}
    </>
  )
}
