import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Select,
    MenuItem,
    Alert,
    Box,
    FormControl,
    FormControlLabel,
    Switch,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Employee } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import PasswordInput from '@/_components/PasswordInput';

type EditPanelProps = {
    row: Employee;
    onBack: () => void;
    onSave: (data: Employee) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const USER_ROLE = {
        'ADMIN': t('admin'),
        'WAITSTAFF': t('waitstuff'),
        'COUNTER': t('counter')
    }

    const [name, setName] = useState<string>(row?.name);
    const [password, setPassword] = useState<string>('');
    const [role, setRole] = useState<string>(row?.role);
    const [allowPurchase, setAllowPurchase] = useState<boolean>(row?.purchase_allow ? true : false);
    const [allowReceive, setAllowReceive] = useState<boolean>(row?.receive_allow ? true : false);
    const [allowUpdateStock, setAllowUpdateStock] = useState<boolean>(row?.update_stock_allow ? true : false);
    const [allowReport, setAllowReport] = useState<boolean>(row?.report_allow ? true : false);
    const [allowEditAttributes, setAllowEditAttributes] = useState<boolean>(row?.dish_allow ? true : false);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        if (name && role) {
            const formData = new FormData();

            formData.append("_method", "put")

            formData.append('name', name);
            password && formData.append('password', password);
            formData.append('role', role);
            (allowPurchase !== null) && formData.append('purchase_allow', allowPurchase ? '1' : '0');
            (allowReceive !== null) && formData.append('receive_allow', allowReceive ? '1' : '0');
            (allowUpdateStock !== null) && formData.append('update_stock_allow', allowUpdateStock ? '1' : '0');
            (role === 'COUNTER' && allowReport !== null) && formData.append('report_allow', allowReport ? '1' : '0');
            (role === 'WAITSTAFF' && allowEditAttributes !== null) && formData.append('dish_allow', allowEditAttributes ? '1' : '0');

            api.post(`/employee/${row?.employee_id}`, formData)
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
        }
    };

    return (
        <>
            {errorMessage &&
                <TableRow>
                    <TableCell colSpan={5} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>}
            <TableRow>
                <TableCell style={{ padding: 8 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('name')}
                            fullWidth
                            required
                            label={t('name')}
                        />
                        <PasswordInput password={password} setPassword={setPassword} required={true} />
                    </Box>
                </TableCell>
                <TableCell style={{ padding: 8 }}>
                    <Select
                        fullWidth
                        value={role}
                        onChange={(e) => setRole(e.target.value as string)}
                        displayEmpty
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="" disabled>{t('select')}</MenuItem>
                        {Object.entries(USER_ROLE)?.map(([key, value]) => (
                            <MenuItem value={key}>{value}</MenuItem>
                        ))}
                    </Select>
                </TableCell>
                <TableCell style={{ padding: 8 }}>
                    <FormControl component="fieldset" variant="standard">
                        <FormControlLabel
                            control={
                                <Switch checked={allowUpdateStock} onChange={(e) => setAllowUpdateStock(e.target.checked)} name="gilad" />
                            }
                            sx={{ mt: 1 }}
                            label={''}
                        />
                    </FormControl>
                </TableCell>
                <TableCell style={{ padding: 8 }}>
                    <FormControl component="fieldset" variant="standard">
                        <FormControlLabel
                            control={
                                <Switch checked={allowPurchase} onChange={(e) => setAllowPurchase(e.target.checked)} name="gilad" />
                            }
                            sx={{ mt: 1 }}
                            label={''}
                        />
                    </FormControl>
                </TableCell>
                <TableCell style={{ padding: 8 }}>
                    <FormControl component="fieldset" variant="standard">
                        <FormControlLabel
                            control={
                                <Switch checked={allowReceive} onChange={(e) => setAllowReceive(e.target.checked)} name="gilad" />
                            }
                            sx={{ mt: 1 }}
                            label={''}
                        />
                    </FormControl>
                </TableCell>
                <TableCell style={{ padding: 8 }}>
                    {role === 'COUNTER' && (<FormControl component="fieldset" variant="standard">
                        <FormControlLabel
                            control={
                                <Switch checked={allowReport} onChange={(e) => setAllowReport(e.target.checked)} name="gilad" />
                            }
                            sx={{ mt: 1 }}
                            label={''}
                        />
                    </FormControl>)}
                </TableCell>
                <TableCell style={{ padding: 8 }}>
                    {role === 'WAITSTAFF' && (<FormControl component="fieldset" variant="standard">
                        <FormControlLabel
                            control={
                                <Switch checked={allowEditAttributes} onChange={(e) => setAllowEditAttributes(e.target.checked)} name="gilad" />
                            }
                            sx={{ mt: 1 }}
                            label={''}
                        />
                    </FormControl>)}
                </TableCell>
                <TableCell align="right">
                    {convertDateTime(row?.created_at)}
                </TableCell>
                <TableCell>
                    <IconButton
                        aria-label="save"
                        color="primary"
                        onClick={handleSave}
                        disabled={!row?.employee_id}
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
