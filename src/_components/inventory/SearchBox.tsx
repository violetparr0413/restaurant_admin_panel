// SearchBox.tsx
import React from 'react';
import {
  Box, Grid, IconButton, Typography, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api, { convertDateTime1, getCurrentDate } from '@/utils/http_helper';
import { useTranslation } from 'next-i18next';
import { Inventory, Supplier } from '@/utils/info';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/router';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// dayjs locale packs
import 'dayjs/locale/en';
import 'dayjs/locale/ko';
import 'dayjs/locale/ja';
import 'dayjs/locale/zh';

type ParamProps = {
  refreshTime: (data: string) => void;
  refresh: (datas: Inventory[]) => void;
  isShow: boolean;
  filterSupplier: (number) => void;
  filterSupplierId: number;
};

const todayISO = getCurrentDate();

const SearchBox: React.FC<ParamProps> = ({ refreshTime, refresh, isShow, filterSupplier, filterSupplierId }) => {
  const { t } = useTranslation('common');
  const { locale = 'en' } = useRouter();

  // canonical state as Dayjs
  const [time, setTime] = React.useState<Dayjs | null>(dayjs(todayISO));
  const [errorMessage, setErrorMessage] = React.useState('');
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);

  const getSuppliers = () => {
    api.get('/supplier')
      .then(res => setSuppliers(res.data))
      .catch(error => {
        if (error.response) {
          console.error(t('unexpected_error'), error);
          setErrorMessage(t('something_went_wrong'));
        }
      });
  };

  const handleSearch = React.useCallback(() => {
    if (!time) {
      setErrorMessage(t('time_field_required'));
      return;
    }

    setErrorMessage('');
    // Keep your backend format stable:
    // Convert the selected dayjs into 'YYYY-MM-DD' (or whatever convertDateTime1 expects)
    const isoStr = time.format('YYYY-MM-DD');

    api.get('/inventory', { params: { time: convertDateTime1(isoStr) } })
      .then(res => {
        refresh(res.data);
        // For display elsewhere, keep the localized visual string if you want:
        // but your existing prop is string, so pass isoStr to preserve old behavior.
        refreshTime(isoStr);
      })
      .catch(error => {
        if (error?.response?.status === 422) {
          setErrorMessage(t('something_went_wrong'));
        } else {
          console.error(t('unexpected_error'), error);
          setErrorMessage(t('something_went_wrong'));
        }
      });
  }, [time, refresh, refreshTime, t]);

  React.useEffect(() => {
    getSuppliers();
  }, []);

  React.useEffect(() => {
    if (time) handleSearch();
  }, [handleSearch, time]);

  // Keep dayjs itself in sync so formatting elsewhere matches
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
        {t('inventory')}
      </Typography>

      <Grid container spacing={2} alignItems="center">
        {errorMessage && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 3 }}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={locale}
          >
            <DatePicker
              label={t('date')}
              value={time}
              onChange={(newVal) => setTime(newVal)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>

        </Grid>

        {isShow && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('supplier')}</InputLabel>
              <Select
                label={t('supplier')}
                value={filterSupplierId}
                onChange={(e) => {
                  filterSupplier(Number(e.target.value));
                }}
              >
                <MenuItem value={0}>{t('all')}</MenuItem>
                {suppliers?.map((x) => (
                  <MenuItem key={x.supplier_id} value={x.supplier_id}>
                    {x.supplier_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid size={{ xs: 'auto' }}>
          <IconButton color="primary" sx={{ mt: { xs: 0, sm: 0.5 } }} onClick={handleSearch}>
            <SearchIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchBox;
