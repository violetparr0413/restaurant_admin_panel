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
import { InventoryUnit } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type EditPanelProps = {
    row: InventoryUnit,
    onBack: () => void;
    onSave: (data: InventoryUnit) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>(row?.unit_name)
    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    // React.useEffect(() => {
    //     const value = locale === 'en' ? row?.unit_en_name :
    //         locale === 'zh' ? row?.unit_zh_name :
    //             locale === 'ko' ? row?.unit_ko_name :
    //                 row?.unit_name
    //     setName(value ? value : '')
    // }, [locale]);

    const handleSave = () => {
        if (name) {
            const formData = new FormData();

            formData.append("_method", "put")

            formData.append('unit_name', name);

            // locale === 'en' ? formData.append('unit_en_name', name) :
            //     locale === 'zh' ? formData.append('unit_zh_name', name) :
            //         locale === 'ko' ? formData.append('unit_ko_name', name) :
            //             formData.append('unit_name', name);

            api.post(`/unit/${row?.unit_id}`, formData)
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
                    <TableCell colSpan={2} sx={{ border: 0 }}>
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
                <TableCell align="right">{convertDateTime(row?.created_at)}</TableCell>
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

export default EditPanel;
