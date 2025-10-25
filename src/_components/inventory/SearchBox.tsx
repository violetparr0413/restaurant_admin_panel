// SearchBox.tsx
import React from 'react';
import {
  Box, Grid, IconButton, Typography, Alert, FormControl, InputLabel, Select, MenuItem,
  TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api, { getCurrentDate } from '@/utils/http_helper';
import { useTranslation } from 'next-i18next';
import { Inventory, Supplier } from '@/utils/info';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/router';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// dayjs locale packs
import 'dayjs/locale/en';
import 'dayjs/locale/ko';
import 'dayjs/locale/ja';
import 'dayjs/locale/zh';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const DATE_FMT = 'YYYY-MM-DD';
const DATETIME_FMT = 'YYYY-MM-DD HH:mm:ss';
const today = getCurrentDate();

type ParamProps = {
  refreshTime: (data: string) => void;
  refresh: (datas: Inventory[]) => void;
  isShow: boolean;
  filterSupplier: (number) => void;
  filterSupplierId: number;
};

const SearchBox: React.FC<ParamProps> = ({ refreshTime, refresh, isShow, filterSupplier, filterSupplierId }) => {
  const { t } = useTranslation('common');
  const { locale = 'en' } = useRouter();

  // canonical state as Dayjs
  const [name, setName] = React.useState('');
  const [time, setTime] = React.useState<string>(''); // 'YYYY-MM-DD HH:mm:ss'
  const [errorMessage, setErrorMessage] = React.useState('');
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>(''); // 'YYYY-MM-DD'
  const [selectedTime, setSelectedTime] = React.useState<string>(''); // 'HH:mm:ss'
  const [allowedDateTimes, setAllowedDateTimes] = React.useState<string[]>([]);
  const [loadingDates, setLoadingDates] = React.useState<boolean>(false);

  const allowedSetFull = React.useMemo(() => new Set(allowedDateTimes), [allowedDateTimes]);

  const allowedByDate = React.useMemo(() => {
    const map = new Map<string, string[]>();
    for (const dt of allowedDateTimes) {
      const d = dt.slice(0, 10); // YYYY-MM-DD
      const t = dt.slice(11); // HH:mm:ss
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(t);
    }
    // sort times DESC so newest times show first for a date
    for (const [k, arr] of map) {
      arr.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    }
    return map;
  }, [allowedDateTimes]);

  const allowedDateSet = React.useMemo(() => new Set(Array.from(allowedByDate.keys())), [allowedByDate]);

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

  const getInputDates = () => {
    setLoadingDates(true);
    api.get('/get-input-date')
      .then(res => {
        const dates: string[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.dates) ? res.data.dates : [];

        const normalized = Array.from(
          new Set(
            dates
              .map(String)
              .map(s => (dayjs(s).isValid() ? dayjs(s).format(DATETIME_FMT) : s))
          )
        ).filter(Boolean);

        // newest first
        const sortedDesc = normalized.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
        setAllowedDateTimes(sortedDesc);

        if (sortedDesc.length > 0) {
          const newest = sortedDesc[0];
          const d = newest.slice(0, 10);
          const t = newest.slice(11);
          setSelectedDate(d);
          setSelectedTime(t);
          setTime(`${d} ${t}`);
        } else {
          setSelectedDate(today);
          setSelectedTime('00:00:00');
          setTime(`${today} 00:00:00`);
        }
      })
      .catch(error => {
        console.error(t('unexpected_error'), error);
        setErrorMessage(t('something_went_wrong'));
      })
      .finally(() => setLoadingDates(false));
  };

  const handleSearch = React.useCallback((override?: string) => {
    const effective = override ?? time;        // ← use the override if provided
    if (!effective) {
      setErrorMessage(t('time_field_required'));
      return;
    }
    if (allowedSetFull.size && !allowedSetFull.has(effective)) {
      setErrorMessage(t('selected_date_not_allowed') || 'Selected date/time is not allowed.');
      return;
    }

    setErrorMessage('');

    api.get('/inventory', { params: { time: effective } })
      .then(res => {
        refresh(res.data?.filter(x => x.name?.includes(name)));
        // For display elsewhere, keep the localized visual string if you want:
        // but your existing prop is string, so pass isoStr to preserve old behavior.
        refreshTime(effective)
      })
      .catch(error => {
        if (error?.response?.status === 422) {
          setErrorMessage(t('something_went_wrong'));
        } else {
          console.error(t('unexpected_error'), error);
          setErrorMessage(t('something_went_wrong'));
        }
      });
  }, [name, time, refresh, refreshTime, t]);

  React.useEffect(() => {
    getInputDates();
    getSuppliers();
  }, []);

  React.useEffect(() => {
    const onRefresh = () => {
      getInputDates(); // ← re-fetch /get-input-date to pull in the new snapshot
    };
    window.addEventListener('inventory:refresh-input-dates', onRefresh);
    return () => window.removeEventListener('inventory:refresh-input-dates', onRefresh);
  }, []);

  React.useEffect(() => {
    if (selectedDate && selectedTime) {
      const full = `${selectedDate} ${selectedTime}`;
      setTime(full);
      if (!allowedSetFull.size || allowedSetFull.has(full)) {
        handleSearch(full);
      }
    }
  }, [selectedDate, selectedTime, allowedSetFull]);

  const shouldDisableDate = React.useCallback(
    (d: Dayjs) => !allowedDateSet.has(d.format(DATE_FMT)),
    [allowedDateSet]
  );

  const onDateChange = (d: Dayjs | null) => {
    const v = d ? d.format(DATE_FMT) : '';
    setSelectedDate(v);
    if (v && allowedByDate.has(v)) {
      const times = allowedByDate.get(v)!.sort();
      setSelectedTime(times[0] || '');
    } else {
      setSelectedTime('');
    }
  };

  const timesForSelectedDate = React.useMemo(() => {
    if (!selectedDate) return [] as string[];
    return allowedByDate.get(selectedDate)?.sort() || [];
  }, [allowedByDate, selectedDate]);

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

        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField
            label={t('name')}
            variant="outlined"
            fullWidth
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3, md: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
            <DatePicker
              label={t('search_date')}
              value={selectedDate ? dayjs(selectedDate, DATE_FMT) : null}
              onChange={onDateChange}
              disabled={loadingDates || allowedDateSet.size === 0}
              shouldDisableDate={shouldDisableDate}
              slotProps={{ textField: { size: 'small', fullWidth: true, helperText: loadingDates ? (t('loading') || 'Loading…') : undefined } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={{ xs: 12, sm: 3, md: 1 }}>
          <FormControl fullWidth size="small" disabled={!selectedDate || timesForSelectedDate.length === 0}>
            <InputLabel id="allowed-time-label">{t('count_number')}</InputLabel>
            <Select
              labelId="allowed-time-label"
              label={t('count_number')}
              value={selectedTime || ''}
              onChange={(e) => setSelectedTime(String(e.target.value))}
              MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
            >
              {timesForSelectedDate.map((tstr, i) => (
                <MenuItem key={tstr} value={tstr}>{i + 1}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {isShow && (
          <Grid size={{ xs: 12, sm: 2 }}>
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
          <IconButton color="primary" sx={{ mt: { xs: 0, sm: 0.5 } }} onClick={() => handleSearch()}>
            <SearchIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchBox;
