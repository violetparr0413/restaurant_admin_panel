import React, { useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    TableCell,
    TableRow,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Category } from '../../utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import DishImagePreview from '@/_components/ImagePreview';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

type DeletePanelProps = {
    row: Category;
    onBack: () => void;
    onDelete: (row: Category) => void;
};

const DeletePanel: React.FC<DeletePanelProps> = ({ row, onBack, onDelete }) => {

    const { t } = useTranslation('common')

    const [errorMessage, setErrorMessage] = useState('');

    const handleDelete = () => {
        api.delete(`/category/${row?.category_id}`)
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
                <TableRow>
                    <TableCell colSpan={6} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>)}
            <TableCell>
                {row?.category_name}
            </TableCell>
            <TableCell>
                {row?.category_en_name}
            </TableCell>
            <TableCell>
                {row?.category_zh_name}
            </TableCell>
            <TableCell>
                {row?.category_image ? (<DishImagePreview
                    src={process.env.NEXT_PUBLIC_API_BASE_URL2 + row?.category_image}
                />) : (<></>)}
            </TableCell>
            <TableCell align="right">
                {convertDateTime(row?.created_at)}
            </TableCell>
            <TableCell>
                <IconButton
                    aria-label="delete"
                    color="error"
                    onClick={handleDelete}
                    disabled={!row?.category_id}
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
        </>
    );
};

export default DeletePanel;
