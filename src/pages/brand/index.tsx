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

    const [LogoPath, setLogoPath] = useState('');
    const [imagePaths, setImagePaths] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

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
                }
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
    }, [refresh]);

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
            const formData = new FormData();

            formData.append('restaurant_name', brandName);
            formData.append('background_duration', duration.toString());
            formData.append('screen_saver_after', screenInterval.toString());
            brandLogo && formData.append('restaurant_logo', brandLogo);

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
