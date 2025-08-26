import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    Alert,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Printer } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';

type DeletePanelProps = {
    row: Printer;
    onBack: () => void;
    onDelete: (data: Printer) => void;
};

const DeletePanel: React.FC<DeletePanelProps> = ({ row, onBack, onDelete }) => {

    const { t } = useTranslation('common')

    const PRINTER_POSITION = {
        'COUNTER': t('counter'),
        "KITCHEN": t('kitchen'),  
    }

    const [errorMessage, setErrorMessage] = useState('');

    const handleDelete = () => {
        api.delete(`/printer/${row?.printer_id}`)
            .then(res => onDelete(row))
            .catch(error => {
                if (error.response) {
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
            <TableRow key={row?.printer_id}>
                <TableCell>
                    {row?.printer_name}
                </TableCell>
                <TableCell>
                    {row?.ip_address}
                </TableCell>
                <TableCell>
                    {row?.port}
                </TableCell>
                <TableCell>
                    {PRINTER_POSITION[row?.position]}
                </TableCell>
                <TableCell align="right">
                    {convertDateTime(row?.created_at)}
                </TableCell>
                <TableCell>
                    <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={handleDelete}
                        disabled={!row?.printer_id}
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
