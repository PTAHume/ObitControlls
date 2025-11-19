import { Box, FormControlLabel, Slider, Switch, Typography } from '@mui/material'

interface AutoRotateControlProps {
  enabled: boolean
  speed: number
  onEnabledChange: (enabled: boolean) => void
  onSpeedChange: (speed: number) => void
}

export function AutoRotateControl({
  enabled,
  speed,
  onEnabledChange,
  onSpeedChange,
}: AutoRotateControlProps) {
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={e => onEnabledChange(e.target.checked)} />}
          label="Auto Rotate"
        />
        <Typography variant="caption" display="block" color="text.secondary">
          Enables continuous rotation
        </Typography>
      </Box>

      {enabled && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Auto Rotate Speed: {speed}
          </Typography>
          <Slider
            value={speed}
            onChange={(_e, newValue) => onSpeedChange(newValue as number)}
            min={0.1}
            max={10}
            step={0.1}
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Rotation speed multiplier
          </Typography>
        </Box>
      )}
    </>
  )
}
