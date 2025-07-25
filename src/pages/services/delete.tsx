import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    Alert,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Service } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

type DeletePanelProps = {
    row: Service;
    onBack: () => void;
    onDelete: (data: Service) => void;
};

const DeletePanel: React.FC<DeletePanelProps> = ({ row, onBack, onDelete }) => {

    const { t } = useTranslation('common')

    const [errorMessage, setErrorMessage] = useState('');

    const handleDelete = () => {
        api.delete(`/service/${row?.service_id}`)
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
            <TableRow key={row?.service_id}>
                <TableCell>
                    {row?.service_name}
                </TableCell>
                <TableCell>
                    {row?.service_en_name}
                </TableCell>
                <TableCell>
                    {row?.service_zh_name}
                </TableCell>
                <TableCell align="right">
                    {convertDateTime(row?.created_at)}
                </TableCell>
                <TableCell>
                    <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={handleDelete}
                        disabled={!row?.service_id}
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
