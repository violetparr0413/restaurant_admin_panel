import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Select,
    MenuItem,
    Box,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Stack,
    Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Category, Dish, USER_ROLE } from '@/utils/info';
import api, { uploader } from '@/utils/http_helper';
import FileUpload from '@/_components/FileUploadBox';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type AddPanelProps = {
    onBack: () => void;
    onSave: (data: Dish) => void;
};

const AddPanel: React.FC<AddPanelProps> = ({ onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [category, setCategory] = useState<number>(0);
    const [subcategory, setSubCategory] = useState<number>(0);

    const [name, setName] = useState<string>('');
    const [unit, setUnit] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [image, setImage] = useState<File | null>(null);
    const [available, setAvailable] = useState<boolean>(false);
    const [description, setDescription] = useState<string>('');

    const [errorMessage, setErrorMessage] = useState('');

    const [categories, setCategories] = useState<Category[] | null>(null);
    const [subCategories, setSubCategories] = useState<Category[] | null>(null);

    const getCategoryData = () => {
        api.get('/category') // your server endpoint
            .then(res => {
                const rows = res.data
                const parentRows = rows.filter((row: { parent_id: number; }) => row?.parent_id === 0);
                setCategories(parentRows)
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    React.useEffect(() => {
        getCategoryData()
    }, []);

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
    }, [locale]);

    const handleSave = () => {
        if (name && unit && categories && image) {
            const formData = new FormData();

            formData.append('dish_name', name);

            locale === 'en' ? formData.append('dish_en_name', name) :
                locale === 'zh' ? formData.append('dish_zh_name', name) :
                    locale === 'ko' ? formData.append('dish_ko_name', name) :
                        formData.append('dish_name', name);

            (locale !== 'ja') && formData.append('dish_name', name);

            if (description) {
                locale === 'en' ? formData.append('dish_en_description', name) :
                    locale === 'zh' ? formData.append('dish_zh_description', name) :
                        locale === 'ko' ? formData.append('dish_ko_description', name) :
                            formData.append('dish_description', description);

                (locale !== 'ja') && formData.append('dish_description', description);
            }

            formData.append('dish_unit', unit);
            image && formData.append('dish_image', image);
            subcategory ? formData.append('category_id', subcategory.toString()) : formData.append('category_id', category.toString());
            (price !== null) && formData.append('dish_price', price.toString());
            (available !== null) && formData.append('dish_available', available ? '1' : '0');

            uploader.post('/dish', formData)
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
            if (!name) setErrorMessage(t('name_field_required'));
            if (!unit) setErrorMessage(t('unit_field_required'));
            if (!categories) setErrorMessage(t('categories_field_required'));
            if (!image) setErrorMessage(t('image_field_required'));
        }
    };

    const onCategoryChange = (id: number) => {
        api.get(`/get-child-category/${id}`) // your server endpoint
            .then(res => setSubCategories(res.data.categories))
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    return (
        <TableRow>
            <TableCell colSpan={5}>
                <Box
                    component="form"
                    sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
                    noValidate
                    autoComplete="off"
                >
                    {errorMessage && <Alert sx={{ m: 1, mb: 2 }} severity="error">{errorMessage}</Alert>}
                    <div>
                        <Stack direction="row" spacing={2}>
                            <FormControl sx={{ flex: 1 }}>
                                <InputLabel>{t('category')}</InputLabel>
                                <Select
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(Number(e.target.value))
                                        onCategoryChange(Number(e.target.value))
                                    }}
                                    displayEmpty
                                    sx={{ mt: 1, ml: 1, mr: 1 }}
                                >
                                    <MenuItem value={0}>{t('select')}</MenuItem>
                                    {categories?.map((x) => (
                                        <MenuItem value={x.category_id}>{x.category_name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ flex: 1 }}>
                                <InputLabel>{t('subcategory')}</InputLabel>
                                <Select
                                    value={subcategory}
                                    onChange={(e) => {
                                        setSubCategory(Number(e.target.value))
                                    }}
                                    displayEmpty
                                    sx={{ mt: 1, mr: 1 }}
                                >
                                    <MenuItem value={0}>{t('select')}</MenuItem>
                                    {subCategories && subCategories?.map((x) => (
                                        <MenuItem value={x.category_id}>{x.category_name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                value={name}
                                required
                                onChange={(e) => setName(e.target.value)}
                                label={t('name')}
                                placeholder={t('name')}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                value={unit}
                                required
                                onChange={(e) => setUnit(e.target.value)}
                                label={t('unit')}
                                placeholder={t('unit')}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                label={t('price')}
                                placeholder={t('price')}
                                sx={{ flex: 1 }}
                            />
                        </Stack>
                    </div>
                    <div>
                        <Stack sx={{ ml: 2 }} direction="row" spacing={2} alignItems="center">
                            <FormControl component="fieldset" variant="standard">
                                <FormControlLabel
                                    control={
                                        <Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} name="gilad" />
                                    }
                                    sx={{ mr: 4 }}
                                    label={t('dish_availability')}
                                />
                            </FormControl>
                            <TextField
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                label={t('description')}
                                placeholder={t('description')}
                                sx={{ flex: 2 }}
                            />
                            <FileUpload onChange={(e) => {
                                const target = e.target as HTMLInputElement;
                                if (target.files && target.files[0]) {
                                    setImage(target.files[0]);
                                }
                            }} />
                        </Stack>
                    </div>
                </Box>
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
    );
};

export default AddPanel;
