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
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';

import { ReportInventory } from '../../utils/info';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import EditPanel from './edit';

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
    rows: ReportInventory[];
}

export default function Page({ rows }: TableProps) {
    const { t } = useTranslation('common')

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [rowsData, setRows] = React.useState(rows);
    const [view, setView] = React.useState('hide'); // can be 'hide', 'add', 'edit', delete
    const [editItem, setEditItem] = React.useState<ReportInventory | null>(null);

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

    const handleEditClick = (item: ReportInventory) => {
        setEditItem(item);
        setView('edit');
    };

    const handleBackClick = () => {
        setView('hide');
        setEditItem(null);
    };

    const handleRemarkUpdated = (id: number, remark: string) => {
        setRows(prev =>
            prev.map(r =>
                r.inventory.inventory_id === id
                    ? { ...r, inventory: { ...r.inventory, remark } }
                    : r
            )
        );
        setView('hide');
        setEditItem(null);
    };

    return (
        <>
            <TableContainer component={Paper} sx={{ maxHeight: maxHeight }}>
                <Table sx={{ tableLayout: 'fixed' }} stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: 160 }}>{t('ingredient')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 90 }}>{t('unit')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 90 }} align="right">{t('opening_stock')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 90 }} align="right">{t('purchase_qty')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 90 }} align="right">{t('sales_consumption')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 90 }} align="right">{t('theoretical_balance')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 90 }} align="right">{t('actual_stock')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 90 }} align="right">{t('difference')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 90 }} align="right">{t('percent')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 160 }}>{t('remarks')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 90 }}></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0 && rowsData
                            ? rowsData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : rowsData
                        )?.map((row) => (
                            view === 'edit' && editItem?.inventory.inventory_id === row?.inventory.inventory_id ? (
                                <EditPanel
                                    row={row}
                                    onSave={handleRemarkUpdated}
                                    onBack={handleBackClick}
                                />
                            ) : (
                                <TableRow key={row?.inventory.inventory_id}>
                                    <TableCell component="th" scope="row">
                                        {row?.inventory.name}
                                    </TableCell>
                                    <TableCell>
                                        {row?.inventory.unit?.unit_name}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.openStock ?? '--'}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.purchasedQty ?? '--'}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.salesConsumption ?? '--'}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.theoreticalBalance ?? '--'}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.actualStock ?? '--'}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.difference ?? '--'}
                                    </TableCell>
                                    <TableCell align="right">
                                        {(row?.actualStock && (row?.actualStock > 0)) ? Math.round((row?.difference ?? 0) / row?.actualStock * 100) + '%' : '--'}
                                    </TableCell>
                                    <TableCell>
                                        {row?.inventory.remark}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            aria-label="edit"
                                            color="primary"
                                            onClick={() => handleEditClick(row)}
                                            disabled={!row?.inventory.inventory_id}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            )
                        ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={11} />
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                colSpan={11}
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
            </TableContainer>
        </>
    );
}