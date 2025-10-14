import React from 'react';
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Grid, IconButton, Typography, Alert, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api, { convertDateTime1, convertDateTime2, get1MonthAgo, getCurrentDate } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { PurchaseHistory, Supplier } from '@/utils/info';
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
  refresh: (datas: PurchaseHistory[]) => void;
};

const today = getCurrentDate();
const monthago = get1MonthAgo()

const SearchBox: React.FC<ParamProps> = ({ refresh }) => {

  const { t } = useTranslation('common')
  const { locale = 'en' } = useRouter();

  const FILTER = {
    "ALL": t('all'),
    "PURCHASED": t('purchased'),
    "INPUT": t('input')
  }

  const [filter, setFilter] = React.useState('ALL');
  const [supplierId, setSupplierId] = React.useState(0);

  const [fromDate, setFromDate] = React.useState<Dayjs | null>(dayjs(monthago));
  const [toDate, setToDate] = React.useState<Dayjs | null>(dayjs(today));

  const [errorMessage, setErrorMessage] = React.useState('');
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);

  const getSuppliers = () => {
    api.get('/supplier') // your server endpoint
      .then(res => {
        setSuppliers(res.data)
      })
      .catch(error => {
        if (error.response) {
          console.error(t('unexpected_error'), error);
          setErrorMessage(t('something_went_wrong'));
        }
      });
  }

  const handleSearch = React.useCallback(() => {
    if (fromDate && toDate && filter) {
      setErrorMessage('');

      const fromDateSTR = fromDate.format('YYYY-MM-DD');
      const toDateSTR = toDate.format('YYYY-MM-DD');

      const formData = new FormData();

      formData.append('filter', filter);
      supplierId && formData.append('supplier_id', supplierId.toString());
      formData.append('from', convertDateTime1(fromDateSTR));
      formData.append('to', convertDateTime2(toDateSTR));

      api.post('/get-inventory-history', formData)
        .then(res => {
          // console.log(res.data)
          refresh(res.data)
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
    } else if (!filter) {
      setErrorMessage(t('filter_field_required'));
    }
  }, [filter, supplierId, fromDate, toDate]); // <— include deps

  React.useEffect(() => {
    getSuppliers()
  }, [])

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
        {t('purchase_history_filter')}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {errorMessage && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('filter')}</InputLabel>
            <Select
              label={t('filter')}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {Object.entries(FILTER)?.map(([key, value]) => (
                <MenuItem value={key}>{value}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('supplier')}</InputLabel>
            <Select
              label={t('supplier')}
              value={supplierId}
              onChange={(e) => setSupplierId(Number(e.target.value))}
            >
              <MenuItem value={0}>{t('all')}</MenuItem>
              {suppliers?.map((x) => (
                <MenuItem value={x.supplier_id}>{x.supplier_name}</MenuItem>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchBox;
