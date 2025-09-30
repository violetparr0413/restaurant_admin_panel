import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Alert,
    Box,
    Grid,
    Table,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Switch
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Inventory, Supplier } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import MiniTable, { MiniTableColumn } from '@/_components/dish/MiniTable';

type ParamProps = {
    onBack: () => void;
};

const MultiPurchasePanel: React.FC<ParamProps> = ({ onBack }) => {

    const { t } = useTranslation('common')

    const [sendMode, setSendMode] = useState<boolean>(true);

    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
    }, [locale]);

    const initCols: MiniTableColumn[] = [
        {
            key: "supplier_id", label: t('supplier'), width: "20ch", input: {
                type: "select",
                options: [],
                placeholder: t('select')
            }
        },
        {
            key: "inventory_id", label: t('ingredient'), width: "20ch", input: {
                type: "select",
                required: true,
                options: [],
                placeholder: t('select')
            }
        },
        {
            key: "quantity", label: t('quantity'), width: "10ch", input: {
                type: "number",
                required: true,
                placeholder: "0",
            }
        }
    ]

    type SubRow = { supplier_id: number, inventory_id: number; quantity: number }

    const [cols, setCols] = useState<MiniTableColumn[]>(initCols);
    const [rows, setRows] = useState<SubRow[]>([]);

    const getInventories = () => {
        api.get('/inventory') // your server endpoint
            .then(res => {
                initCols[1].input.options = res.data.map((inv: Inventory) => ({
                    label: `${inv.name} (${inv.unit?.unit_name})`,
                    value: inv.inventory_id
                }))
                setCols(initCols)
            }).catch(error => {
                console.error(t('unexpected_error'), error);
            });
    }

    const getSuppliers = () => {
        api.get('/supplier') // your server endpoint
            .then(res => {
                initCols[0].input.options = res.data.map((sup: Supplier) => ({
                    label: sup.supplier_name,
                    value: sup.supplier_id
                }))
                setCols(initCols)
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    React.useEffect(() => {
        getInventories()
        getSuppliers()
    }, []);

    const handleSave = () => {
        const formData = new FormData();

        formData.append('employee_id', '0')
        rows && formData.append('items', JSON.stringify(rows));
        (sendMode !== null) && formData.append('by_email', sendMode.toString());

        api.post(`/purchase-inventory`, formData)
            .then(res => {
                onBack()
            })
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

    };

    function handleRowsChange(newRows: SubRow[]) {
        setRows(newRows.map((row) => ({
            supplier_id: row.supplier_id,
            inventory_id: row.inventory_id,
            quantity: row.quantity,
        })))
    }

    return (
        <TableRow>
            <TableCell colSpan={4}>
                <Box p={1}>
                    <Grid container spacing={1}>
                        {errorMessage && (
                            <Grid size={{ xs: 12 }}>
                                <Alert severity="error">{errorMessage}</Alert>
                            </Grid>)}
                        <Grid size={{ xs: 12, sm: 9 }}>
                            <MiniTable
                                columns={cols}
                                value={rows}
                                onChange={handleRowsChange}
                                dense
                                maxHeight={128}
                                addLabel="Add detail"
                                showIndex={false}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControl component="fieldset" variant="standard">
                                <FormControlLabel
                                    control={
                                        <Switch checked={sendMode} onChange={(e) => setSendMode(e.target.checked)} name="gilad" />
                                    }
                                    sx={{ mt: 1, ml: 1 }}
                                    label={t('send_by_email')}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
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
    );
};

export default MultiPurchasePanel;
