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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

import { InvoiceLog } from '../../utils/info';

import { useTranslation } from 'next-i18next';
import { convertDateTime } from '@/utils/http_helper';
import { useRouter } from 'next/router';

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
    rows: InvoiceLog[];
}

export default function Page({ rows }: TableProps) {
    const { t } = useTranslation('common')

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [rowsData, setRows] = React.useState(rows);

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

    return (
        <>
            <TableContainer component={Paper} sx={{ maxHeight: maxHeight }}>
                <Table sx={{ tableLayout: 'fixed' }} stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: 160 }}>{t('table')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 120 }} align="right">{t('number_of_people')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 120 }} align="right">{t('total_amount')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 120 }} align="right">{t('total_tax_amount')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 160 }} align="right">{t('payment_method')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 120 }} align="right">{t('invoice')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 120 }} align="right">{t('receipt')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 200 }} align="right">{t('created_at')}</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0 && rowsData
                            ? rowsData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : rowsData
                        )?.map((row) => (
                            (
                                <TableRow key={row?.guest.guest_id}>
                                    <TableCell>
                                        {row?.table?.name}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.guest.num_of_people}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.totalPriceOrder}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.totalTaxPrice}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.guest?.payment_method?.payment_method_name}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.guest.is_printed ? (
                                            <CheckIcon color="success" fontSize="small" />
                                        ) : (
                                            <CloseIcon color="error" fontSize="small" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row?.guest.is_printed_receipt ? (
                                            <CheckIcon color="success" fontSize="small" />
                                        ) : (
                                            <CloseIcon color="error" fontSize="small" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {convertDateTime(row?.guest.created_at)}
                                    </TableCell>
                                </TableRow>
                            )
                        ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={8} />
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                colSpan={8}
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