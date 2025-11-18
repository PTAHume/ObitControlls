import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControlLabel,
  Slider,
  Switch,
  Typography,
} from '@mui/material'
interface RotationControlProps {
  axis: 'X' | 'Y'
  value: number
  minValue: number
  maxValue: number
  useConstraints: boolean
  sliderMin: number
  sliderMax: number
  disabled?: boolean
  onValueChange: (value: number) => void
  onMinChange: (value: number) => void
  onMaxChange: (value: number) => void
  onConstraintsToggle: (enabled: boolean) => void
}

export function RotationControl({
  axis,
  value,
  minValue,
  maxValue,
  useConstraints,
  sliderMin,
  sliderMax,
  disabled = false,
  onValueChange,
  onMinChange,
  onMaxChange,
  onConstraintsToggle,
}: RotationControlProps) {
  const angleName = axis === 'X' ? 'Polar' : 'Azimuth'
  const orbitDescription =
    axis === 'X'
      ? 'camera orbits vertically. Here: model rotates up/down'
      : 'camera orbits horizontally. Here: model rotates left/right'

  const formatValue = (val: number): string => {
    if (val === Number.NEGATIVE_INFINITY) return '-∞'
    if (val === Number.POSITIVE_INFINITY) return '∞'
    return `${((val * 180) / Math.PI).toFixed(1)}°`
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Rotation {axis}: {formatValue(value)}
        </Typography>
        <Slider
          value={value}
          onChange={(_e, newValue) => onValueChange(newValue as number)}
          min={sliderMin}
          max={sliderMax}
          step={0.01}
          disabled={disabled}
          valueLabelDisplay="auto"
          valueLabelFormat={formatValue}
        />
        <Typography variant="caption" color="text.secondary">
          Rotates the model {axis === 'X' ? 'up and down (pitch)' : 'left and right (yaw)'}
        </Typography>
      </Box>

      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{axis} Rotation Constraints</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="caption" display="block" sx={{ mb: 2, color: 'text.secondary' }}>
            Similar to OrbitControls' min{angleName}Angle/max{angleName}Angle but for model
            rotation. In OrbitControls: {orbitDescription}.
            {axis === 'Y' &&
              " Note: Constraints don't apply during auto-rotate for continuous spin."}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={useConstraints}
                onChange={e => onConstraintsToggle(e.target.checked)}
              />
            }
            label={`Enable Rotation ${axis} Constraints`}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Min Rotation {axis}: {formatValue(minValue)}
            </Typography>
            <Slider
              value={minValue === Number.NEGATIVE_INFINITY ? -Math.PI : minValue}
              onChange={(_e, newValue) => onMinChange(newValue as number)}
              min={-Math.PI}
              max={axis === 'X' ? 0 : Math.PI}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={formatValue}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Max Rotation {axis}: {formatValue(maxValue)}
            </Typography>
            <Slider
              value={maxValue === Number.POSITIVE_INFINITY ? Math.PI : maxValue}
              onChange={(_e, newValue) => onMaxChange(newValue as number)}
              min={axis === 'X' ? 0 : -Math.PI}
              max={Math.PI}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={formatValue}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  )
}
