import React from 'react';
import { Box, TextField, Grid, IconButton, Typography, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api, { convertDateTime1, convertDateTime2, get1MonthAgo, getCurrentDate } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type ParamProps = {
  headers: (datas: any[]) => void;
  refresh: (datas: any[]) => void;
  url: string;
};

const today = getCurrentDate();
const monthago = get1MonthAgo()

const SearchBox: React.FC<ParamProps> = ({ headers, refresh, url }) => {

  const { t } = useTranslation('common')

  const [fromDate, setFromDate] = React.useState(monthago);
  const [toDate, setToDate] = React.useState(today);

  const [errorMessage, setErrorMessage] = React.useState('');

  const router = useRouter();
  const { locale } = router;

  const handleSearch = React.useCallback(() => {
    if (fromDate && toDate) {
      setErrorMessage('');

      const formData = new FormData();

      formData.append('from', convertDateTime1(fromDate));
      formData.append('to', convertDateTime2(toDate));

      api.post(url, formData)
        .then(res => {
            // console.log(res.data);
            headers(res.data.input_dates)
            refresh(res.data.inventoryDifference)
        })
        .catch(error => {
          if (error?.response?.status === 422) {
            console.log(error.response.data);
            setErrorMessage(t('something_went_wrong'));
          } else {
            console.error(t('unexpected_error'), error);
            setErrorMessage(t('something_went_wrong'));
          }
        });
    } else if (!fromDate) {
      setErrorMessage(t('from_date_field_required'));
    } else if (!toDate) {
      setErrorMessage(t('to_date_field_required'));
    }
  }, [fromDate, toDate]); // <— include deps

  React.useEffect(() => {
    handleSearch();
    // and poll every 5s with the *current* filters
    const id = setInterval(handleSearch, 5000);
    return () => clearInterval(id);
  }, [handleSearch]);

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
        {t('data_filter')}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {errorMessage && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 3 }}>
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
        <Grid size={{ xs: 12, sm: 3 }}>
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
