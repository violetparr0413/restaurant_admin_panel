import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    Avatar,
    Alert,
    Box,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Dish } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';
import { deepOrange, green } from '@mui/material/colors';
import { CancelOutlined } from '@mui/icons-material';

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
    row: Dish;
    onBack: () => void;
    onDelete: (data: Dish) => void;
};

const DeletePanel: React.FC<DeletePanelProps> = ({ row, onBack, onDelete }) => {

    const { t } = useTranslation('common')
    const [errorMessage, setErrorMessage] = useState('');

    const handleDelete = () => {
        api.delete(`/dish/${row?.dish_id}`)
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
            <TableRow key={row?.dish_id}>
                <TableCell component="th" scope="row">
                    {row?.category.category_name}
                </TableCell>
                <TableCell>
                    {row?.dish_name}
                </TableCell>
                <TableCell>
                    {row?.dish_en_name}
                </TableCell>
                <TableCell>
                    {row?.dish_zh_name}
                </TableCell>
                <TableCell>
                    {row?.dish_image ? (<DishImagePreview
                        src={process.env.NEXT_PUBLIC_API_BASE_URL2 + row?.dish_image}
                    />) : (<></>)}
                </TableCell>
                <TableCell align="right">
                    {row?.dish_price}
                </TableCell>
                <TableCell>
                    {row?.dish_available ? (<Avatar sx={{ bgcolor: green[500], width: 32, height: 32 }}>
                        <CheckIcon />
                    </Avatar>) : (<Avatar sx={{ bgcolor: deepOrange[500], width: 32, height: 32 }}>
                        <CancelOutlined />
                    </Avatar>)}
                </TableCell>
                <TableCell align="right">
                    {convertDateTime(row?.created_at)}
                </TableCell>
                <TableCell>
                    <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={handleDelete}
                        disabled={!row?.dish_id}
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
