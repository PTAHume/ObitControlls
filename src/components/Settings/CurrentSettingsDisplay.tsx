import { Box, Card, CardContent, Typography } from '@mui/material'

interface CurrentSettingsDisplayProps {
  settings: Record<string, unknown>
  hasSettings: boolean
}

export function CurrentSettingsDisplay({ settings, hasSettings }: CurrentSettingsDisplayProps) {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Current Settings
        </Typography>
        {hasSettings ? (
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            {JSON.stringify(settings, null, 2)}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            All settings are at default values. Adjust controls to see changes here.
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
