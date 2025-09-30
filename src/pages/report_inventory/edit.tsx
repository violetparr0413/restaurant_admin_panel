import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { ReportInventory } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type EditPanelProps = {
    row: ReportInventory;
    onSave: (id: number, remark: string) => void;
    onBack: () => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onSave, onBack }) => {

    const { t } = useTranslation('common')

    const [remark, setRemark] = useState<string>(row?.inventory.remark ?? "")
    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        const formData = new FormData();

        formData.append('inventory_id', row?.inventory.inventory_id.toString())
        formData.append('remark', remark)

        api.post(`/update-inventory-remark`, formData)
            .then(res => {
                onSave(row?.inventory.inventory_id, remark)
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
                    <TableCell colSpan={9} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>)}
            <TableRow>
                <TableCell component="th" scope="row">
                    {row?.inventory.name}
                </TableCell>
                <TableCell>
                    {row?.inventory.unit?.unit_name}
                </TableCell>
                <TableCell align="right">
                    {row?.openStock ?? '--'}
                </TableCell>
                <TableCell align="right">
                    {row?.purchasedQty ?? '--'}
                </TableCell>
                <TableCell align="right">
                    {row?.actualStock ? Math.round(row?.difference / row?.actualStock * 100) + '%' : '--'}
                </TableCell>
                <TableCell align="right">
                    {row?.salesConsumption ?? '--'}
                </TableCell>
                <TableCell align="right">
                    {row?.theoreticalBalance ?? '--'}
                </TableCell>
                <TableCell align="right">
                    {row?.actualStock ?? '--'}
                </TableCell>
                <TableCell align="right">
                    {row?.difference ?? '--'}
                </TableCell>
                <TableCell>
                    <TextField
                        fullWidth
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder={t('remarks')}
                        label={t('remarks')}
                    />
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
