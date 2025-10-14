import React, { useCallback, useEffect, useState } from 'react';
import {
    Container,
    Grid,
    TextField,
    Typography,
    Box,
    Button,
    Paper,
    Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import api, { uploader } from '@/utils/http_helper';


import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import BrandLogoUpload from './logo';
import ImageBulkUploader from './background';
import { useRouter } from 'next/router';
import PrintableTextEditor, { PrintLine } from '@/_components/brand/FancyMultiLineEditor';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}


const BrandConfigPage = () => {

    const { t } = useTranslation('common')

    const [loaded, setLoaded] = useState(false);
    const [brandName, setBrandName] = useState('');
    const [duration, setDuration] = useState(1);
    const [screenInterval, setScreenInterval] = useState(1);
    const [brandLogo, setBrandLogo] = useState<File | null>(null);
    const [bgImages, setBgImages] = useState<File[]>([]);

    const [dish1, setDish1] = useState('');
    const [dish2, setDish2] = useState('');
    const [dish3, setDish3] = useState('');
    const [dish4, setDish4] = useState('');
    const [dish5, setDish5] = useState('');

    const [LogoPath, setLogoPath] = useState('');
    const [imagePaths, setImagePaths] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    const [printLines, setPrintLines] = React.useState<PrintLine[]>([]);

    const router = useRouter();
    const { locale } = router;

    const refresh = useCallback(async () => {
        api.get('/brand') // your server endpoint
            .then(res => {
                setLoaded(true)
                if (Object.keys(res.data).length !== 0) {
                    setBrandName(res.data?.restaurant_name)
                    setLogoPath(res.data?.restaurant_logo)
                    setScreenInterval(res.data?.screen_saver_after)
                    setDuration(res.data?.background_duration)
                    setImagePaths(JSON.parse(res.data?.restaurant_background))

                    const dish_name1 = locale === 'en' ? res.data?.dish1_en :
                        locale === 'zh' ? res.data?.dish1_zh :
                            locale === 'ko' ? res.data?.dish1_ko :
                                res.data?.dish1
                    setDish1(dish_name1 ? dish_name1 : '')

                    const dish_name2 = locale === 'en' ? res.data?.dish2_en :
                        locale === 'zh' ? res.data?.dish2_zh :
                            locale === 'ko' ? res.data?.dish2_ko :
                                res.data?.dish2
                    setDish2(dish_name2 ? dish_name2 : '')

                    const dish_name3 = locale === 'en' ? res.data?.dish3_en :
                        locale === 'zh' ? res.data?.dish3_zh :
                            locale === 'ko' ? res.data?.dish3_ko :
                                res.data?.dish3
                    setDish3(dish_name3 ? dish_name3 : '')

                    const dish_name4 = locale === 'en' ? res.data?.dish4_en :
                        locale === 'zh' ? res.data?.dish4_zh :
                            locale === 'ko' ? res.data?.dish4_ko :
                                res.data?.dish4
                    setDish4(dish_name4 ? dish_name4 : '')

                    const dish_name5 = locale === 'en' ? res.data?.dish5_en :
                        locale === 'zh' ? res.data?.dish5_zh :
                            locale === 'ko' ? res.data?.dish5_ko :
                                res.data?.dish5
                    setDish5(dish_name5 ? dish_name5 : '')
                }
                setPrintLines(JSON.parse(res.data?.print_data));
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }, [t])

    useEffect(() => {
        refresh()
        setInfoMessage('');
    }, [refresh, locale]);

    if (!loaded) {
        return <div>{t('loading')}...</div>;
    }

    const handleBrandLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBrandLogo(e.target.files[0]);
        }
    };

    const handleSave = () => {
        if (brandName && (duration > 0) && (screenInterval > 0)) {

            if (dish1 || dish2 || dish3 || dish4 || dish5) {
                if (!dish1 || !dish2 || !dish3 || !dish4 || !dish5) {
                    setErrorMessage(t('popular_dishs_field_required'));
                    setInfoMessage('');
                    return
                }
            }

            const formData = new FormData();

            locale === 'en' ? formData.append('dish1_en', dish1) :
                locale === 'zh' ? formData.append('dish1_zh', dish1) :
                    locale === 'ko' ? formData.append('dish1_ko', dish1) :
                        formData.append('dish1', dish1);

            locale === 'en' ? formData.append('dish2_en', dish2) :
                locale === 'zh' ? formData.append('dish2_zh', dish2) :
                    locale === 'ko' ? formData.append('dish2_ko', dish2) :
                        formData.append('dish2', dish2);

            locale === 'en' ? formData.append('dish3_en', dish3) :
                locale === 'zh' ? formData.append('dish3_zh', dish3) :
                    locale === 'ko' ? formData.append('dish3_ko', dish3) :
                        formData.append('dish3', dish3);

            locale === 'en' ? formData.append('dish4_en', dish4) :
                locale === 'zh' ? formData.append('dish4_zh', dish4) :
                    locale === 'ko' ? formData.append('dish4_ko', dish4) :
                        formData.append('dish4', dish4);

            locale === 'en' ? formData.append('dish5_en', dish5) :
                locale === 'zh' ? formData.append('dish5_zh', dish5) :
                    locale === 'ko' ? formData.append('dish5_ko', dish5) :
                        formData.append('dish5', dish5);

            formData.append('restaurant_name', brandName);
            formData.append('background_duration', duration.toString());
            formData.append('screen_saver_after', screenInterval.toString());
            brandLogo && formData.append('restaurant_logo', brandLogo);
            formData.append('print_data', JSON.stringify(printLines));

            bgImages.forEach((file) => {
                formData.append('restaurant_background[]', file);
            });

            imagePaths.forEach((path) => {
                formData.append('old_restaurant_background[]', path);
            });

            uploader.post('/brand', formData)
                .then(res => {
                    console.log(res)
                    setInfoMessage(t('congratulation'));
                    setErrorMessage('')
                })
                .catch(error => {
                    if (error.response && error.response.status === 422) {
                        console.log(error.response.data);
                        // setErrorMessage(error.response.data.message);
                        setErrorMessage(t('something_went_wrong'));
                        setInfoMessage('');
                    } else {
                        console.error(t('unexpected_error'), error);
                        setErrorMessage(t('something_went_wrong'));
                        setInfoMessage('');
                    }
                })
        } else {
            if (!brandName) setErrorMessage(t('name_field_required'));
            if (!screenInterval) setErrorMessage(t('screen_saver_required'));
            if (!duration) setErrorMessage(t('duration_required'));
            setInfoMessage('');
        }
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4 }}>
                {infoMessage && (
                    <Alert severity="success">{infoMessage}</Alert>
                )}
                {errorMessage && (
                    <Alert severity="error">{errorMessage}</Alert>
                )}
                <Typography sx={{ mt: 2 }} variant="h5" gutterBottom>
                    {t('brand_configuration')}
                </Typography>

                <Grid sx={{ mt: 2 }} container spacing={4}>
                    <Grid size={12}>
                        <TextField
                            label={t('restaurant_name')}
                            sx={{ mt: 2 }}
                            fullWidth
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                        />
                    </Grid>
                    <Grid size={8}>
                        <Typography variant="subtitle1" gutterBottom>
                            {t('restaurant_logo')}
                        </Typography>
                        <BrandLogoUpload logoFile={brandLogo} logoFilePath={LogoPath} handleBrandChange={handleBrandLogoChange} />
                    </Grid>

                    <Grid size={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            {t('restaurant_background')}
                        </Typography>
                        <ImageBulkUploader bgImages={bgImages} imagePaths={imagePaths} handleFilesChange={setBgImages} handleImagePathsChange={setImagePaths} />
                    </Grid>
                    <Grid size={12}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label={t('duration')}
                                    sx={{ mt: 2 }}
                                    fullWidth
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label={t('screen_saver_after')}
                                    sx={{ mt: 2 }}
                                    type="number"
                                    fullWidth
                                    value={screenInterval}
                                    onChange={(e) => setScreenInterval(Number(e.target.value))}
                                />
                            </Grid>
                        </Grid>

                    </Grid>
                    <Grid size={12}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    label={t('popular_1')}
                                    sx={{ mt: 2 }}
                                    fullWidth
                                    value={dish1}
                                    onChange={(e) => setDish1(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    label={t('popular_2')}
                                    sx={{ mt: 2 }}
                                    fullWidth
                                    value={dish2}
                                    onChange={(e) => setDish2(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    label={t('popular_3')}
                                    sx={{ mt: 2 }}
                                    fullWidth
                                    value={dish3}
                                    onChange={(e) => setDish3(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    label={t('popular_4')}
                                    fullWidth
                                    value={dish4}
                                    onChange={(e) => setDish4(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    label={t('popular_5')}
                                    fullWidth
                                    value={dish5}
                                    onChange={(e) => setDish5(e.target.value)}
                                />

                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid size={12}>
                        <PrintableTextEditor
                            value={printLines}
                            onChange={(next) => setPrintLines(next)}
                        />
                    </Grid>
                </Grid>
                <Box mt={4} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        fullWidth
                        sx={{
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            fontSize: '1rem',
                            bgcolor: '#424242', // dark grey
                            color: 'white',
                            boxShadow: 3,
                            '&:hover': {
                                bgcolor: '#333333', // darker on hover
                                boxShadow: 6,
                            },
                        }}
                    >
                        {t('save')}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default BrandConfigPage;
