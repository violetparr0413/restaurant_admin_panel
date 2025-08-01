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
import ImageUploader from '@/_components/ImageUploader';
import { useRouter } from 'next/router';

type EditPanelProps = {
    row: Category;
    onBack: () => void;
    onSave: (data: Category) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>(row?.category_name);
    const [image, setImage] = useState<File | null>(null);

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
        const name = locale === 'en' ? row?.category_en_name :
            locale === 'zh' ? row?.category_zh_name :
                locale === 'ko' ? row?.category_ko_name :
                    row?.category_name
        setName(name ? name : '')
    }, [locale]);

    const handleSave = () => {
        if (name) {
            const formData = new FormData();

            formData.append("_method", "put")

            locale === 'en' ? formData.append('category_en_name', name) :
                locale === 'zh' ? formData.append('category_zh_name', name) :
                    locale === 'ko' ? formData.append('category_ko_name', name) :
                        formData.append('category_name', name);

            image && formData.append('category_image', image);
            formData.append('category_order', row?.category_order.toString());
            row?.parent_id && formData.append('parent_id', row?.parent_id.toString());

            uploader.post(`/category/${row?.category_id}`, formData)
                .then(res => onSave(res.data))
                .catch(error => {
                    if (error.response && error.response.status === 422) {
                        // Validation error from server
                        console.log(error.response.data);
                        // setErrorMessage(error.response.data.message);
                        setErrorMessage(t('something_went_wrong'));
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
                    <TableCell colSpan={5} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>)}
            <TableCell>
                <TextField
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('name')}
                    fullWidth
                    label={t('name')}
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
