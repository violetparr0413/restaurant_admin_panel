import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Alert,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { PurchaseHistory } from '@/utils/info';
import { uploader, safeJsonParseArray } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import ImageBulkUploader from '../brand/background';
import { convertDateTime } from '@/utils/client_http_helpers';

type ParamProps = {
    row: PurchaseHistory;
    onBack: () => void;
    onSave: (data: PurchaseHistory) => void;
};

const EditPanel: React.FC<ParamProps> = ({ row, onSave, onBack }) => {

    const { t } = useTranslation('common')

    const [amount, setAmount] = useState<number>(row?.amount);
    // const [unit, setUnit] = useState<string>(row?.inventory?.unit.unit_name);
    const [imagePaths, setImagePaths] = useState(safeJsonParseArray(row?.photo));
    const [images, setImages] = useState<File[]>([]);

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
    }, [locale]);

    const handleSave = () => {
        const formData = new FormData();

        // formData.append("_method", "put")

        formData.append('amount', amount.toString());

        images.forEach((file) => {
            formData.append('photo[]', file);
        });

        imagePaths.forEach((path) => {
            formData.append('old_photo[]', path);
        });

        uploader.post(`/inventory-history/${row?.history_id}`, formData)
            .then(res => {
                onSave(res.data)
            })
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
    };

    return (
        <TableRow>
            <TableCell>
                {row?.inventory?.name}
            </TableCell>
            <TableCell>
                {row?.user?.username}
            </TableCell>
            <TableCell colSpan={6}>
                <Box>
                    <Grid container spacing={1}>
                        {errorMessage && (
                            <Grid size={{ xs: 12 }}>
                                <Alert severity="error">{errorMessage}</Alert>
                            </Grid>)}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                type="number"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                placeholder={t('received_amount')}
                                label={t('received_amount')}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">{row?.inventory?.unit.unit_name}</InputAdornment>,
                                }}
                                inputProps={{ inputMode: 'decimal', step: 'any' }}
                            />

                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12 }}>
                            <ImageBulkUploader bgImages={images} imagePaths={imagePaths} handleFilesChange={setImages} handleImagePathsChange={setImagePaths} />
                        </Grid>
                    </Grid>
                </Box>
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
        </TableRow>
    );
};

export default EditPanel;
