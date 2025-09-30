import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Select,
    MenuItem,
    Alert,
    FormControl,
    InputLabel,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { User } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';
import Box from '@mui/material/Box';

import { useTranslation } from 'next-i18next';
import PasswordInput from '@/_components/PasswordInput';

type EditPanelProps = {
    row: User;
    onBack: () => void;
    onSave: (data: User) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const USER_ROLE = {
        'ADMIN': t('admin'),
        'WAITSTAFF': t('waitstuff'),
        'COUNTER': t('counter'),
        'TABLE': t('table')
    }

    const [name, setName] = useState<string>(row?.username);
    const [password, setPassword] = useState<string>('');
    const [role, setRole] = useState<string>(row?.user_role);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        if (name && role) {
            const formData = new FormData();

            formData.append("_method", "put")

            formData.append('username', name);
            password && formData.append('password', password);
            formData.append('user_role', role);

            api.post(`/users/${row?.user_id}`, formData)
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
            if (!role) setErrorMessage(t('role_field_required'));
            if (!password) setErrorMessage(t('password_field_required'));
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
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('name')}
                            fullWidth
                            label={t('name')}
                        />
                        <PasswordInput password={password} setPassword={setPassword} required={true} />
                    </Box>
                </TableCell>
                <TableCell>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>{t('role')}</InputLabel>
                        <Select
                            value={role}
                            onChange={(e) => setRole(e.target.value as string)}
                            displayEmpty
                            label={t('role')}
                        >
                            <MenuItem value="" disabled>{t('select')}</MenuItem>
                            {Object.entries(USER_ROLE)?.map(([key, value]) => (
                                <MenuItem value={key}>{value}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </TableCell>
                <TableCell align="right">
                    {convertDateTime(row?.created_at)}
                </TableCell>
                <TableCell>
                    <IconButton
                        aria-label="save"
                        color="primary"
                        onClick={handleSave}
                        disabled={!row?.user_id}
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
