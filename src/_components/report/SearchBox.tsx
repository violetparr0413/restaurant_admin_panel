// SearchBox.tsx
import React from 'react';
import {
  Box, Grid, IconButton, Typography, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api, { convertDateTime2, getCurrentDate } from '@/utils/http_helper';
import { useTranslation } from 'next-i18next';
import { Inventory } from '@/utils/info';

// ⬇️ NEW: date picker imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/router';

// dayjs locale packs
import 'dayjs/locale/en';
import 'dayjs/locale/ko';
import 'dayjs/locale/ja';
import 'dayjs/locale/zh';

type ParamProps = {
  refresh: (datas: Inventory[]) => void;
  url: string;
};

const today = getCurrentDate(); // 'YYYY-MM-DD'

const SearchBox: React.FC<ParamProps> = ({ refresh, url }) => {
  const { t } = useTranslation('common');
  const { locale = 'en' } = useRouter();

  // Keep canonical state as string; derive Dayjs for the picker
  const [time, setTime] = React.useState<string>(today);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [allowedDates, setAllowedDates] = React.useState<string[]>([]);
  const [loadingDates, setLoadingDates] = React.useState<boolean>(false);

  // O(1) membership checks even for huge arrays
  const allowedSet = React.useMemo(() => new Set(allowedDates), [allowedDates]);

  // Helpful bounds so the calendar opens to a relevant month even with huge lists
  const { minAllowed, maxAllowed } = React.useMemo(() => {
    if (!allowedDates.length) return { minAllowed: null as dayjs.Dayjs | null, maxAllowed: null as dayjs.Dayjs | null };
    const sorted = [...allowedDates].sort(); // ascending
    return { minAllowed: dayjs(sorted[0]), maxAllowed: dayjs(sorted[sorted.length - 1]) };
  }, [allowedDates]);

  const getInputDates = () => {
    setLoadingDates(true);
    api.get('/get-input-date')
      .then(res => {
        const dates: string[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.dates) ? res.data.dates : [];

        // Normalize & de-dupe just in case
        const normalized = Array.from(new Set(dates.map(String))).filter(Boolean);

        // Sort DESC (newest first) to choose a sensible default
        const sortedDesc = normalized.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
        setAllowedDates(sortedDesc);

        if (sortedDesc.length > 0) {
          // Keep current selection if still valid; otherwise default to newest
          setTime(prev => (allowedSet.has(prev) ? prev : sortedDesc[0]));
        } else {
          setTime('');
        }
      })
      .catch(error => {
        if (error.response) {
          console.error(t('unexpected_error'), error);
          setErrorMessage(t('something_went_wrong'));
        }
      })
      .finally(() => setLoadingDates(false));
  };

  const handleSearch = React.useCallback(() => {
    if (!time) {
      setErrorMessage(t('time_field_required'));
      return;
    }
    if (allowedSet.size && !allowedSet.has(time)) {
      setErrorMessage(t('selected_date_not_allowed') || 'Selected date is not allowed.');
      return;
    }

    setErrorMessage('');

    const formData = new FormData();

    formData.append('to', convertDateTime2(time));


    api.post(url, formData)
      .then(res => {
        refresh(res.data);
      })
      .catch(error => {
        if (error?.response?.status === 422) {
          setErrorMessage(t('something_went_wrong'));
        } else {
          console.error(t('unexpected_error'), error);
          setErrorMessage(t('something_went_wrong'));
        }
      });
  }, [time, allowedSet, refresh, t]);

  React.useEffect(() => {
    getInputDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (time && (!allowedSet.size || allowedSet.has(time))) {
      handleSearch();
    }
  }, [handleSearch, allowedSet, time]);

  // Only enable dates from the server
  const shouldDisableDate = React.useCallback(
    (d: Dayjs) => !allowedSet.has(d.format('YYYY-MM-DD')),
    [allowedSet]
  );

  const pickerValue: Dayjs | null = time ? dayjs(time) : null;

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

        {/* ⬇️ Calendar UI with whitelist enforcement */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
            <DatePicker
              label={t('search_time')}
              value={pickerValue}
              onChange={(d) => {
                const v = d ? d.format('YYYY-MM-DD') : '';
                setTime(v);
              }}
              disabled={loadingDates || allowedSet.size === 0}
              shouldDisableDate={shouldDisableDate}
              // Keep users in relevant range if you have bounds
              minDate={minAllowed || undefined}
              maxDate={maxAllowed || undefined}
              // Optional: add a helper text for status
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  helperText:
                    loadingDates
                      ? (t('loading') || 'Loading…')
                      : allowedSet.size === 0
                        ? (t('no_available_dates') || 'No available dates')
                        : undefined,
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs: 'auto' }}>
          <IconButton
            color="primary"
            sx={{ mt: { xs: 0, sm: 0.5 } }}
            onClick={handleSearch}
            disabled={!time || (allowedSet.size > 0 && !allowedSet.has(time))}
          >
            <SearchIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchBox;
