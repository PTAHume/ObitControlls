import { createTheme } from '@mui/material'

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4a9eff',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
  },
  components: {
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
          },
        },
      },
    },
  },
})

