import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { uploader } from '@/utils/http_helper';
import { Category } from '@/utils/info';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ImageUploader from '@/_components/ImageUploader';
import { useRouter } from 'next/router';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

type AddPanelProps = {
    parent: number,
    onBack: () => void;
    onSave: (data: Category) => void;
};

const AddPanel: React.FC<AddPanelProps> = ({ parent, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>('');
    const [image, setImage] = useState<File | null>(null);

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
    }, [locale]);

    const handleSave = () => {
        if ((name) && image) {
            const formData = new FormData();

            locale === 'en' ? formData.append('category_en_name', name) :
                locale === 'zh' ? formData.append('category_zh_name', name) :
                    locale === 'ko' ? formData.append('category_ko_name', name) :
                        formData.append('category_name', name);

            (locale !== 'ja') && formData.append('category_name', name);

            formData.append('category_image', image);
            parent && formData.append('parent_id', parent.toString());

            uploader.post('/category', formData)
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
        } else if (!name) {
            setErrorMessage(t('name_field_required'));
        } else if (!image) {
            setErrorMessage(t('image_field_required'));
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
            <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
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
                    }} imageFile={image} imageFilePath={''} />
                </TableCell>
                <TableCell align="right"></TableCell>
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
            </TableRow>
        </>
    );
};

export default AddPanel;
