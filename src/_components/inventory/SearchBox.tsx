import React from 'react';
import { Box, Grid, IconButton, Typography, Alert, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api, { convertDateTime1, convertDateTimeMin, getCurrentDate, getCurrentTimeMin } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { Inventory, Supplier } from '@/utils/info';

type ParamProps = {
  refresh: (datas: Inventory[]) => void;
  isShow: boolean;
  filterSupplier: (number) => void;
  filterSupplierId: number
};

const today = getCurrentDate();

const SearchBox: React.FC<ParamProps> = ({ refresh, isShow, filterSupplier, filterSupplierId }) => {

  const { t } = useTranslation('common')

  const [time, setTime] = React.useState(today);

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
    if (time) {
      setErrorMessage('');

      api.get('/inventory', {
        params: {
          time: convertDateTime1(time)
        }
      })
        .then(res => refresh(res.data))
        .catch(error => {
          if (error?.response?.status === 422) {
            setErrorMessage(t('something_went_wrong'));
          } else {
            console.error(t('unexpected_error'), error);
            setErrorMessage(t('something_went_wrong'));
          }
        });
    } else if (!time) {
      setErrorMessage(t('time_field_required'));
    }
  }, [time]); // <— include deps

  React.useEffect(() => {
    getSuppliers()
  }, [])

  React.useEffect(() => {
    handleSearch();
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
        {t('inventory')}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {errorMessage && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label={t('search_time')}
            type="date"
            variant="outlined"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Grid>
        {
          isShow && (
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('supplier')}</InputLabel>
                <Select
                  label={t('supplier')}
                  value={filterSupplierId}
                  onChange={(e) => {
                    filterSupplier(Number(e.target.value))
                  }
                }
                >
                  <MenuItem value={0}>{t('all')}</MenuItem>
                  {suppliers?.map((x) => (
                    <MenuItem value={x.supplier_id}>{x.supplier_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )
        }
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
