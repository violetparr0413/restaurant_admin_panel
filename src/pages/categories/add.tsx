import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { uploader } from '@/utils/http_helper';
import { Category, Printer, TaxRate } from '@/utils/info';

import { useTranslation } from 'next-i18next';
import ImageUploader from '@/_components/ImageUploader';
import { useRouter } from 'next/router';
import PrinterMultiSelect from '@/_components/PrinterMultiSelect';

type AddPanelProps = {
    parent: number,
    onBack: () => void;
    onSave: (data: Category) => void;
};

const AddPanel: React.FC<AddPanelProps> = ({ parent, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>('');
    const [image, setImage] = useState<File | null>(null);
    const [taxRateId, setTaxRateId] = useState<number>(0);
    const [printerIds, setPrinterIds] = useState<number[]>([]);

    const [taxRates, setTaxRates] = useState<TaxRate[] | null>(null);
    const [printers, setPrinters] = useState<Printer[] | null>(null);

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    const getTaxRates = () => {
        uploader.get('/tax-rate') // your server endpoint
            .then(res => {
                setTaxRates(res.data)
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    const getPrinters = () => {
        uploader.get('/printer') // your server endpoint
            .then(res => {
                setPrinters(res.data.filter(x => x.position !== 'COUNTER'))
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    React.useEffect(() => {
        if (!parent) {
            getTaxRates()
        }
        getPrinters()
    }, [locale]);

    const handleSave = () => {
        if (name) {
            const formData = new FormData();

            locale === 'en' ? formData.append('category_en_name', name) :
                locale === 'zh' ? formData.append('category_zh_name', name) :
                    locale === 'ko' ? formData.append('category_ko_name', name) :
                        formData.append('category_name', name);

            (locale !== 'ja') && formData.append('category_name', name);

            image && formData.append('category_image', image);
            !parent && taxRateId && formData.append('tax_rate_id', taxRateId.toString());
            printerIds && formData.append('printer_ids', JSON.stringify(printerIds));
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
        }
    };

    return (
        <>
            {errorMessage && (
                <TableRow>
                    <TableCell colSpan={7} sx={{ border: 0 }}>
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
                {!parent && (
                    <TableCell>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>{t('tax_rates')}</InputLabel>
                            <Select
                                required
                                value={taxRateId}
                                onChange={(e) => {
                                    setTaxRateId(Number(e.target.value))
                                }}
                                label={t('tax_rates')}
                            >
                                <MenuItem value={0} disabled>{t('select')}</MenuItem>
                                {taxRates?.map((x) => (
                                    <MenuItem value={x.tax_rate_id} key={x.tax_rate_id}>
                                        {x.tax_rate_name} ({x.tax_rate_value}%)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </TableCell>
                )}
                <TableCell>
                    <PrinterMultiSelect
                        printers={printers}
                        value={printerIds}
                        onChange={setPrinterIds}
                        label={t('printer')}
                        placeholder={t('select')}
                    />
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
