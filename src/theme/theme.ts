import { createTheme } from '@mui/material/styles';

const darkBlueColor = '#1ba3e1';
const lightBlueColor = '#00aeffff';

const theme = (locale: string) => {
  let fontFamily = 'Japanese';

  if (locale === 'en') {
    fontFamily = 'English';
  }

  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: darkBlueColor,
      },
      secondary: {
        main: '#9c27b0',
      },
      background: {
        default: '#ffffff',
      },
    },
    typography: {
      fontFamily: fontFamily,
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
      },
      body1: {
        fontSize: '1rem',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            textTransform: 'none',
            color: 'white',
            backgroundColor: darkBlueColor,
            '&:disabled': {
              backgroundColor: lightBlueColor,
              color: 'white',
            },
            fontSize: 18,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderColor: darkBlueColor
          }
        }
      }
    },
  });
}

export default theme;