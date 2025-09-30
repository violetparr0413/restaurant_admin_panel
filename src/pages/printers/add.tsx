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
import { Printer } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';

type AddPanelProps = {
    exist: boolean;
    onBack: () => void;
    onSave: (data: Printer) => void;
};

const AddPanel: React.FC<AddPanelProps> = ({ exist, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const PRINTER_POSITION = {
        'COUNTER': t('counter'),
        "KITCHEN": t('kitchen'),
    }

    const [name, setName] = useState<string>('');
    const [ipAddress, setIpAddress] = useState<string>('');
    const [port, setPort] = useState<string>('');
    const [position, setPosition] = useState<string>('');

    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        if (name && ipAddress && port && position) {
            const formData = new FormData();

            formData.append('printer_name', name);
            formData.append('ip_address', ipAddress);
            formData.append('port', port);
            formData.append('position', position);

            api.post('/printer', formData)
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('name')}
                        label={t('name')}
                    />
                </TableCell>
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
                                // <MenuItem value={key} disabled={exist ? key === 'COUNTER' ? true : false : false}>{value}</MenuItem>
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

export default AddPanel;
