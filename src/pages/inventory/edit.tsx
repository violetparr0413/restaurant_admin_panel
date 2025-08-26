import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Inventory, InventoryUnit } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type ParamProps = {
    row: Inventory;
    onBack: () => void;
    onSave: (data: Inventory) => void;
};

const EditPanel: React.FC<ParamProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [stock, setStock] = useState<number>(row?.current_stock || 0);

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
    }, [locale]);

    const handleSave = () => {
        const formData = new FormData();

        formData.append("_method", "put")

        formData.append('stock', stock.toString());

        api.post(`/inventory/${row?.inventory_id}`, formData)
            .then(res => {
                onSave({...res.data, current_stock: stock})
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
                    {row?.name}
                </TableCell>
                <TableCell>
                    <TextField
                        fullWidth
                        value={stock}
                        type="number"
                        onChange={(e) => setStock(Number(e.target.value))}
                        placeholder={t('stock')}
                        label={t('stock')}
                    />
                </TableCell>
                <TableCell>
                    {row?.unit?.unit_name}
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
        </>
    );
};

export default EditPanel;
