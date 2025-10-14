import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import EditIcon from '@mui/icons-material/Edit';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import DeleteIcon from '@mui/icons-material/Delete';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

import { Inventory } from '../../utils/info';
import AddPanel from './add';
import EditPanel from './edit';
import DeletePanel from './delete';

import { useTranslation } from 'next-i18next';
import api, { convertDateTimeMin, getCurrentTimeMin } from '@/utils/http_helper';
import { useRouter } from 'next/router';
import PurchasePanel from './purchase';
import { FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TableSortLabel, TextField, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface TablePaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
        event: React.MouseEvent<HTMLButtonElement>,
        newPage: number,
    ) => void;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        // keep label text white (default + hover + active)
        '& .MuiTableSortLabel-root': { color: theme.palette.common.white },
        '& .MuiTableSortLabel-root:hover': { color: theme.palette.grey[300] },
        '& .MuiTableSortLabel-root.Mui-active': { color: theme.palette.common.white },
        // keep the sort arrow white (active & inactive)
        '& .MuiTableSortLabel-icon': { color: `${theme.palette.common.white} !important` },
        '& .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon': {
            color: `${theme.palette.common.white} !important`,
        },
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}

interface TableProps {
    time: string;
    rows: Inventory[];
    info: (value: string) => void;
    error: (value: string) => void;
    setIsShow: (value: boolean) => void;
    filterSupplierId: number;
    setFilterSupplierId: (value: number) => void;
}

type ItemDraft = {
    inventory_id: number;
    quantity: number;
    supplier_id: number;
};

type ItemMap = Record<number, ItemDraft>;

const buildInitial = (rows: Array<ItemDraft>) => {
    const m: ItemMap = {};
    for (const r of rows) m[r.inventory_id] = { ...r };
    return m;
};

export default function Page({ time, rows, info, error, setIsShow, filterSupplierId, setFilterSupplierId }: TableProps) {
    const { t } = useTranslation('common')

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [rowsData, setRows] = React.useState(rows);
    const [view, setView] = React.useState('hide'); // can be 'hide', 'add', 'edit', delete
    const [editItem, setEditItem] = React.useState<Inventory | null>(null);
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
    const [sendMode, setSendMode] = React.useState<boolean>(true);

    const initialItemsRef = React.useRef<ItemMap>({});
    const [items, setItems] = React.useState<ItemMap>({});

    const updateItem = (id: number, patch: Partial<ItemDraft>) => {
        setItems(prev => ({
            ...prev,
            [id]: { ...prev[id], ...patch, inventory_id: id },
        }));
    };
    const resetAll = () => setItems({ ...initialItemsRef.current });

    const [maxHeight, setMaxHeight] = React.useState(0)

    React.useEffect(() => {
        setMaxHeight(document.documentElement.clientHeight - 120);
    }, []);

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
        setRows(rows);
        setItems(prev => {
            const next: ItemMap = { ...prev };
            // add new rows that don't exist yet
            rows.forEach(r => {
                if (!next[r.inventory_id]) {
                    next[r.inventory_id] = {
                        inventory_id: r.inventory_id,
                        quantity: 0,
                        supplier_id: 0,
                    };
                }
            });
            // prune any removed rows
            Object.keys(next).forEach(id => {
                if (!rows.some(r => r.inventory_id === Number(id))) {
                    delete next[Number(id)];
                }
            });
            return next;
        });
    }, [rows]);

    const getSuppliers = () => {
        api.get('/supplier') // your server endpoint
            .then(res => {
                setSuppliers(res.data)
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                }
            });
    }

    React.useEffect(() => {
        getSuppliers()
    }, []);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rowsData?.length) : 0;

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleBackClick = () => {
        setView('hide');
        setEditItem(null);
        resetAll();
        handlePurchaseRefresh()
        setIsShow(false)
        setFilterSupplierId(0)
    };

    const handleSaveClick = (data: Inventory) => {
        rowsData?.find(x => x.inventory_id === data.inventory_id) ?
            setRows(rowsData => rowsData?.map(x => x.inventory_id === data.inventory_id ? data : x))
            : setRows([...rowsData, data])
        setView('hide');
    };

    const handleAddClick = () => {
        setView('add');
    };

    const handleEditClick = (item: Inventory) => {
        setEditItem(item);
        setView('edit');
    };

    const handleDeleteClick = (item: Inventory) => {
        setEditItem(item);
        setView('delete');
    };

    const handlePurchaseClick = () => {
        setView('multi');
        setIsShow(true)
    };

    const handleDeleteReq = (data: Inventory) => {
        const index = rowsData?.indexOf(data)
        if (index !== -1) rowsData?.splice(index, 1);
        setRows(rowsData?.filter(row => row !== data))
    }

    const handlePurchaseRefresh = () => {
        const today = getCurrentTimeMin();

        api.get('/inventory', {
            params: {
                time: convertDateTimeMin(today)
            }
        })
            .then(res => setRows(res.data))
            .catch(error => {
                console.error(t('unexpected_error'), error);
                error(t('something_went_wrong'))
            });
    }

    const handlePurchase = () => {
        info('')
        const formData = new FormData();

        formData.append('employee_id', '0')
        items && formData.append('items', JSON.stringify(Object.values(items).filter(
            x => x.quantity > 0 && x.supplier_id !== 0
        )));
        (sendMode !== null) && formData.append('by_email', sendMode.toString());

        api.post(`/purchase-inventory`, formData)
            .then(res => {
                info(t('purchase_succeed'))
                handleBackClick()
            })
            .catch(error => {
                if (error.response && error.response.status === 422) {
                    // Validation error from server
                    console.log(error.response.data);
                    error(t('something_went_wrong'))
                } else {
                    // Other errors
                    console.error(t('unexpected_error'), error);
                    error(t('something_went_wrong'))
                }
            })

    };

    // (optional) type for suppliers if you don't already have it
    type Supplier = { supplier_id: number; supplier_name: string };

    // ---------- state for sorting ----------
    const [orderBy, setOrderBy] = React.useState<'supplier' | null>(null);
    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');

    const handleSortBySupplier = () => {
        setOrder(prev => (orderBy === 'supplier' && prev === 'asc' ? 'desc' : 'asc'));
        setOrderBy('supplier');
    };

    // ---------- helper maps ----------
    const supplierNameById = React.useMemo(() => {
        const m = new Map<number, string>();
        suppliers?.forEach(s => m.set(s.supplier_id, s.supplier_name));
        return m;
    }, [suppliers]);

    // Which supplier to use for a row: draft (multi) -> row -> none
    const getRowSupplierId = (row: any) => {
        if (view === 'multi') {
            const d = items[row?.inventory_id];
            if (d?.supplier_id) return d.supplier_id;
        }
        return row?.supplier_id ?? 0;
    };

    // ---------- sorted rows (before pagination) ----------
    const sortedRowsData = React.useMemo(() => {
        const data = rowsData ? [...rowsData] : [];
        if (orderBy !== 'supplier') return data;

        return data.sort((a, b) => {
            const aid = getRowSupplierId(a);
            const bid = getRowSupplierId(b);

            const an = (supplierNameById.get(aid) ?? '').toLowerCase();
            const bn = (supplierNameById.get(bid) ?? '').toLowerCase();

            const aEmpty = an === '';
            const bEmpty = bn === '';

            // push "no supplier" to the bottom on ASC, top on DESC
            if (aEmpty !== bEmpty) return order === 'asc' ? (aEmpty ? 1 : -1) : (aEmpty ? -1 : 1);

            if (an !== bn) {
                const cmp = an.localeCompare(bn);
                return order === 'asc' ? cmp : -cmp;
            }
            // tie-breaker by item name so sort is stable/readable
            const aName = (a?.name ?? '').toLowerCase();
            const bName = (b?.name ?? '').toLowerCase();
            return aName.localeCompare(bName);
        });
    }, [rowsData, orderBy, order, items, view, supplierNameById]);

    const filteredRowsData = React.useMemo(() => {
        if (!sortedRowsData) return [];
        if (filterSupplierId === 0) return sortedRowsData; // 0 = "All"
        return sortedRowsData.filter(r => {
            const effectiveSupplier =
                items[r.inventory_id]?.supplier_id ?? 0;
            return effectiveSupplier === filterSupplierId;
        });
    }, [sortedRowsData, items, filterSupplierId]);

    // 2) Paginate the *filtered* rows
    const pagedRows = React.useMemo(() => {
        if (rowsPerPage > 0) {
            const start = page * rowsPerPage;
            return filteredRowsData.slice(start, start + rowsPerPage);
        }
        return filteredRowsData;
    }, [filteredRowsData, page, rowsPerPage]);

    return (
        <TableContainer component={Paper} sx={{ maxHeight: maxHeight }}>
            <Table sx={{ tableLayout: 'fixed' }} stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell sx={{ width: 160 }}>{t('name')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 160 }}>{t('actual_stock')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 160 }}>{t('requested')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 160 }}>{t('unit')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 160 }}>{view === 'multi' && t('quantity')}</StyledTableCell>
                        {view === 'multi' ? (
                            <StyledTableCell sx={{ width: 160 }}>
                                <TableSortLabel
                                    active={orderBy === 'supplier'}
                                    direction={orderBy === 'supplier' ? order : 'asc'}
                                    onClick={handleSortBySupplier}
                                >
                                    {t('supplier')}
                                </TableSortLabel>
                            </StyledTableCell>
                        ) : (
                            <StyledTableCell sx={{ width: 160 }}>{/* empty in non-multi */}</StyledTableCell>
                        )}
                        {view === 'multi' ? (
                            <StyledTableCell sx={{ width: 280 }}>
                                <FormControl component="fieldset" variant="standard">
                                    <FormControlLabel
                                        control={
                                            <Switch checked={sendMode} onChange={(e) => setSendMode(e.target.checked)} name="gilad" />
                                        }
                                        label={t('send_by_email')}
                                    />
                                </FormControl>
                                <IconButton
                                    aria-label="save"
                                    color="primary"
                                    onClick={handlePurchase}
                                >
                                    <SaveIcon />
                                </IconButton>
                                <IconButton
                                    aria-label="save"
                                    color="secondary"
                                    onClick={handleBackClick}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                            </StyledTableCell>
                        ) : (
                            <StyledTableCell sx={{ width: 200 }}>
                                <IconButton aria-label="add"
                                    color="info"
                                    onClick={handleAddClick}
                                >
                                    <PostAddIcon />
                                </IconButton>
                                <Tooltip title={t('multiple_purchase')}>
                                    <IconButton
                                        aria-label="multiple_purchase"
                                        color="success"
                                        onClick={handlePurchaseClick}
                                        sx={{ mr: 1 }}
                                    >
                                        <PointOfSaleIcon />
                                    </IconButton>
                                </Tooltip>
                            </StyledTableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {view === 'add' && (
                        <AddPanel time={time} onBack={handleBackClick} onSave={handleSaveClick} />
                    )}
                    {pagedRows?.map((row) => {
                        const draft = items[row?.inventory_id] ?? {
                            inventory_id: row?.inventory_id,
                            quantity: 0,
                            supplier_id: 0,
                        };
                        return (
                            view === 'edit' && editItem?.inventory_id === row?.inventory_id ? (
                                <EditPanel
                                    time={time}
                                    row={row}
                                    onBack={handleBackClick}
                                    onSave={handleSaveClick}
                                />
                            ) : view === 'delete' && editItem?.inventory_id === row?.inventory_id ? (
                                <DeletePanel
                                    row={row}
                                    onBack={handleBackClick}
                                    onDelete={handleDeleteReq}
                                />
                            ) : view === 'purchase' && editItem?.inventory_id === row?.inventory_id ? (
                                <PurchasePanel
                                    row={row}
                                    onBack={handleBackClick}
                                />
                            ) : (
                                <TableRow key={row?.inventory_id}>
                                    <TableCell component="th" scope="row">
                                        {row?.name}
                                        {/* {locale === 'en' ? row?.inventory_en_name :
                                        locale === 'zh' ? row?.inventory_zh_name :
                                            locale === 'ko' ? row?.inventory_ko_name :
                                                row?.inventory_name} */}
                                    </TableCell>
                                    <TableCell>
                                        {row?.current_stock || 0}
                                    </TableCell>
                                    <TableCell>
                                        {row?.request_amount || 0}
                                    </TableCell>
                                    <TableCell>
                                        {row?.unit.unit_name}
                                    </TableCell>
                                    {view === 'multi' ? (
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                value={draft.quantity}
                                                type="number"
                                                onChange={(e) =>
                                                    updateItem(row.inventory_id, {
                                                        quantity: Number(e.target.value) || 0,
                                                    })
                                                }
                                                placeholder={t('quantity')}
                                                label={t('quantity')}
                                            />
                                        </TableCell>
                                    ) : (<TableCell></TableCell>)}
                                    {view === 'multi' ? (
                                        <TableCell>
                                            <FormControl fullWidth variant="outlined">
                                                <InputLabel>{t('supplier')}</InputLabel>
                                                <Select
                                                    required
                                                    value={draft.supplier_id}
                                                    onChange={e =>
                                                        updateItem(row.inventory_id, {
                                                            supplier_id: Number(e.target.value),
                                                        })
                                                    }
                                                    label={t('supplier')}
                                                >
                                                    <MenuItem value={0}>{t('select')}</MenuItem>
                                                    {suppliers?.map((x) => (
                                                        <MenuItem key={x.supplier_id} value={x.supplier_id}>
                                                            {x.supplier_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    ) : (<TableCell></TableCell>)}
                                    {view === 'multi' ? (<TableCell></TableCell>) : (<><TableCell style={{ width: 160 }}>
                                        <IconButton
                                            aria-label="edit"
                                            color="primary"
                                            onClick={() => handleEditClick(row)}
                                            disabled={!row?.inventory_id}
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        {/* <Tooltip title={t('purchase')}>
                                        <IconButton
                                            aria-label="purchase"
                                            color="success"
                                            onClick={() => handlePurchaseClick(row)}
                                            disabled={!row?.inventory_id}
                                            sx={{ mr: 1 }}
                                        >
                                            <PointOfSaleIcon />
                                        </IconButton>
                                    </Tooltip> */}
                                        <IconButton
                                            aria-label="delete"
                                            color="error"
                                            onClick={() => handleDeleteClick(row)}
                                            disabled={!row?.inventory_id}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell></>)}
                                </TableRow>
                            )
                        )
                    })}
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={7} />
                        </TableRow>
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={7}
                            count={rowsData?.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            slotProps={{
                                select: {
                                    inputProps: {
                                        'aria-label': t('rows_per_page'),
                                    },
                                    native: true,
                                },
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                        />
                    </TableRow>
                </TableFooter>
            </Table >
        </TableContainer >
    );
}