import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Employee, USER_ROLE } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

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
    row: Employee;
    onBack: () => void;
    onSave: (data: Employee) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>(row?.name);
    const [role, setRole] = useState<string>(row?.role);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        if (name && role) {
            const formData = new FormData();

            formData.append("_method", "put")

            formData.append('name', name);
            formData.append('role', role);

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
                    <TableCell colSpan={3} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>}
            <TableRow>
                <TableCell>
                    <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('name')}
                        size="small"
                        label={t('name')}
                    />
                </TableCell>
                <TableCell>
                    <Select
                        value={role}
                        onChange={(e) => setRole(e.target.value as string)}
                        displayEmpty
                        size="small"
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="" disabled>{t('select')}</MenuItem>
                        {Object.entries(USER_ROLE)?.map(([key, value]) => (
                            <MenuItem value={key}>{value}</MenuItem>
                        ))}
                    </Select>
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
