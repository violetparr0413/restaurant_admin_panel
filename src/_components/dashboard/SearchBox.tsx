import React, { useEffect } from 'react';
import { Box, TextField, Grid, IconButton, Typography, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api, { convertDateTime1, convertDateTime2, get1MonthAgo, getCurrentDate } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { Statistics } from '@/utils/info';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

// dayjs locale packs
import 'dayjs/locale/en';
import 'dayjs/locale/ko';
import 'dayjs/locale/ja';
import 'dayjs/locale/zh';
import { useRouter } from 'next/router';

type ParamProps = {
  refresh: (data: Statistics) => void;
};

const SearchBox: React.FC<ParamProps> = ({ refresh }) => {

  const { t } = useTranslation('common')
  const { locale = 'en' } = useRouter();

  const today = getCurrentDate()
  const monthago = get1MonthAgo()

  const [fromDate, setFromDate] = React.useState<Dayjs | null>(dayjs(monthago));
  const [toDate, setToDate] = React.useState<Dayjs | null>(dayjs(today));

  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSearch = React.useCallback(() => {
    if (fromDate && toDate) {
      const formData = new FormData();

      const fromDateSTR = fromDate.format('YYYY-MM-DD');
      const toDateSTR = toDate.format('YYYY-MM-DD');

      formData.append('from_date', convertDateTime1(fromDateSTR));
      formData.append('to_date', convertDateTime2(toDateSTR));

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
    } else if (!fromDate) {
      setErrorMessage(t('from_date_field_required'));
    } else if (!toDate) {
      setErrorMessage(t('to_date_field_required'));
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    handleSearch()

    const interval = setInterval(() => {
      handleSearch();
    }, 10000);

    return () => clearInterval(interval);
  }, [handleSearch]);

  React.useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

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
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={locale}
          >
            <DatePicker
              label={t('from_date')}
              value={fromDate}
              onChange={(newVal) => setFromDate(newVal)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={locale}
          >
            <DatePicker
              label={t('to_date')}
              value={toDate}
              onChange={(newVal) => setToDate(newVal)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
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
