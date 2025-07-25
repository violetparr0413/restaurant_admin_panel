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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";

import { Employee } from '../../utils/info';
import AddPanel from './add';
import EditPanel from './edit';
import DeletePanel from './delete';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import api, { convertDateTime } from '@/utils/http_helper';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

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
    rows: Employee[];
}

export default function Page({ rows }: TableProps) {
    const { t } = useTranslation('common')

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const [rowsData, setRows] = React.useState(rows);
    const [view, setView] = React.useState('hide'); // can be 'hide', 'add', 'edit', delete
    const [editItem, setEditItem] = React.useState<Employee | null>(null);

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

    const handleBackClick = () => {
        setView('hide');
        setEditItem(null);
    };

    const handleSaveClick = (data: Employee) => {
        rowsData?.find(x => x.employee_id === data.employee_id) ?
            setRows(rowsData => rowsData?.map(x => x.employee_id === data.employee_id ? data : x))
            : setRows([...rowsData, data])
        setView('hide');
    };

    const handleAddClick = () => {
        setView('add');
    };

    const handleEditClick = (item: Employee) => {
        setEditItem(item);
        setView('edit');
    };

    const handleDeleteClick = (item: Employee) => {
        setEditItem(item);
        setView('delete');
    };

    const handleDeleteReq = (data: Employee) => {
        const index = rowsData?.indexOf(data)
        if (index !== -1) rowsData?.splice(index, 1);
        setRows(rowsData?.filter(row => row !== data))
    }

    const updateOrder = (row:Employee, order: number) => {
        const formData = new FormData();

        formData.append("_method", "put")

        formData.append('name', row?.name);
        formData.append('role', row?.role);
        formData.append('table_order', order.toString());

        api.post(`/employee/${row?.employee_id}`, formData)
            .then(res => { })
            .catch(error => {
                if (error.response && error.response.status === 422) {
                    // Validation error from server
                    console.log(error.response.data);
                } else {
                    // Other errors
                    console.error(t('unexpected_error'), error);
                }
            })
    }

    const handleOnDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(rowsData);

        const source_index = result.source.index + rowsPerPage * page
        const destination_index = result.destination.index + rowsPerPage * page
        
        updateOrder(items[destination_index], items[source_index].table_order)
        updateOrder(items[source_index], items[destination_index].table_order)

        const [reorderedItem] = items.splice(source_index, 1);
        items.splice(destination_index, 0, reorderedItem);

        setRows(items);
    };

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <TableContainer component={Paper}>
                <Table sx={{ tableLayout: 'fixed' }} aria-label="custom pagination table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: 50 }}></StyledTableCell>
                            <StyledTableCell>{t('name')}</StyledTableCell>
                            <StyledTableCell align="right">{t('created_at')}</StyledTableCell>
                            <StyledTableCell sx={{ width: 160 }}>
                                <IconButton aria-label="add"
                                    color="info"
                                    onClick={handleAddClick}
                                >
                                    <AddCircleIcon />
                                </IconButton>
                            </StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <Droppable droppableId="table" direction="vertical">
                        {(provided) => (
                            <TableBody ref={provided.innerRef}
                                {...provided.droppableProps}>
                                {view === 'add' && (
                                    <AddPanel onBack={handleBackClick} onSave={handleSaveClick} />
                                )}
                                {(rowsPerPage > 0 && rowsData
                                    ? rowsData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    : rowsData
                                )?.map((row, index) => (
                                    view === 'edit' && editItem?.employee_id === row?.employee_id ? (
                                        <EditPanel
                                            row={row}
                                            onBack={handleBackClick}
                                            onSave={handleSaveClick}
                                        />
                                    ) : view === 'delete' && editItem?.employee_id === row?.employee_id ? (
                                        <DeletePanel
                                            row={row}
                                            onBack={handleBackClick}
                                            onDelete={handleDeleteReq}
                                        />
                                    ) : (
                                        <Draggable
                                            key={row?.employee_id}
                                            draggableId={row?.employee_id.toString()}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <TableRow key={row?.employee_id} ref={provided.innerRef}
                                                    {...provided.draggableProps} sx={{
                                                        backgroundColor: snapshot.isDragging
                                                            ? "#f0f0f0"
                                                            : "inherit",
                                                    }}>
                                                    <TableCell
                                                        {...provided.dragHandleProps}
                                                        width="50px"
                                                    >
                                                        <IconButton>
                                                            <DragIndicatorIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell component="th" scope="row">
                                                        {row?.name}
                                                    </TableCell>
                                                    <TableCell style={{ width: 160 }} align="right">
                                                        {convertDateTime(row?.created_at)}
                                                    </TableCell>
                                                    <TableCell style={{ width: 160 }}>
                                                        <IconButton
                                                            aria-label="edit"
                                                            color="primary"
                                                            onClick={() => handleEditClick(row)}
                                                            disabled={!row?.employee_id}
                                                            sx={{ mr: 1 }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="delete"
                                                            color="error"
                                                            onClick={() => handleDeleteClick(row)}
                                                            disabled={!row?.employee_id}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Draggable>
                                    )
                                ))}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 60 * emptyRows }}>
                                        <TableCell colSpan={4} />
                                    </TableRow>
                                )}
                            </TableBody>
                        )}
                    </Droppable>
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
        </DragDropContext>
    );
}