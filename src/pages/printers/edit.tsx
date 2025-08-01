import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Alert,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Printer, PRINTER_POSITION } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

type EditPanelProps = {
    row: Printer,
    onBack: () => void;
    onSave: (data: Printer) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [ipAddress, setIpAddress] = useState<string>(row?.ip_address);
    const [port, setPort] = useState<string>(row?.port);
    const [position, setPosition] = useState<string>(row?.position);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        if (ipAddress && port && position) {
            const formData = new FormData();

            formData.append("_method", "put")

            formData.append('ip_address', ipAddress);
            formData.append('port', port);
            formData.append('position', position);

            api.post(`/printer/${row?.printer_id}`, formData)
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
        } else if (!ipAddress) {
            setErrorMessage(t('ipaddress_field_required'));
        } else if (!port) {
            setErrorMessage(t('port_field_required'));
        } else if (!position) {
            setErrorMessage(t('position_field_required'));
        }
    };

    return (
        <>
            {errorMessage && (
                <TableRow>
                    <TableCell colSpan={4} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>)}
            <TableRow>
                <TableCell>
                    <TextField
                        fullWidth
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        placeholder={t('ip_address')}
                        label={t('ip_address')}
                    />
                </TableCell>
                <TableCell>
                    <TextField
                        fullWidth
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder={t('port')}
                        label={t('port')}
                    />
                </TableCell>
                <TableCell>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>{t('position')}</InputLabel>
                        <Select
                            value={position}
                            onChange={(e) => setPosition(e.target.value as string)}
                            label={t('position')}
                        >
                            <MenuItem value="" disabled>{t('select')}</MenuItem>
                            {Object.entries(PRINTER_POSITION)?.map(([key, value]) => (
                                <MenuItem value={key}>{value}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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

export default EditPanel;
