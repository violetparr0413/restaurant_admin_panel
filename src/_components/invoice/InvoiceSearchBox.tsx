import React from 'react';
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Grid, IconButton, Typography, Alert, Tooltip, FormControlLabel, Switch } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api, { convertDateTime1, convertDateTime2, get1MonthAgo, getCurrentDate } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { InvoiceLog, PaymentMethod } from '@/utils/info';

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
  refresh: (datas: InvoiceLog[]) => void;
};

const today = getCurrentDate();
const monthago = get1MonthAgo()

const InvoiceSearchBox: React.FC<ParamProps> = ({ refresh }) => {

  const { t } = useTranslation('common')
  const { locale = 'en' } = useRouter();

  const PAID_STATUS = [
    t('all'),
    t('paid'),
    t('unpaid')
  ]

  const [isPaid, setIsPaid] = React.useState(0);
  const [paymentMethodId, setPaymentMethodId] = React.useState(0);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[] | null>(null);
  const [fromDate, setFromDate] = React.useState<Dayjs | null>(dayjs(monthago));
  const [toDate, setToDate] = React.useState<Dayjs | null>(dayjs(today));

  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSearch = React.useCallback(() => {
    if (fromDate && toDate) {
      setErrorMessage('');

      const fromDateSTR = fromDate.format('YYYY-MM-DD');
      const toDateSTR = toDate.format('YYYY-MM-DD');

      const formData = new FormData();

      isPaid && formData.append('is_paid', (isPaid === 1 ? true : false).toString());
      formData.append('payment_method_id', paymentMethodId.toString());
      formData.append('from_date', convertDateTime1(fromDateSTR));
      formData.append('to_date', convertDateTime2(toDateSTR));

      api.post('/get-guest-by-date', formData)
        .then(res => {
          // console.log(res.data)
          refresh(res.data.data)
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
  }, [isPaid, paymentMethodId, fromDate, toDate]); // <— include deps

  const getPayments = () => {
    api.get('/payment-method') // your server endpoint
      .then(res => setPaymentMethods(res.data))
      .catch(error => {
        if (error.response) {
          console.error(t('unexpected_error'), error);
          setErrorMessage(t('something_went_wrong'));
        }
      });
  }

  React.useEffect(() => {
    getPayments();
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
        {t('invoice_log_search')}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {errorMessage && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('payment_methods')}</InputLabel>
            <Select
              label={t('payment_methods')}
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(Number(e.target.value))}
            >
              <MenuItem value={0}>{t('all')}</MenuItem>
              {paymentMethods?.map((x) => (
                <MenuItem value={x.payment_method_id}>
                  {x?.payment_method_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('is_paid')}</InputLabel>
            <Select
              label={t('is_paid')}
              value={isPaid}
              onChange={(e) => setIsPaid(Number(e.target.value))}
            >
              {PAID_STATUS.map((x, i) => (
                <MenuItem value={i}>
                  {x}
                </MenuItem>
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

export default InvoiceSearchBox;
