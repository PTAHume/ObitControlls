import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Button, Card, CardContent, Chip, Stack, TextField, Typography } from '@mui/material'

interface SettingsImportExportProps {
  jsonInput: string
  jsonError: string
  onJsonInputChange: (value: string) => void
  onApplySettings: () => void
  onCopySettings: () => void
}

export function SettingsImportExport({
  jsonInput,
  jsonError,
  onJsonInputChange,
  onApplySettings,
  onCopySettings,
}: SettingsImportExportProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Settings Import/Export
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={6}
          value={jsonInput}
          onChange={e => onJsonInputChange(e.target.value)}
          placeholder='{"rotationX": 0, "rotationY": 0, "scale": 1}'
          variant="outlined"
          sx={{ mb: 2, fontFamily: 'monospace' }}
        />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={onApplySettings} fullWidth>
            Apply JSON
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={onCopySettings}
            fullWidth
          >
            Copy Current
          </Button>
        </Stack>
        {jsonError && (
          <Chip
            label={jsonError}
            color={jsonError.includes('success') ? 'success' : 'error'}
            size="small"
            sx={{ width: '100%' }}
          />
        )}
      </CardContent>
    </Card>
  )
}
