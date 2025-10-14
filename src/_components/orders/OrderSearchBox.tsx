import React from 'react';
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Grid, IconButton, Typography, Alert, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api, { convertDateTime1, convertDateTime2, get1MonthAgo, getCurrentDate } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { Order } from '@/utils/info';
import { useRouter } from 'next/router';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

// dayjs locale packs
import 'dayjs/locale/en';
import 'dayjs/locale/ko';
import 'dayjs/locale/ja';
import 'dayjs/locale/zh';

type ParamProps = {
  refresh: (datas: Order[]) => void;
};

const today = getCurrentDate();
const monthago = get1MonthAgo()

const OrderSearchBox: React.FC<ParamProps> = ({ refresh }) => {

  const { t } = useTranslation('common')
  const { locale = 'en' } = useRouter();

  const ORDER_STATUS = {
    "ORDERED": t('ordered'),
    "BILLED": t('billed'),
    "CANCELLED": t('cancelled'),
    "INCART": t('incart')
  }

  const [dish, setDish] = React.useState('');
  const [table, setTable] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [fromDate, setFromDate] = React.useState<Dayjs | null>(dayjs(monthago));
  const [toDate, setToDate] = React.useState<Dayjs | null>(dayjs(today));

  const [errorMessage, setErrorMessage] = React.useState('');

  const handleExport = () => {
    if (fromDate && toDate) {
      setErrorMessage('');

      const fromDateSTR = fromDate.format('YYYY-MM-DD');
      const toDateSTR = toDate.format('YYYY-MM-DD');

      const formData = new FormData();

      dish && formData.append('dish', dish);
      table && formData.append('table', table);
      status && status !== 'ALL' && formData.append('order_status', status);
      formData.append('from_date', convertDateTime1(fromDateSTR));
      formData.append('to_date', convertDateTime2(toDateSTR));
      formData.append('locale', locale);

      api.post(`/download-csv`, formData, {
        responseType: 'blob',                     // <— important
        validateStatus: s => (s >= 200 && s < 300) || s === 422,
      })
        .then(res => {
          const cd = res.headers['content-disposition'] || '';
          const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
          const serverName = m?.[1] ? decodeURIComponent(m[1]) : m?.[2];
          const fallback = `export_${fromDate}_${toDate}.csv`;
          const filename = (serverName || fallback).replace(/[/\\?%*:|"<>]/g, '-');

          // build a download from the blob
          const type = res.headers['content-type'] || 'text/csv;charset=utf-8';
          const blob = new Blob([res.data], { type });
          const href = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = href;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(href);
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
  }

  const handleSearch = React.useCallback(() => {
    if (fromDate && toDate) {
      setErrorMessage('');

      const fromDateSTR = fromDate.format('YYYY-MM-DD');
      const toDateSTR = toDate.format('YYYY-MM-DD');

      const formData = new FormData();

      dish && formData.append('dish', dish);
      table && formData.append('table', table);
      status && status !== 'ALL' && formData.append('order_status', status);
      formData.append('from_date', convertDateTime1(fromDateSTR));
      formData.append('to_date', convertDateTime2(toDateSTR));

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
              <MenuItem value="ALL">{t('all')}</MenuItem>
              {Object.entries(ORDER_STATUS)?.map(([key, value]) => (
                <MenuItem value={key}>{value}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
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
          <Tooltip title={t('export_csv')}>
            <IconButton color="primary" onClick={handleExport}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderSearchBox;
