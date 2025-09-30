import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    Alert,
} from '@mui/material';

import IconButton from '@mui/material/IconButton';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { Employee } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';

type PanelProps = {
    row: Employee;
    onBack: () => void;
    onConfirm: (data: Employee) => void;
};

const Panel: React.FC<PanelProps> = ({ row, onBack, onConfirm }) => {

    const { t } = useTranslation('common')
    const [errorMessage, setErrorMessage] = useState('');

    const USER_ROLE = {
        'ADMIN': t('admin'),
        'WAITSTAFF': t('waitstuff'),
        'COUNTER': t('counter')
    }

    const handleConfirm = () => {
        const form = new FormData();

        form.append('employee_id', row?.employee_id.toString());
        form.append('is_logged_in', '0');

        api.post(`/change-logged-in`, form)
            .then(res => onConfirm(res.data.employee))
            .catch(error => {
                if (error.response && error.response.status === 422) {
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
                <Alert severity="error">{errorMessage}</Alert>
            )}
            <TableRow>
                <TableCell>
                    {row?.name}
                </TableCell>
                <TableCell>
                    {USER_ROLE[row?.role]}
                </TableCell>
                <TableCell colSpan={4}>
                    {t('are_you_really_forcing')}
                </TableCell>
                <TableCell align="right">
                    {convertDateTime(row?.created_at)}
                </TableCell>
                <TableCell>
                    <IconButton
                        aria-label="confirm"
                        color="primary"
                        onClick={handleConfirm}
                        disabled={!row?.employee_id}
                        sx={{ mr: 1 }}
                    >
                        <CheckIcon />
                    </IconButton>
                    <IconButton
                        aria-label="delete"
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
