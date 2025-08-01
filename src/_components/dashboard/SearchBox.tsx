import React, { useEffect } from 'react';
import { Box, TextField, Grid, IconButton, Typography, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api, { getCurrentDate } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { Statistics } from '@/utils/info';

type ParamProps = {
  refresh: (data: Statistics) => void;
};

const SearchBox: React.FC<ParamProps> = ({ refresh }) => {

  const { t } = useTranslation('common')

  const today = getCurrentDate()

  const [fromDate, setFromDate] = React.useState(today);
  const [toDate, setToDate] = React.useState(today);

  const fromDateRef = React.useRef(fromDate);
  const toDateRef = React.useRef(toDate);

  // Keep refs in sync with current state
  useEffect(() => {
    fromDateRef.current = fromDate;
  }, [fromDate]);

  useEffect(() => {
    toDateRef.current = toDate;
  }, [toDate]);

  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSearch = () => {
    const currentFromDate = fromDateRef.current;
    const currentToDate = toDateRef.current;

    if (currentFromDate && currentToDate) {
      const formData = new FormData();

      formData.append('from_date', currentFromDate);
      formData.append('to_date', currentToDate);

      api.post('/get-statistics', formData)
        // .then(res => refresh(res.data))
        .then(res => {
          refresh(res.data)
          console.log(res.data)
        })
        .catch(error => {
          if (error.response && error.response.status === 422) {
            // Validation error from server
            console.log(error.response.data);
            // setErrorMessage(error.response.data.message);
            setErrorMessage(t('something_went_wrong'));
          } else {
            // Other errors
            console.error(t('unexpected_error'), error);
            setErrorMessage(t('something_went_wrong'));
          }
        })
    } else if (!currentFromDate) {
      setErrorMessage(t('from_date_field_required'));
    } else if (!currentToDate) {
      setErrorMessage(t('to_date_field_required'));
    }
  };

  useEffect(() => {
    handleSearch()

    const interval = setInterval(() => {
      handleSearch();
    }, 10000);

    return () => clearInterval(interval);
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
        {t('duration')}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {errorMessage && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField
            label={t('from_date')}
            type="date"
            variant="outlined"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField
            label={t('to_date')}
            type="date"
            variant="outlined"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
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
