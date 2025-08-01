import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Dish, Order, Employee, ORDER_STATUS } from '@/utils/info';
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
    row: Order,
    onBack: () => void;
    onSave: (data: Order) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const [dish, setDish] = useState<number>(row?.dish_id);

    const [employee, setEmployee] = useState<number>(row?.table_number);
    const [orderQty, setOrderQty] = useState<number>(row?.order_qty);
    const [orderStatus, setOrderStatus] = useState<string>(row?.order_status);

    const [dishes, setDishes] = useState<Dish[] | null>(null);
    const [employees, setEmployees] = useState<Employee[] | null>(null);

    const [errorMessage, setErrorMessage] = useState('');

    const getDishData = () => {
        api.get('/dish') // your server endpoint
            .then(res => {
                setDishes(res.data)
            })
            .catch(error => {
                console.error(t('unexpected_error'), error);
                setErrorMessage(t('something_went_wrong'));
            });
    }

    const getEmployeeData = () => {
        api.get('/employee') // your server endpoint
            .then(res => {
                setEmployees(res.data)
            })
            .catch(error => {
                console.error(t('unexpected_error'), error);
                setErrorMessage(t('something_went_wrong'));
            });
    }

    React.useEffect(() => {
        getDishData()
        getEmployeeData()
    }, []);

    const handleSave = () => {
        if (dish && employee && orderStatus) {
            const formData = new FormData();

            formData.append("_method", "put")

            formData.append('dish_id', dish.toString());
            formData.append('employee_id', employee.toString());
            formData.append('order_qty', orderQty.toString());
            formData.append('order_status', orderStatus);

            api.post(`/order/${row?.order_id}`, formData)
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
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>{t('dish')}</InputLabel>
                        <Select
                            value={dish}
                            onChange={(e) => {
                                setDish(Number(e.target.value))
                            }}
                            displayEmpty
                            label={t('dish')}
                        >
                            <MenuItem value={0}>{t('select')}</MenuItem>
                            {dishes?.map((x) => (
                                <MenuItem value={x?.dish_id}>{x.dish_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </TableCell>
                <TableCell>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>{t('employee')}</InputLabel>
                        <Select
                            value={employee}
                            onChange={(e) => {
                                setEmployee(Number(e.target.value))
                            }}
                            displayEmpty
                            label={t('employee')}
                        >
                            <MenuItem value={0}>{t('select')}</MenuItem>
                            {employees?.map((x) => (
                                <MenuItem value={x.employee_id}>{x.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </TableCell>
                <TableCell>
                    <TextField
                        fullWidth
                        value={orderQty}
                        onChange={(e) => setOrderQty(Number(e.target.value))}
                        label={t('order_quantity')}
                        placeholder={t('order_quantity')}
                    />
                </TableCell>
                <TableCell>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>{t('status')}</InputLabel>
                        <Select
                            value={orderStatus}
                            onChange={(e) => setOrderStatus(e.target.value as string)}
                            displayEmpty
                            label={t('status')}
                        >
                            <MenuItem value="" disabled>{t('select')}</MenuItem>
                            {Object.entries(ORDER_STATUS)?.map(([key, value]) => (
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
