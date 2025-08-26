import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    Alert,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Supplier } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type DeletePanelProps = {
    row: Supplier;
    onBack: () => void;
    onDelete: (data: Supplier) => void;
};

const DeletePanel: React.FC<DeletePanelProps> = ({ row, onBack, onDelete }) => {

    const { t } = useTranslation('common')

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
    }, [locale]);

    const handleDelete = () => {
        api.delete(`/supplier/${row?.supplier_id}`)
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
                <TableCell colSpan={5} sx={{ border: 0 }}>
                    <Alert severity="error">{errorMessage}</Alert>
                </TableCell>
            </TableRow>)}
            <TableRow key={row?.supplier_id}>
                <TableCell>
                    {row?.supplier_name}
                    {/* {locale === 'en' ? row?.supplier_en_name :
                        locale === 'zh' ? row?.supplier_zh_name :
                            locale === 'ko' ? row?.supplier_ko_name :
                                row?.supplier_name} */}
                </TableCell>
                <TableCell>
                    {row?.phone}
                </TableCell>
                <TableCell>
                    {row?.fax}
                </TableCell>
                <TableCell>
                    {row?.email}
                </TableCell>
                <TableCell>
                    {row?.note}
                </TableCell>
                <TableCell align="right">
                    {convertDateTime(row?.created_at)}
                </TableCell>
                <TableCell>
                    <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={handleDelete}
                        disabled={!row?.supplier_id}
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
