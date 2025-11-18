import { Box, Slider, Typography } from '@mui/material'

interface ScaleControlProps {
  value: number
  onChange: (value: number) => void
}

export function ScaleControl({ value, onChange }: ScaleControlProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Scale: {value.toFixed(2)}
      </Typography>
      <Slider
        value={value}
        onChange={(_e, newValue) => onChange(newValue as number)}
        min={0.1}
        max={10}
        step={0.01}
        valueLabelDisplay="auto"
      />
      <Typography variant="caption" color="text.secondary">
        Adjusts the size of the model (smaller = farther view, larger = closer view)
      </Typography>
    </Box>
  )
}
