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
import CloseIcon from '@mui/icons-material/Close';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Dish } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';
import { deepOrange, green } from '@mui/material/colors';

import { useTranslation } from 'next-i18next';
import DishImagePreview from '@/_components/ImagePreview';
import { useRouter } from 'next/router';
import YouTubeThumbnail from '@/_components/YouTubeThumbnail';

type DeletePanelProps = {
    row: Dish;
    onBack: () => void;
    onDelete: (data: Dish) => void;
};

const DeletePanel: React.FC<DeletePanelProps> = ({ row, onBack, onDelete }) => {

    const { t } = useTranslation('common')

    const DISH_STATUS = [
        '---',
        t('takeout'),
        t('popular'),
        t('extra'),
    ];

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

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
    }, [locale]);

    return (
        <>
            {errorMessage && (<TableRow>
                <TableCell colSpan={7} sx={{ border: 0 }}>
                    <Alert severity="error">{errorMessage}</Alert>
                </TableCell>
            </TableRow>)}
            <TableRow key={row?.dish_id}>
                <TableCell component="th" scope="row">
                    {row?.category.parent ? (
                        locale === 'en' ? row?.category.parent?.category_en_name :
                            locale === 'zh' ? row?.category.parent?.category_zh_name :
                                locale === 'ko' ? row?.category.parent?.category_ko_name :
                                    row?.category.parent?.category_name
                    ) : (
                        locale === 'en' ? row?.category.category_en_name :
                            locale === 'zh' ? row?.category.category_zh_name :
                                locale === 'ko' ? row?.category.category_ko_name :
                                    row?.category.category_name
                    )}
                </TableCell>
                <TableCell>
                    {row?.category.parent ? (
                        locale === 'en' ? row?.category.category_en_name :
                            locale === 'zh' ? row?.category.category_zh_name :
                                locale === 'ko' ? row?.category.category_ko_name :
                                    row?.category.category_name
                    ) : ('---')}
                </TableCell>
                <TableCell>
                    {locale === 'en' ? row?.dish_en_name :
                        locale === 'zh' ? row?.dish_zh_name :
                            locale === 'ko' ? row?.dish_ko_name :
                                row?.dish_name}
                </TableCell>
                <TableCell>
                    {row?.dish_image ? (<DishImagePreview
                        src={process.env.NEXT_PUBLIC_API_BASE_URL2 + row?.dish_image}
                    />) : (<></>)}
                </TableCell>
                <TableCell>
                    {row?.youtube_url && (<YouTubeThumbnail url={row?.youtube_url} />)}
                </TableCell>
                <TableCell>
                    {row?.printers?.reduce((a, x) => a += (a == '' ? '' : ', ') + x.printer_name, '')}
                </TableCell>
                <TableCell align="right">
                    {row?.dish_price}
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {row?.dish_available ? (
                            <Avatar sx={{ bgcolor: green[500], width: 32, height: 32 }}>
                                <CheckIcon sx={{ width: 20, height: 20 }} />
                            </Avatar>
                        ) : (
                            <Avatar sx={{ bgcolor: deepOrange[500], width: 32, height: 32 }}>
                                <CloseIcon sx={{ width: 20, height: 20 }} />
                            </Avatar>
                        )}
                    </Box>
                </TableCell>
                <TableCell align="right">
                    {DISH_STATUS[row?.dish_status]}
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
