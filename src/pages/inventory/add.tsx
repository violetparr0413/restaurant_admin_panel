import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Inventory, InventoryUnit } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type AddPanelProps = {
    onBack: () => void;
    onSave: (data: Inventory) => void;
};

const AddPanel: React.FC<AddPanelProps> = ({ onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>('');
    const [stock, setStock] = useState<number>(0);
    const [unitId, setUnitId] = useState<number>(0);

    const [units, setUnits] = useState<InventoryUnit[] | null>(null);

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    const getUnits = () => {
        api.get('/unit') // your server endpoint
            .then(res => {
                setUnits(res.data)
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    React.useEffect(() => {
        getUnits()
    }, []);

    React.useEffect(() => {
    }, [locale]);

    const handleSave = () => {
        if (name && unitId) {
            const formData = new FormData();

            formData.append('name', name);
            formData.append('stock', stock.toString());
            formData.append('unit_id', unitId.toString());
            // locale === 'en' ? formData.append('unit_en_name', name) :
            //     locale === 'zh' ? formData.append('unit_zh_name', name) :
            //         locale === 'ko' ? formData.append('unit_ko_name', name) :
            //             formData.append('unit_name', name);

            // (locale !== 'ja') && formData.append('unit_name', name);

            api.post('/inventory', formData)
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
        } else if (!name) {
            setErrorMessage(t('name_field_required'));
        } else if (!unitId) {
            setErrorMessage(t('unit_field_required'));
        }
    };

    return (
        <>
            {errorMessage && (
                <TableRow>
                    <TableCell colSpan={3} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>)}
            <TableRow>
                <TableCell>
                    <TextField
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('name')}
                        label={t('name')}
                    />
                </TableCell>
                <TableCell>
                    <TextField
                        fullWidth
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(Number(e.target.value))}
                        placeholder={t('stock')}
                        label={t('stock')}
                    />
                </TableCell>
                <TableCell></TableCell>
                <TableCell>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>{t('product_unit')}</InputLabel>
                        <Select
                            required
                            value={unitId}
                            onChange={(e) => {
                                setUnitId(Number(e.target.value))
                            }}
                            label={t('product_unit')}
                        >
                            <MenuItem value={0} disabled>{t('select')}</MenuItem>
                            {units?.map((x) => (
                                <MenuItem value={x.unit_id}>
                                    {x?.unit_name}
                                    {/* {locale === 'en' ? x?.category_en_name :
                                        locale === 'zh' ? x?.category_zh_name :
                                            locale === 'ko' ? x?.category_ko_name :
                                                x?.category_name} */}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
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

export default AddPanel;
