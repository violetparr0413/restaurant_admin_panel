import React, { useEffect } from 'react';
import { Box, MenuItem, FormControl, InputLabel, Select, Grid, Typography, Alert, TextField, IconButton } from '@mui/material';
import api from '@/utils/http_helper';
import SearchIcon from '@mui/icons-material/Search';

import { useTranslation } from 'next-i18next';
import { Category, Dish } from '@/utils/info';
import { useRouter } from 'next/router';

type ParamProps = {
    refresh: (datas: Dish[]) => void;
};

const DishSearchBox: React.FC<ParamProps> = ({ refresh }) => {

    const { t } = useTranslation('common')

    const [categoryId, setCategoryId] = React.useState<number>(0);
    const [subcategoryId, setSubCategoryId] = React.useState<number>(0);
    const [categories, setCategories] = React.useState<Category[] | null>(null);
    const [subcategories, setSubCategories] = React.useState<Category[] | null>(null);
    const [errorMessage, setErrorMessage] = React.useState('');

    const [dish, setDish] = React.useState('');

    const getCategoryData = () => {
        api.get('/category') // your server endpoint
            .then(res => {
                const rows = res.data
                const parentRows = rows.filter((row: { parent_id: number; }) => row?.parent_id === 0);
                setCategories(parentRows)
                setCategoryId(0)
                setSubCategoryId(0)
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    const getSubCategoryData = (id: number) => {
        api.get(`/get-child-category/${id}`)
            .then(res => {
                setSubCategories(res.data.categories)
                setSubCategoryId(0)
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            })
    };

    const handleSearch = React.useCallback(() => {
        const formData = new FormData();

        dish && formData.append('search_value', dish);
        
        subcategoryId > 0 ? formData.append('category_id', subcategoryId.toString())
            : categoryId > 0 ? formData.append('category_id', categoryId.toString())
                : formData.append('category_id', '');

        api.post('/search-dish', formData)
            .then(res => {
                // console.log(res.data);
                refresh(res.data)
            })
            .catch(error => {
                if (error?.response?.status === 422) {
                    console.log(error.response.data);
                    setErrorMessage(t('something_went_wrong'));
                } else {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }, [dish, categoryId, subcategoryId]); // <— include deps

    useEffect(() => {
        getCategoryData()
        // run immediately
        handleSearch();
    }, []);

    const router = useRouter();
    const { locale } = router;

    useEffect(() => {
    }, [locale]);

    return (
        <Box sx={{ mb: 2, position: 'relative', border: '2px solid #1ba3e1', borderRadius: 1, p: 2, mt: 2 }}>
            <Typography
                variant="subtitle2"
                sx={{
                    position: 'absolute',
                    top: -10,
                    left: 12,
                    bgcolor: 'background.paper',
                    px: 1,
                    color: '#1ba3e1',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                }}
            >
                {t('parent_category')}
            </Typography>
            <Grid container spacing={2} alignItems="center">
                {errorMessage && (
                    <Grid size={{ xs: 12 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </Grid>
                )}
                <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('category')}</InputLabel>
                        <Select
                            label={t('category')}
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(Number(e.target.value))
                                getSubCategoryData(Number(e.target.value))
                            }}
                        >
                            <MenuItem value={0}>{t('all')}</MenuItem>
                            {categories?.map((x) => (
                                <MenuItem value={x.category_id}>{locale === 'en' ? x?.category_en_name :
                                    locale === 'zh' ? x?.category_zh_name :
                                        locale === 'ko' ? x?.category_ko_name :
                                            x?.category_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('subcategory')}</InputLabel>
                        <Select
                            label={t('subcategory')}
                            value={subcategoryId}
                            onChange={(e) => {
                                setSubCategoryId(Number(e.target.value))
                            }}
                        >
                            <MenuItem value={0}>{t('all')}</MenuItem>
                            {subcategories?.map((x) => (
                                <MenuItem value={x.category_id}>{locale === 'en' ? x?.category_en_name :
                                    locale === 'zh' ? x?.category_zh_name :
                                        locale === 'ko' ? x?.category_ko_name :
                                            x?.category_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                        label={t('dish')}
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={dish}
                        onChange={(e) => setDish(e.target.value)}
                    />
                </Grid>
                <Grid size={{ xs: "auto" }}>
                    <IconButton
                        color="primary"
                        sx={{ mt: { xs: 0, sm: 0.5 } }}
                        onClick={handleSearch}
                    >
                        <SearchIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DishSearchBox;
