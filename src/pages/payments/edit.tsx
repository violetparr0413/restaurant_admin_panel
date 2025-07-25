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
import { PaymentMethod } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

type EditPanelProps = {
    row: PaymentMethod,
    onBack: () => void;
    onSave: (data: PaymentMethod) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>(row?.payment_method_name);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        if (name) {
            const formData = new FormData();

            formData.append("_method", "put")

            formData.append('payment_method_name', name);

            api.post(`/payment-method/${row?.payment_method_id}`, formData)
                .then(res => onSave(res.data))
                .catch(error => {
                    if (error.response && error.response.status === 422) {
                        // Validation error from server
                        console.log(error.response.data);
                        setErrorMessage(error.response.data.message);
                    } else {
                        // Other errors
                        console.error(t('unexpected_error'), error);
                        setErrorMessage(t('something_went_wrong'));
                    }
                })
        } else {
            setErrorMessage(t('name_field_required'));
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
                <TableCell>
                    <TextField
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('name')}
                        label={t('name')}
                    />
                </TableCell>
                <TableCell align="right"></TableCell>
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
