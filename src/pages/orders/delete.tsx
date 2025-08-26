import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    Alert,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Order } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';

type DeletePanelProps = {
    row: Order;
    onBack: () => void;
    onDelete: (data: Order) => void;
};

const DeletePanel: React.FC<DeletePanelProps> = ({ row, onBack, onDelete }) => {

    const { t } = useTranslation('common')
    const [errorMessage, setErrorMessage] = useState('');

    const ORDER_STATUS = {
        "ORDERED": t('ordered'),
        "BILLED": t('billed'),
        "CANCELLED": t('cancelled'),
        "INCART": t('incart')
    }

    const handleDelete = () => {
        api.delete(`/order/${row?.order_id}`)
            .then(res => onDelete(row))
            .catch(error => {
                console.error(t('unexpected_error'), error);
                setErrorMessage(t('something_went_wrong'));
            })
    };

    return (
        <>
            {errorMessage && (
                <TableRow>
                    <TableCell colSpan={5} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>)}
            <TableRow key={row?.order_id}>
                <TableCell component="th" scope="row">
                    {row?.dish?.dish_name}
                </TableCell>
                <TableCell style={{ width: 160 }}>
                    {row?.employee?.name}
                </TableCell>
                <TableCell style={{ width: 160 }}>
                    {row?.order_qty}
                </TableCell>
                <TableCell style={{ width: 160 }}>
                    {ORDER_STATUS[row?.order_status]}
                </TableCell>
                <TableCell style={{ width: 160 }} align="right">
                    {convertDateTime(row?.created_at)}
                </TableCell>
                <TableCell>
                    <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={handleDelete}
                        disabled={!row?.order_id}
                        sx={{ mr: 1 }}
                    >
                        <DeleteIcon />
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

export default DeletePanel;
