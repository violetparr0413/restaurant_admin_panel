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
import { Employee } from '@/utils/info';
import api, { convertDateTime } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';

type EditPanelProps = {
    row: Employee;
    onBack: () => void;
    onSave: (data: Employee) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>(row?.name);
    const [numOfPeople, setNumOfPeople] = useState<number>(row?.num_of_people || 0);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        if (name) {
            const formData = new FormData();

            formData.append("_method", "put")

            formData.append('name', name);
            formData.append('table_order', row?.table_order.toString());
            formData.append('num_of_people', numOfPeople.toString());
            formData.append('role', 'TABLE');

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
            setErrorMessage(t('name_field_required'));
        }
    };

    return (
        <>
            {errorMessage && (<TableRow>
                <TableCell colSpan={2} sx={{ border: 0 }}>
                    <Alert severity="error">{errorMessage}</Alert>
                </TableCell>
            </TableRow>)}
            <TableRow>
                <TableCell>
                </TableCell>
                <TableCell style={{ padding: 8 }}>
                    <TextField
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('name')}
                        label={t('name')}
                    />
                </TableCell>
                <TableCell style={{ padding: 8 }}>
                    <TextField
                        fullWidth
                        value={numOfPeople}
                        onChange={(e) => setNumOfPeople(Number(e.target.value))}
                        placeholder={t('number_of_people')}
                        label={t('number_of_people')}
                        type="number"
                    />
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
