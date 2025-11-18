import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material'

export function OrbitControlsMapping() {
  return (
    <Accordion sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>OrbitControls Mapping Guide</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" paragraph>
          This tool manipulates the <strong>model</strong> instead of the camera (inverse of
          OrbitControls). Here's how they map:
        </Typography>
        <Box component="table" sx={{ width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>OrbitControls</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Maps To</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.5rem' }}>minPolarAngle</td>
              <td style={{ padding: '0.5rem' }}>minRotationX</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem' }}>maxPolarAngle</td>
              <td style={{ padding: '0.5rem' }}>maxRotationX</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem' }}>minAzimuthAngle</td>
              <td style={{ padding: '0.5rem' }}>minRotationY</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem' }}>maxAzimuthAngle</td>
              <td style={{ padding: '0.5rem' }}>maxRotationY</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem' }}>enableDamping</td>
              <td style={{ padding: '0.5rem' }}>Direct mapping</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem' }}>autoRotate</td>
              <td style={{ padding: '0.5rem' }}>Direct mapping</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem' }}>minDistance/maxDistance</td>
              <td style={{ padding: '0.5rem' }}>Use Scale slider</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem' }}>enablePan</td>
              <td style={{ padding: '0.5rem' }}>Not needed (camera fixed)</td>
            </tr>
          </tbody>
        </Box>
        <Typography
          variant="caption"
          display="block"
          sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
        >
          💡 Tip: Scale is inverted - smaller scale = camera farther away, larger scale = camera
          closer
        </Typography>
      </AccordionDetails>
    </Accordion>
  )
}
