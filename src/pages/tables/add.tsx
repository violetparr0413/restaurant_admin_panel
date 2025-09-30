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
import { Employee } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';

type AddPanelProps = {
    onBack: () => void;
    onSave: (data: Employee) => void;
};

const AddPanel: React.FC<AddPanelProps> = ({ onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [name, setName] = useState<string>('');
    const [numOfPeople, setNumOfPeople] = useState<number>(0);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        if (name) {
            const formData = new FormData();

            formData.append('name', name);
            formData.append('num_of_people', numOfPeople.toString());
            formData.append('role', 'TABLE');

            api.post('/employee', formData)
                .then(res => onSave(res.data.employee))
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
                    <TableCell colSpan={3} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>)}
            <TableRow>
                <TableCell>
                </TableCell>
                <TableCell>
                    <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('name')}
                        label={t('name')}
                        size="small"
                    />
                </TableCell>
                <TableCell>
                    <TextField
                        value={numOfPeople}
                        onChange={(e) => setNumOfPeople(Number(e.target.value))}
                        placeholder={t('number_of_people')}
                        label={t('number_of_people')}
                        type="number"
                        size="small"
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
