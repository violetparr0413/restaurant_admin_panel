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
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

import { PurchaseHistory } from '../../utils/info';

import { useTranslation } from 'next-i18next';
import { convertDateTime, safeJsonParseArray } from '@/utils/http_helper';
import { useRouter } from 'next/router';
import ImagePreview from '@/_components/ImagePreview';
import EditPanel from './edit';
import { TableSortLabel } from '@mui/material';

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
    rows: PurchaseHistory[];
}

export default function Page({ rows }: TableProps) {
    const { t } = useTranslation('common')

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [rowsData, setRows] = React.useState(rows);
    const [view, setView] = React.useState('hide'); // can be 'hide', 'add', 'edit', delete
    const [editItem, setEditItem] = React.useState<PurchaseHistory | null>(null);

    const handleEditClick = (item: PurchaseHistory) => {
        setEditItem(item);
        setView('edit');
    };

    const handleBackClick = () => {
        setView('hide');
        setEditItem(null);
    };

    const handleSaveClick = (data: PurchaseHistory) => {
        rowsData?.find(x => x.history_id === data.history_id) ?
            setRows(rowsData => rowsData?.map(x => x.history_id === data.history_id ? data : x))
            : setRows([...rowsData, data])
        setView('hide');
    };

    const router = useRouter();
    const { locale } = router;

    const [maxHeight, setMaxHeight] = React.useState(0)

    React.useEffect(() => {
        setMaxHeight(document.documentElement.clientHeight - 120);
    }, []);

    React.useEffect(() => {
        setRows(rows);
    }, [rows]);

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

    type Order = 'asc' | 'desc';
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<
        'inventory' | 'user' | 'requested' | 'received_amount' | 'action' | 'employee' | 'supplier' | 'created_at'
    >('created_at');

    // 2) Accessors for sortable columns (normalize types & handle nulls)
    const accessorMap = {
        inventory: (r: any) => r?.inventory?.name ?? '',
        user: (r: any) => r?.user?.username ?? '',
        requested: (r: any) =>
            r?.action === 'INPUT' ? Number.NEGATIVE_INFINITY : Number(r?.request_amount ?? 0),
        received_amount: (r: any) =>
            r?.action === 'INPUT' ? Number.NEGATIVE_INFINITY : Number(r?.amount ?? 0),
        action: (r: any) => r?.action ?? '',
        employee: (r: any) => r?.employee?.name ?? '',
        supplier: (r: any) => r?.supplier?.supplier_name ?? '',
        created_at: (r: any) => new Date(r?.created_at ?? 0).getTime(), // sort by timestamp
    } as const;

    type SortKey = keyof typeof accessorMap;

    // 3) Comparator helpers (stable sort)
    function compare<T>(a: T, b: T, get: (x: T) => any) {
        const va = get(a);
        const vb = get(b);
        if (va < vb) return -1;
        if (va > vb) return 1;
        return 0;
    }
    function getComparator<T>(ord: Order, get: (x: T) => any) {
        return ord === 'desc'
            ? (a: T, b: T) => -compare(a, b, get)
            : (a: T, b: T) => compare(a, b, get);
    }

    // 4) Memo: sorted rows first, then paginate
    const sortedRows = React.useMemo(() => {
        if (!rowsData) return [];
        const get = accessorMap[orderBy];
        const stabilized = rowsData.map((el: any, idx: number) => [el, idx] as const);
        stabilized.sort((a, b) => {
            const res = getComparator(order, get)(a[0], b[0]);
            return res !== 0 ? res : a[1] - b[1]; // keep it stable
        });
        return stabilized.map((x) => x[0]);
    }, [rowsData, order, orderBy]);

    const pagedRows = React.useMemo(() => {
        if (!sortedRows) return [];
        return rowsPerPage > 0
            ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : sortedRows;
    }, [sortedRows, page, rowsPerPage]);

    // 5) Click handler for headers
    const handleRequestSort = (property: SortKey) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    return (
        <TableContainer component={Paper} sx={{ maxHeight: maxHeight }}>
            <Table sx={{ tableLayout: 'fixed' }} stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell sx={{ width: 120 }} sortDirection={orderBy === 'inventory' ? order : false}>
                            <TableSortLabel
                                active={orderBy === 'inventory'}
                                direction={orderBy === 'inventory' ? order : 'asc'}
                                onClick={() => handleRequestSort('inventory')}
                            >
                                {t('inventory')}
                            </TableSortLabel>
                        </StyledTableCell>

                        <StyledTableCell sx={{ width: 120 }} sortDirection={orderBy === 'user' ? order : false}>
                            <TableSortLabel
                                active={orderBy === 'user'}
                                direction={orderBy === 'user' ? order : 'asc'}
                                onClick={() => handleRequestSort('user')}
                            >
                                {t('user')}
                            </TableSortLabel>
                        </StyledTableCell>

                        <StyledTableCell sx={{ width: 120 }} align="right" sortDirection={orderBy === 'requested' ? order : false}>
                            <TableSortLabel
                                active={orderBy === 'requested'}
                                direction={orderBy === 'requested' ? order : 'asc'}
                                onClick={() => handleRequestSort('requested')}
                            >
                                {t('requested')}
                            </TableSortLabel>
                        </StyledTableCell>

                        <StyledTableCell sx={{ width: 160 }} align="right" sortDirection={orderBy === 'received_amount' ? order : false}>
                            <TableSortLabel
                                active={orderBy === 'received_amount'}
                                direction={orderBy === 'received_amount' ? order : 'asc'}
                                onClick={() => handleRequestSort('received_amount')}
                            >
                                {t('received_amount')}
                            </TableSortLabel>
                        </StyledTableCell>

                        <StyledTableCell sx={{ width: 120 }} sortDirection={orderBy === 'action' ? order : false}>
                            <TableSortLabel
                                active={orderBy === 'action'}
                                direction={orderBy === 'action' ? order : 'asc'}
                                onClick={() => handleRequestSort('action')}
                            >
                                {t('action')}
                            </TableSortLabel>
                        </StyledTableCell>

                        <StyledTableCell sx={{ width: 120 }} sortDirection={orderBy === 'employee' ? order : false}>
                            <TableSortLabel
                                active={orderBy === 'employee'}
                                direction={orderBy === 'employee' ? order : 'asc'}
                                onClick={() => handleRequestSort('employee')}
                            >
                                {t('employee')}
                            </TableSortLabel>
                        </StyledTableCell>

                        <StyledTableCell sx={{ width: 120 }} sortDirection={orderBy === 'supplier' ? order : false}>
                            <TableSortLabel
                                active={orderBy === 'supplier'}
                                direction={orderBy === 'supplier' ? order : 'asc'}
                                onClick={() => handleRequestSort('supplier')}
                            >
                                {t('supplier')}
                            </TableSortLabel>
                        </StyledTableCell>

                        {/* photo: not sortable */}
                        <StyledTableCell sx={{ width: 320 }}>{t('photo')}</StyledTableCell>

                        <StyledTableCell sx={{ width: 200 }} align="right" sortDirection={orderBy === 'created_at' ? order : false}>
                            <TableSortLabel
                                active={orderBy === 'created_at'}
                                direction={orderBy === 'created_at' ? order : 'asc'}
                                onClick={() => handleRequestSort('created_at')}
                            >
                                {t('created_at')}
                            </TableSortLabel>
                        </StyledTableCell>

                        {/* actions column (edit button): not sortable */}
                        <StyledTableCell sx={{ width: 120 }} />
                    </TableRow>
                </TableHead>

                <TableBody>
                    {pagedRows?.map((row: any) =>
                        view === 'edit' && editItem?.history_id === row?.history_id ? (
                            <EditPanel
                                key={`edit-${row?.history_id}`}
                                row={row}
                                onBack={handleBackClick}
                                onSave={handleSaveClick}
                            />
                        ) : (
                            <TableRow key={row?.history_id}>
                                <TableCell component="th" scope="row">
                                    {row?.inventory?.name}
                                </TableCell>
                                <TableCell>{row?.user?.username}</TableCell>
                                <TableCell align="right">
                                    {row?.action === 'INPUT' ? '--' : `${row?.request_amount} ${row?.inventory?.unit.unit_name}`}
                                </TableCell>
                                <TableCell align="right">
                                    {row?.action === 'INPUT' ? '--' : `${row?.amount} ${row?.inventory?.unit.unit_name}`}
                                </TableCell>
                                <TableCell>{row?.action === 'INPUT'
                                    ? `${row?.action} (${row?.amount} ${row?.inventory?.unit.unit_name})`
                                    : row?.action}
                                </TableCell>
                                <TableCell>{row?.employee?.name}</TableCell>
                                <TableCell>{row?.supplier?.supplier_name}</TableCell>
                                <TableCell>
                                    {row?.photo ? (
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            {safeJsonParseArray(row?.photo).map((image: string, index: number) => (
                                                <ImagePreview
                                                    key={index}
                                                    src={process.env.NEXT_PUBLIC_API_BASE_URL2 + image}
                                                />
                                            ))}
                                        </Box>
                                    ) : null}
                                </TableCell>
                                <TableCell align="right">{convertDateTime(row?.created_at)}</TableCell>
                                <TableCell>
                                    {row?.action === 'PURCHASED' && (
                                        <IconButton
                                            aria-label="edit"
                                            color="primary"
                                            onClick={() => handleEditClick(row)}
                                            disabled={!row?.history_id}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    )}
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={10} />
                        </TableRow>
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={10}
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
            </Table>
        </TableContainer >

    );
}