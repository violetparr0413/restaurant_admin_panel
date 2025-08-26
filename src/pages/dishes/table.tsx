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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Avatar from '@mui/material/Avatar';

import { Dish } from '../../utils/info';
import AddPanel from './add';
import EditPanel from './edit';
import DeletePanel from './delete';

import { useTranslation } from 'next-i18next';
import { deepOrange, green } from '@mui/material/colors';
import DishImagePreview from '@/_components/ImagePreview';
import { convertDateTime } from '@/utils/http_helper';
import { useRouter } from 'next/router';
import YouTubeThumbnail from '@/_components/YouTubeThumbnail';

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
    rows: Dish[];
}

export default function Page({ rows }: TableProps) {
    const { t } = useTranslation('common')

    const DISH_STATUS = [
        '---',
        t('takeout'),
        t('popular'),
        t('extra'),
    ];

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [rowsData, setRows] = React.useState(rows);
    const [view, setView] = React.useState('hide'); // can be 'hide', 'add', 'edit', delete
    const [editItem, setEditItem] = React.useState<Dish | null>(null);

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

    const handleBackClick = () => {
        setView('hide');
        setEditItem(null);
    };

    const handleSaveClick = (data: Dish) => {
        rowsData?.find(x => x.dish_id === data.dish_id) ?
            setRows(rowsData => rowsData?.map(x => x.dish_id === data.dish_id ? data : x))
            : setRows([...rowsData, data])
        setView('hide');
    };

    const handleAddClick = () => {
        setView('add');
    };

    const handleEditClick = (item: Dish) => {
        setEditItem(item);
        setView('edit');
    };

    const handleDeleteClick = (item: Dish) => {
        setEditItem(item);
        setView('delete');
    };

    const handleDeleteReq = (data: Dish) => {
        const index = rowsData?.indexOf(data)
        if (index !== -1) rowsData?.splice(index, 1);
        setRows(rowsData?.filter(row => row !== data))
    }

    return (
        <TableContainer component={Paper} sx={{ maxHeight: maxHeight }}>
            <Table sx={{ tableLayout: 'fixed' }} stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell sx={{ width: 160 }}>{t('category')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 160 }}>{t('subcategory')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 160 }}>{t('name')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 80 }}>{t('image')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 80 }}>{t('youtube')}</StyledTableCell>
                        <StyledTableCell sx={{ width: 160 }}>{t('printer')}</StyledTableCell>
                        <StyledTableCell align="right" sx={{ width: 120 }}>{t('price')}</StyledTableCell>
                        <StyledTableCell align="right" sx={{ width: 100 }}>{t('available')}</StyledTableCell>
                        <StyledTableCell align="right" sx={{ width: 100 }}>{t('status')}</StyledTableCell>
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
                <TableBody>
                    {view === 'add' && (
                        <AddPanel onBack={handleBackClick} onSave={handleSaveClick} />
                    )}
                    {(rowsPerPage > 0 && rowsData
                        ? rowsData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : rowsData
                    )?.map((row) => (
                        view === 'edit' && editItem?.dish_id === row?.dish_id ? (
                            <EditPanel
                                row={row}
                                onBack={handleBackClick}
                                onSave={handleSaveClick}
                            />
                        ) : view === 'delete' && editItem?.dish_id === row?.dish_id ? (
                            <DeletePanel
                                row={row}
                                onBack={handleBackClick}
                                onDelete={handleDeleteReq}
                            />
                        ) : (
                            <TableRow key={row?.dish_id}>
                                <TableCell component="th" scope="row">
                                    {row?.category.parent ? (
                                        locale === 'en' ? row?.category.parent?.category_en_name :
                                            locale === 'zh' ? row?.category.parent?.category_zh_name :
                                                locale === 'ko' ? row?.category.parent?.category_ko_name :
                                                    row?.category.parent?.category_name
                                    ) : (
                                        locale === 'en' ? row?.category.category_en_name :
                                            locale === 'zh' ? row?.category.category_zh_name :
                                                locale === 'ko' ? row?.category.category_ko_name :
                                                    row?.category.category_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {row?.category.parent ? (
                                        locale === 'en' ? row?.category.category_en_name :
                                            locale === 'zh' ? row?.category.category_zh_name :
                                                locale === 'ko' ? row?.category.category_ko_name :
                                                    row?.category.category_name
                                    ) : ('---')}
                                </TableCell>
                                <TableCell>
                                    {locale === 'en' ? row?.dish_en_name :
                                        locale === 'zh' ? row?.dish_zh_name :
                                            locale === 'ko' ? row?.dish_ko_name :
                                                row?.dish_name}
                                </TableCell>
                                <TableCell>
                                    {row?.dish_image ? (<DishImagePreview
                                        src={process.env.NEXT_PUBLIC_API_BASE_URL2 + row?.dish_image}
                                    />) : (<></>)}
                                </TableCell>
                                <TableCell>
                                    {row?.youtube_url && (<YouTubeThumbnail url={row?.youtube_url} />)}
                                </TableCell>
                                <TableCell>
                                    {row?.printers?.reduce((a, x) => a += (a == '' ? '' : ', ') + x.printer_name, '')}
                                </TableCell>
                                <TableCell align="right">
                                    {row?.dish_price}
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        {row?.dish_available ? (
                                            <Avatar sx={{ bgcolor: green[500], width: 32, height: 32 }}>
                                                <CheckIcon sx={{ width: 20, height: 20 }} />
                                            </Avatar>
                                        ) : (
                                            <Avatar sx={{ bgcolor: deepOrange[500], width: 32, height: 32 }}>
                                                <CloseIcon sx={{ width: 20, height: 20 }} />
                                            </Avatar>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    {DISH_STATUS[row?.dish_status]}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        aria-label="edit"
                                        color="primary"
                                        onClick={() => handleEditClick(row)}
                                        disabled={!row?.dish_id}
                                        sx={{ mr: 1 }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        aria-label="delete"
                                        color="error"
                                        onClick={() => handleDeleteClick(row)}
                                        disabled={!row?.dish_id}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )
                    ))}
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
        </TableContainer>
    );
}