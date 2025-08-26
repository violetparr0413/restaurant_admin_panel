import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Alert,
    Box,
    Grid,
    Table,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Switch
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Inventory, Supplier } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type ParamProps = {
    row: Inventory;
    onBack: () => void;
};

const PurchasePanel: React.FC<ParamProps> = ({ row, onBack }) => {

    const { t } = useTranslation('common')

    const [amount, setAmount] = useState<number>(0);
    const [supplierId, setSupplierId] = useState<number>(0);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [sendMode, setSendMode] = useState<boolean>(true);

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
    }, [locale]);

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

    React.useEffect(() => {
        getSuppliers()
    }, []);

    const handleSave = () => {
        if (supplierId) {
            const formData = new FormData();

            formData.append('inventory_id', row?.inventory_id.toString());
            formData.append('amount', amount.toString());
            formData.append('supplier_id', supplierId.toString());
            (sendMode !== null) && formData.append('by_email', sendMode ? '0' : '1');

            api.post(`/purchase-inventory`, formData)
                .then(res => {
                    onBack()
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
        } else {
            setErrorMessage(t('supplier_field_required'));
        }

    };

    return (
        <TableRow>
            <TableCell>
                {row?.name}
            </TableCell>
            <TableCell colSpan={2}>
                <Box p={3}>
                    <Grid container spacing={1}>
                        {errorMessage && (
                            <Grid size={{ xs: 12 }}>
                                <Alert severity="error">{errorMessage}</Alert>
                            </Grid>)}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                type="number"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                placeholder={t('quantity')}
                                label={t('quantity')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>{t('supplier')}</InputLabel>
                                <Select
                                    required
                                    value={supplierId}
                                    onChange={(e) => {
                                        setSupplierId(Number(e.target.value))
                                    }}
                                    label={t('supplier')}
                                >
                                    <MenuItem value={0} disabled>{t('select')}</MenuItem>
                                    {suppliers?.map((x) => (
                                        <MenuItem value={x.supplier_id} key={x.supplier_id}>
                                            {x?.supplier_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl component="fieldset" variant="standard">
                                <FormControlLabel
                                    control={
                                        <Switch checked={sendMode} onChange={(e) => setSendMode(e.target.checked)} name="gilad" />
                                    }
                                    sx={{ mt: 1, ml: 1 }}
                                    label={t('send_by_email')}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            </TableCell>
            <TableCell>
                <IconButton
                    aria-label="save"
                    color="primary"
                    onClick={handleSave}
                    sx={{ mr: 1 }}
                >
                    <SaveIcon />
                </IconButton>
                <IconButton
                    aria-label="save"
                    color="secondary"
                    onClick={onBack}
                >
                    <ArrowBackIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};

export default PurchasePanel;
