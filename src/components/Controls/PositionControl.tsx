import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Slider,
  Typography,
} from '@mui/material'

interface PositionControlProps {
  positionX: number
  positionY: number
  positionZ: number
  onPositionXChange: (value: number) => void
  onPositionYChange: (value: number) => void
  onPositionZChange: (value: number) => void
}

export function PositionControl({
  positionX,
  positionY,
  positionZ,
  onPositionXChange,
  onPositionYChange,
  onPositionZChange,
}: PositionControlProps) {
  return (
    <Accordion sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Position Offset</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="caption" display="block" sx={{ mb: 2, color: 'text.secondary' }}>
          Manually adjust the model's position if it's off-center. These values are added to the
          model's position.
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Position X: {positionX.toFixed(2)}
          </Typography>
          <Slider
            value={positionX}
            onChange={(_e, newValue) => onPositionXChange(newValue as number)}
            min={-100}
            max={100}
            step={0.5}
            valueLabelDisplay="auto"
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Position Y: {positionY.toFixed(2)}
          </Typography>
          <Slider
            value={positionY}
            onChange={(_e, newValue) => onPositionYChange(newValue as number)}
            min={-100}
            max={100}
            step={0.5}
            valueLabelDisplay="auto"
          />
        </Box>
        <Box>
          <Typography variant="body2" gutterBottom>
            Position Z: {positionZ.toFixed(2)}
          </Typography>
          <Slider
            value={positionZ}
            onChange={(_e, newValue) => onPositionZChange(newValue as number)}
            min={-100}
            max={100}
            step={0.5}
            valueLabelDisplay="auto"
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
