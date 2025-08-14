import React from 'react';
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Grid, IconButton, Typography, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api, { getCurrentDate } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { Order } from '@/utils/info';

type ParamProps = {
  refresh: (datas: Order[]) => void;
};

const today = getCurrentDate();

const OrderSearchBox: React.FC<ParamProps> = ({ refresh }) => {

  const { t } = useTranslation('common')

  const ORDER_STATUS = {
    "ORDERED": t('ordered'),
    "BILLED": t('billed'),
    "CANCELLED": t('cancelled'),
    "INCART": t('incart')
  }

  const [dish, setDish] = React.useState('');
  const [table, setTable] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [fromDate, setFromDate] = React.useState(today);
  const [toDate, setToDate] = React.useState(today);

  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSearch = React.useCallback(() => {
    if (fromDate && toDate) {
      setErrorMessage('');

      const formData = new FormData();

      dish && formData.append('dish', dish);
      table && formData.append('table', table);
      status && status !== 'ALL' && formData.append('order_status', status);
      formData.append('from_date', fromDate);
      formData.append('to_date', toDate);

      api.post('/search-order', formData)
        .then(res => refresh(res.data.orders))
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
  }, [dish, table, status, fromDate, toDate]); // <— include deps

  React.useEffect(() => {
    // run immediately
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
        {t('order_search')}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {errorMessage && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label={t('dish')}
            variant="outlined"
            fullWidth
            size="small"
            value={dish}
            onChange={(e) => setDish(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField
            label={t('table')}
            variant="outlined"
            fullWidth
            size="small"
            value={table}
            onChange={(e) => setTable(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('status')}</InputLabel>
            <Select
              label={t('status')}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="ALL">{t('All')}</MenuItem>
              {Object.entries(ORDER_STATUS)?.map(([key, value]) => (
                <MenuItem value={key}>{value}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
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

export default OrderSearchBox;
