import React, { useState } from 'react';
import {
    Alert,
    TableCell,
    TableRow,
    TextField,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { convertDateTime, uploader } from '@/utils/http_helper';
import { Category } from '../../utils/info';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ImageUploader from '@/_components/ImageUploader';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

type EditPanelProps = {
    row: Category;
    onBack: () => void;
    onSave: (data: Category) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [nameJP, setNameJP] = useState<string>(row?.category_name);
    const [nameEN, setNameEN] = useState<string>(row?.category_en_name);
    const [nameCN, setNameCN] = useState<string>(row?.category_zh_name);
    const [image, setImage] = useState<File | null>(null);

    const [errorMessage, setErrorMessage] = useState('');


    const handleSave = () => {
        if (nameJP) {
            const formData = new FormData();

            formData.append("_method", "put")

            nameJP && formData.append('category_name', nameJP);
            nameEN && formData.append('category_en_name', nameEN);
            nameCN && formData.append('category_zh_name', nameCN);
            image && formData.append('category_image', image);
            formData.append('category_order', row?.category_order.toString());
            row?.parent_id && formData.append('parent_id', row?.parent_id.toString());

            uploader.post(`/category/${row?.category_id}`, formData)
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
                    <TableCell colSpan={6} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>)}
            <TableCell>
                <TextField
                    value={nameJP}
                    onChange={(e) => setNameJP(e.target.value)}
                    placeholder={t('name')}
                    fullWidth
                    label={t('name')}
                />
            </TableCell>
            <TableCell>
                <TextField
                    value={nameEN}
                    onChange={(e) => setNameEN(e.target.value)}
                    placeholder={t('name_en')}
                    fullWidth
                    label={t('name_en')}
                />
            </TableCell>
            <TableCell>
                <TextField
                    value={nameCN}
                    onChange={(e) => setNameCN(e.target.value)}
                    placeholder={t('name_zh')}
                    fullWidth
                    label={t('name_zh')}
                />
            </TableCell>
            <TableCell>
                <ImageUploader handleImageChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                        setImage(target.files[0]);
                    }
                }} imageFile={image} imageFilePath={row?.category_image} />
            </TableCell>
            <TableCell align="right">
                {convertDateTime(row?.created_at)}
            </TableCell>
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
        </>
    );
};

export default EditPanel;
