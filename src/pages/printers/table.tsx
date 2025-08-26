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

import { Printer } from '../../utils/info';
import AddPanel from './add';
import EditPanel from './edit';
import DeletePanel from './delete';

import { useTranslation } from 'next-i18next';
import { convertDateTime } from '@/utils/http_helper';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

interface TableProps {
    rows: Printer[];
}

export default function Page({ rows }: TableProps) {
    const { t } = useTranslation('common')

    const [rowsData, setRows] = React.useState(rows);
    const [view, setView] = React.useState('hide'); // can be 'hide', 'add', 'edit', delete
    const [editItem, setEditItem] = React.useState<Printer | null>(null);
    const [counterExist, setCounterExist] = React.useState(false)

    React.useEffect(() => {
        if (rows.findIndex(x => x.position == 'COUNTER') > -1) setCounterExist(true)
        setRows(rows);
    }, [rows]);

    const PRINTER_POSITION = {
        'COUNTER': t('counter'),
        "KITCHEN": t('kitchen'),
    }

    const handleBackClick = () => {
        setView('hide');
        setEditItem(null);
    };

    const handleSaveClick = (data: Printer) => {
        rowsData?.find(x => x.printer_id === data.printer_id) ?
            setRows(rowsData => rowsData?.map(x => x.printer_id === data.printer_id ? data : x))
            : setRows([...rowsData, data])
        setView('hide');
    };

    const handleAddClick = () => {
        setView('add');
    };

    const handleEditClick = (item: Printer) => {
        setEditItem(item);
        setView('edit');
    };

    const handleDeleteClick = (item: Printer) => {
        setEditItem(item);
        setView('delete');
    };

    const handleDeleteReq = (data: Printer) => {
        const index = rowsData?.indexOf(data)
        if (index !== -1) rowsData?.splice(index, 1);
        setRows(rowsData?.filter(row => row !== data))
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ tableLayout: 'fixed' }} aria-label="custom pagination table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>{t('name')}</StyledTableCell>
                        <StyledTableCell>{t('ip_address')}</StyledTableCell>
                        <StyledTableCell>{t('port')}</StyledTableCell>
                        <StyledTableCell>{t('position')}</StyledTableCell>
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
                        <AddPanel exist={counterExist} onBack={handleBackClick} onSave={handleSaveClick} />
                    )}
                    {rowsData?.map((row) => (
                        view === 'edit' && editItem?.printer_id === row?.printer_id ? (
                            <EditPanel
                                exist={counterExist}
                                row={row}
                                onBack={handleBackClick}
                                onSave={handleSaveClick}
                            />
                        ) : view === 'delete' && editItem?.printer_id === row?.printer_id ? (
                            <DeletePanel
                                row={row}
                                onBack={handleBackClick}
                                onDelete={handleDeleteReq}
                            />
                        ) : (
                            <TableRow key={row?.printer_id}>
                                <TableCell component="th" scope="row">
                                    {row?.printer_name}
                                </TableCell>
                                <TableCell>
                                    {row?.ip_address}
                                </TableCell>
                                <TableCell>
                                    {row?.port}
                                </TableCell>
                                <TableCell>
                                    {PRINTER_POSITION[row?.position]}
                                </TableCell>
                                <TableCell style={{ width: 160 }} align="right">
                                    {convertDateTime(row?.created_at)}
                                </TableCell>
                                <TableCell style={{ width: 160 }}>
                                    <IconButton
                                        aria-label="edit"
                                        color="primary"
                                        onClick={() => handleEditClick(row)}
                                        disabled={!row?.printer_id}
                                        sx={{ mr: 1 }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        aria-label="delete"
                                        color="error"
                                        onClick={() => handleDeleteClick(row)}
                                        disabled={!row?.printer_id}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}