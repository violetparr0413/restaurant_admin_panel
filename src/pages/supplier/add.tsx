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
import { Supplier } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type AddPanelProps = {
    onBack: () => void;
    onSave: (data: Supplier) => void;
};

const AddPanel: React.FC<AddPanelProps> = ({ onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [fax, setFax] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [note, setNote] = useState<string>('');

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
    }, [locale]);

    const handleSave = () => {
        if (name && phone && fax) {
            const formData = new FormData();

            formData.append('supplier_name', name);
            formData.append('phone', phone);
            formData.append('fax', fax);
            formData.append('email', email);
            formData.append('note', note);
            // locale === 'en' ? formData.append('unit_en_name', name) :
            //     locale === 'zh' ? formData.append('unit_zh_name', name) :
            //         locale === 'ko' ? formData.append('unit_ko_name', name) :
            //             formData.append('unit_name', name);

            // (locale !== 'ja') && formData.append('unit_name', name);

            api.post('/supplier', formData)
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
        } else if(!name) {
            setErrorMessage(t('name_field_required'));
        } else if(!phone) {
            setErrorMessage(t('phone_field_required'));
        } else if(!fax) {
            setErrorMessage(t('fax_field_required'));
        } else if (!email) {
            setErrorMessage(t('email_field_required'));
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
                <TableCell>
                    <TextField
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('name')}
                        label={t('name')}
                    />
                </TableCell>
                <TableCell>
                    <TextField
                        fullWidth
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t('phone')}
                        label={t('phone')}
                    />
                </TableCell>
                <TableCell>
                    <TextField
                        fullWidth
                        value={fax}
                        onChange={(e) => setFax(e.target.value)}
                        placeholder={t('fax')}
                        label={t('fax')}
                    />
                </TableCell>
                <TableCell>
                    <TextField
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('email')}
                        label={t('email')}
                    />
                </TableCell>
                <TableCell>
                    <TextField
                        fullWidth
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('note')}
                        label={t('note')}
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
