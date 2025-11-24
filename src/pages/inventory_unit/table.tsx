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
import DeleteIcon from '@mui/icons-material/Delete';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

import { InventoryUnit } from '../../utils/info';
import AddPanel from './add';
import EditPanel from './edit';
import DeletePanel from './delete';

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
    rows: InventoryUnit[];
    onDataChange: () => void;
}

export default function Page({ rows, onDataChange }: TableProps) {
    const { t } = useTranslation('common')

    const STORAGE_KEY = 'inventory_unit_table_state';

    // Load pagination state from storage
    const getInitialTableState = () => {
        if (typeof window === 'undefined') return { page: 0, rowsPerPage: 10 };
        const saved = sessionStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : { page: 0, rowsPerPage: 10 };
    };

    const [pagination, setPagination] = React.useState(getInitialTableState);
    const { page, rowsPerPage } = pagination;

    const [rowsData, setRows] = React.useState(rows);
    const [view, setView] = React.useState('hide'); // can be 'hide', 'add', 'edit', delete
    const [editItem, setEditItem] = React.useState<InventoryUnit | null>(null);

    const [maxHeight, setMaxHeight] = React.useState(0)

    React.useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pagination));
    }, [pagination]);

    React.useEffect(() => {
        setMaxHeight(document.documentElement.clientHeight - 120);
    }, []);

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
        setRows(rows);
    }, [rows]);

    const updateRows = (newRows: InventoryUnit[]) => {
        setRows(newRows);
        onDataChange && onDataChange();
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rowsData?.length) : 0;

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPagination({ page: 0, rowsPerPage: parseInt(event.target.value, 10) });
    };

    const handleBackClick = () => {
        setView('hide');
        setEditItem(null);
    };

    const handleSaveClick = (data: InventoryUnit) => {
        const updated = rowsData?.find(x => x.unit_id === data.unit_id)
            ? rowsData.map(x => (x.unit_id === data.unit_id ? data : x))
            : [...rowsData, data];

        updateRows(updated);
        setView('hide');
    };

    const handleAddClick = () => {
        setView('add');
    };

    const handleEditClick = (item: InventoryUnit) => {
        setEditItem(item);
        setView('edit');
    };

    const handleDeleteClick = (item: InventoryUnit) => {
        setEditItem(item);
        setView('delete');
    };

    const handleDeleteReq = (data: InventoryUnit) => {
        const updated = rowsData.filter(row => row.unit_id !== data.unit_id);
        updateRows(updated);
    }

    return (
        <TableContainer component={Paper} sx={{ maxHeight: maxHeight }}>
            <Table sx={{ tableLayout: 'fixed' }} stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>{t('name')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 200 }} align="right">{t('created_at')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 160 }}>
                            <IconButton aria-label="add"
                                color="info"
                                onClick={handleAddClick}
                            >
                                <PostAddIcon />
                            </IconButton>
                        </StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {view === 'add' && (
                        <AddPanel onBack={handleBackClick} onSave={handleSaveClick} />
                    )}
                    {(rowsPerPage > 0 && rowsData
                        ? rowsData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : rowsData
                    )?.map((row) => (
                        view === 'edit' && editItem?.unit_id === row?.unit_id ? (
                            <EditPanel
                                row={row}
                                onBack={handleBackClick}
                                onSave={handleSaveClick}
                            />
                        ) : view === 'delete' && editItem?.unit_id === row?.unit_id ? (
                            <DeletePanel
                                row={row}
                                onBack={handleBackClick}
                                onDelete={handleDeleteReq}
                            />
                        ) : (
                            <TableRow key={row?.unit_id}>
                                <TableCell component="th" scope="row">
                                    {row?.unit_name}
                                </TableCell>
                                <TableCell style={{ width: 160 }} align="right">
                                    {convertDateTime(row?.created_at)}
                                </TableCell>
                                <TableCell style={{ width: 160 }}>
                                    <IconButton
                                        aria-label="edit"
                                        color="primary"
                                        onClick={() => handleEditClick(row)}
                                        disabled={!row?.unit_id}
                                        sx={{ mr: 1 }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        aria-label="delete"
                                        color="error"
                                        onClick={() => handleDeleteClick(row)}
                                        disabled={!row?.unit_id}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )
                    ))}
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={3} />
                        </TableRow>
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={3}
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
    );
}