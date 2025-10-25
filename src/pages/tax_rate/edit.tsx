import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Alert,
    InputAdornment,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { TaxRate } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';

type PanelParams = {
    row: TaxRate;
    onBack: () => void;
    onSave: (data: TaxRate) => void;
};

const Panel: React.FC<PanelParams> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>(row?.tax_rate_name);
    const [value, setValue] = useState<number>(row?.tax_rate_value);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        if (name && (value > 0)) {
            const formData = new FormData();

            formData.append("_method", "put")

            formData.append('tax_rate_name', name);
            formData.append('tax_rate_value', value.toString());

            api.post(`/tax-rate/${row?.tax_rate_id}`, formData)
                .then(res => onSave(res.data))
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
            if (!name) setErrorMessage(t('name_field_required'));
            if (value <= 0) setErrorMessage(t('value_field_required'));
        }
    };

    return (
        <>
            {errorMessage && (
                <TableRow>
                    <TableCell colSpan={4} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>)}
            <TableRow>
                <TableCell style={{padding: 8}}>
                    <TextField
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('name')}
                        label={t('name')}
                    />
                </TableCell>
                <TableCell style={{padding: 8}}>
                    <TextField
                        fullWidth
                        value={value}
                        type="number"
                        onChange={(e) => setValue(Number(e.target.value))}
                        placeholder={t('value')}
                        label={t('value')}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">%</InputAdornment>
                                )
                            }
                        }}
                    />
                </TableCell>
                <TableCell align="right">{convertDateTime(row?.created_at)}</TableCell>
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
        </>
    );
};

export default Panel;
