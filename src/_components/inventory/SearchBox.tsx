import React from 'react';
import { Box, Grid, IconButton, Typography, Alert, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api, { convertDateTimeMin, getCurrentTimeMin } from '@/utils/http_helper';

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useTranslation } from 'next-i18next';
import { Inventory } from '@/utils/info';
import dayjs, { Dayjs } from 'dayjs';

type ParamProps = {
  refresh: (datas: Inventory[]) => void;
};

const today = getCurrentTimeMin();

const SearchBox: React.FC<ParamProps> = ({ refresh }) => {

  const { t } = useTranslation('common')

  const [time, setTime] = React.useState(today);

  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSearch = React.useCallback(() => {
    if (time) {
      setErrorMessage('');

      api.get('/inventory', {
        params: {
          time: convertDateTimeMin(time)
        }
      })
        .then(res => refresh(res.data))
        .catch(error => {
          if (error?.response?.status === 422) {
            setErrorMessage(t('something_went_wrong'));
          } else {
            console.error(t('unexpected_error'), error);
            setErrorMessage(t('something_went_wrong'));
          }
        });
    } else if (!time) {
      setErrorMessage(t('time_field_required'));
    }
  }, [time]); // <— include deps

  React.useEffect(() => {
    handleSearch();
  }, []);

  return (
    <Box sx={{ mb: 2, position: 'relative', border: '2px solid #1ba3e1', borderRadius: 1, p: 2, mt: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{
          position: 'absolute',
          top: -10,
          left: 12,
          bgcolor: 'background.paper',
          px: 1,
          color: '#1ba3e1',
          fontWeight: 500,
          fontSize: '0.875rem',
        }}
      >
        {t('inventory')}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {errorMessage && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label={t('search_time')}
            type="datetime-local"
            variant="outlined"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: "auto" }}>
          <IconButton
            color="primary"
            sx={{ mt: { xs: 0, sm: 0.5 } }}
            onClick={handleSearch}
          >
            <SearchIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchBox;
