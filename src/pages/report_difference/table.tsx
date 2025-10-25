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

import { ReportDifference } from '../../utils/info';

import { useTranslation } from 'next-i18next';
import { formatNumber } from '@/utils/http_helper';

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
    headers: string[];
    rows: ReportDifference[];
}

export default function Page({ headers, rows }: TableProps) {
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

    type HeaderGroup = { date: string; keys: string[] };

    const headerGroups: HeaderGroup[] = React.useMemo(() => {
        const byDate: Record<string, string[]> = {};
        (headers || []).forEach((h) => {
            const dateOnly = h.split(' ')[0];
            (byDate[dateOnly] ||= []).push(h);
        });
        return Object.entries(byDate).map(([date, keys]) => ({ date, keys }));
    }, [headers]);

    // Handy list of original keys in display order for rendering body cells
    const orderedKeys: string[] = React.useMemo(
        () => headerGroups.flatMap((g) => g.keys),
        [headerGroups]
    );


    return (
        <>
            <TableContainer component={Paper} sx={{ maxHeight: maxHeight }}>
                <Table sx={{ tableLayout: 'fixed' }} stickyHeader aria-label="sticky table">
                    <colgroup>
                        {/* first sticky "inventory" column */}
                        <col style={{ width: 140 }} />
                        {/* one fixed-width <col> for every numbered date column */}
                        {headerGroups.flatMap((g) =>
                            g.keys.map(() => <col key={crypto.randomUUID()} style={{ width: 108 }} />)
                        )}
                    </colgroup>
                    <TableHead>
                        {/* Top row: left sticky label + grouped dates */}
                        <TableRow>
                            <StyledTableCell
                                component="th"
                                scope="col"
                                rowSpan={2}
                                sx={{ width: 160 }}
                            >
                                {t('inventory')}
                            </StyledTableCell>

                            {headerGroups.map((g) => (
                                <StyledTableCell
                                    key={g.date}
                                    align="right"
                                    colSpan={g.keys.length}
                                    component="th"
                                    scope="colgroup"
                                    sx={{ borderLeft: '1px solid' }}
                                >
                                    {g.date}
                                </StyledTableCell>
                            ))}
                        </TableRow>

                        {/* Second row: indices 1..N under each date */}
                        <TableRow>
                            {headerGroups.flatMap((g) =>
                                g.keys.map((_, i) => (
                                    <StyledTableCell
                                        key={`${g.date}-${i + 1}`}
                                        align="right"
                                        component="th"
                                        scope="col"
                                        sx={{ borderLeft: '1px solid' }}
                                    >
                                        {i + 1}
                                    </StyledTableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {(rowsPerPage > 0 && rowsData
                            ? rowsData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : rowsData
                        )?.map((row) => (
                            <TableRow key={row?.inventory.inventory_id}>
                                <TableCell component="th" scope="row">
                                    {row?.inventory.name}
                                </TableCell>

                                {orderedKeys.map((k) => (
                                    <TableCell key={k} align="right" sx={{ borderLeft: '1px solid', borderColor: 'divider' }}>
                                        {row?.difference_percent?.[k] != null
                                            ? `${formatNumber(Number(row.difference_percent[k]))}%`
                                            : '--'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}

                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={1 + (headers?.length || 0)} />
                            </TableRow>
                        )}
                    </TableBody>

                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                colSpan={headers.length + 1}
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