import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    Alert,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Inventory } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type DeletePanelProps = {
    row: Inventory;
    onBack: () => void;
    onDelete: (data: Inventory) => void;
};

const DeletePanel: React.FC<DeletePanelProps> = ({ row, onBack, onDelete }) => {

    const { t } = useTranslation('common')

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
    }, [locale]);

    const handleDelete = () => {
        api.delete(`/inventory/${row?.inventory_id}`)
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
            {errorMessage && (<TableRow>
                <TableCell colSpan={3} sx={{ border: 0 }}>
                    <Alert severity="error">{errorMessage}</Alert>
                </TableCell>
            </TableRow>)}
            <TableRow key={row?.inventory_id}>
                <TableCell>
                    {row?.name}
                    {/* {locale === 'en' ? row?.inventory_en_name :
                        locale === 'zh' ? row?.inventory_zh_name :
                            locale === 'ko' ? row?.inventory_ko_name :
                                row?.inventory_name} */}
                </TableCell>
                <TableCell>
                    {row?.current_stock}
                </TableCell>
                <TableCell>
                    {row?.request_amount}
                </TableCell>
                <TableCell>
                    {row?.unit?.unit_name}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>
                    <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={handleDelete}
                        disabled={!row?.inventory_id}
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
