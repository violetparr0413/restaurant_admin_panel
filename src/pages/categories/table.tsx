import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PostAddIcon from '@mui/icons-material/PostAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Category } from '../../utils/info';
import AddPanel from './add';
import EditPanel from './edit';
import DeletePanel from './delete';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import DishImagePreview from '@/_components/ImagePreview';

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import api, { convertDateTime } from '@/utils/http_helper';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

interface RowProps {
  row: Category
  onDelete: (data: Category) => void
  provided: DraggableProvided
  snapshot: DraggableStateSnapshot
}

const StyledSubTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
  }
}));

function Row({ row, onDelete, provided, snapshot }: RowProps) {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation('common')

  const [view, setView] = React.useState('hide'); // can be 'hide', 'add', 'edit', delete
  const [rowData, setRowData] = React.useState<Category>(row);

  const [subview, setSubview] = React.useState('hide'); // can be 'hide', 'add', 'edit', delete
  const [editSubItem, setEditSubItem] = React.useState<Category>({
    category_id: 0,
    category_name: '',
    category_en_name: '',
    category_zh_name: '',
    parent_id: row?.category_id,
    category_image: '',
    category_order: 0,
    created_at: new Date().toDateString(),
  });

  const handleEditClick = (item: Category) => {
    setView('edit');
  };

  const handleSubEditClick = (item: Category) => {
    setEditSubItem(item);
    setSubview('edit');
  }

  const handleSubDeleteClick = (item: Category) => {
    setEditSubItem(item);
    setSubview('delete');
  }

  const handleSubBackClick = () => {
    setSubview('hide');
  }

  const handleSubAddClick = () => {
    setSubview('add');
  }

  const handleDeleteClick = (item: Category) => {
    setView('delete');
  };

  const handleDeleteReq = (item: Category) => {
    setView('hide');
    onDelete(item)
  };

  const handleBackClick = () => {
    setView('hide');
  };

  const handleSubSaveClick = (child: Category) => {
    rowData.childs?.find(x => x.category_id === child.category_id) ?
      setRowData(rowData => ({
        ...rowData,
        childs: (rowData.childs ?? [])?.map(x =>
          x.category_id === child.category_id ? child : x
        ),
      }))
      : setRowData(rowData => ({
        ...rowData,
        childs: [...(rowData.childs ?? []), child]
      }))
    setSubview('hide');
  };

  const handleSubDeleteReq = (child: Category) => {
    const index = rowData.childs?.indexOf(child)
    if (typeof index === 'number' && index !== -1) rowData.childs?.splice(index, 1);
    setRowData(prev => ({
      ...prev,
      childs: (prev.childs ?? []).filter(row => row !== child)
    }))
  }

  const handleSaveClick = (data: Category) => {
    setRowData(prev => ({
      ...data,
      childs: prev.childs  // preserve previous childs
    }));
    setView('hide');
  };

  const updateOrder = (row: Category, order: number) => {
    const formData = new FormData();

    formData.append("_method", "put")

    formData.append('category_name', row?.category_name);
    formData.append('parent_id', row?.parent_id.toString());
    formData.append('category_order', order.toString());

    api.post(`/category/${row?.category_id}`, formData)
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

    const items = Array.from(rowData.childs ? rowData.childs : []);
    if (!items) return;

    updateOrder(items[result.destination.index], items[result.source.index].category_order)
    updateOrder(items[result.source.index], items[result.destination.index].category_order)

    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    rowData.childs = [...items];

    setRowData(rowData);
  };

  return (
    <React.Fragment>
      <TableRow key={row?.category_id} sx={{
        '& > *': { borderBottom: 'unset' }, backgroundColor: snapshot.isDragging
          ? "#f0f0f0"
          : "inherit",
      }} ref={provided.innerRef}
        {...provided.draggableProps}>
        {(view !== 'edit') && (view !== 'delete') ? (<TableCell
          {...provided.dragHandleProps}
          width="50px"
        >
          <IconButton>
            <DragIndicatorIcon />
          </IconButton></TableCell>
        ) : (<TableCell
          width="50px"
        ></TableCell>)}
        <TableCell width="50px">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {view === 'edit' ? (
          <EditPanel
            row={rowData}
            onBack={handleBackClick}
            onSave={handleSaveClick}
          />
        ) : view === 'delete' ? (
          <DeletePanel
            row={rowData}
            onBack={handleBackClick}
            onDelete={handleDeleteReq}
          />
        ) : (
          <>
            <TableCell component="th" scope="row">
              {rowData.category_name}
            </TableCell>
            <TableCell>{rowData.category_en_name}</TableCell>
            <TableCell>{rowData.category_zh_name}</TableCell>
            <TableCell>
              {rowData.category_image ? (<DishImagePreview
                src={process.env.NEXT_PUBLIC_API_BASE_URL2 + rowData.category_image}
              />) : (<></>)}
            </TableCell>
            <TableCell align="right">
              {convertDateTime(rowData?.created_at)}
            </TableCell>
            <TableCell style={{ width: 160 }}>
              <IconButton
                aria-label="edit"
                color="primary"
                onClick={() => handleEditClick(rowData)}
                disabled={!rowData.category_id}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label="delete"
                color="error"
                onClick={() => handleDeleteClick(rowData)}
                disabled={!rowData.category_id}
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </>
        )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} />
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                {t('subcategory')}
              </Typography>
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Table sx={{ tableLayout: 'fixed' }} size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <StyledSubTableCell sx={{ width: 50 }} />
                      <StyledSubTableCell sx={{ width: 50 }} />
                      <StyledSubTableCell>{t('name')}</StyledSubTableCell>
                      <StyledSubTableCell>{t('name_en')}</StyledSubTableCell>
                      <StyledSubTableCell>{t('name_zh')}</StyledSubTableCell>
                      <StyledSubTableCell>{t('image')}</StyledSubTableCell>
                      <StyledSubTableCell align="right">{t('created_at')}</StyledSubTableCell>
                      <StyledSubTableCell style={{ width: 160 }}>
                        <IconButton aria-label="add"
                          color="warning"
                          onClick={() => handleSubAddClick()}
                        >
                          <PostAddIcon />
                        </IconButton>
                      </StyledSubTableCell>
                    </TableRow>
                  </TableHead>
                  <Droppable droppableId="table2" direction="vertical">
                    {(provided) => (
                      <TableBody ref={provided.innerRef}
                        {...provided.droppableProps}>
                        {subview === 'add' && (
                          <AddPanel parent={rowData.category_id} onBack={handleSubBackClick} onSave={handleSubSaveClick} />
                        )}
                        {rowData.childs?.map((childRow, index) => (
                          <Draggable
                            key={childRow.category_id}
                            draggableId={childRow.category_id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <TableRow key={childRow.category_id} ref={provided.innerRef}
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
                                <TableCell />
                                {subview === 'edit' && editSubItem?.category_id === childRow.category_id ? (
                                  <EditPanel
                                    row={childRow}
                                    onBack={handleSubBackClick}
                                    onSave={handleSubSaveClick}
                                  />
                                ) : subview === 'delete' && editSubItem?.category_id === childRow.category_id ? (
                                  <DeletePanel
                                    row={childRow}
                                    onBack={handleSubBackClick}
                                    onDelete={handleSubDeleteReq}
                                  />
                                ) : (
                                  <>
                                    <TableCell component="th" scope="row">
                                      {childRow.category_name}
                                    </TableCell>
                                    <TableCell>{childRow.category_en_name}</TableCell>
                                    <TableCell>{childRow.category_zh_name}</TableCell>
                                    <TableCell>
                                      {childRow.category_image ? (<DishImagePreview
                                        src={process.env.NEXT_PUBLIC_API_BASE_URL2 + childRow.category_image}
                                      />) : (<></>)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {convertDateTime(childRow?.created_at)}
                                    </TableCell>
                                    <TableCell style={{ width: 160 }}>
                                      <IconButton
                                        aria-label="edit"
                                        color="secondary"
                                        onClick={() => handleSubEditClick(childRow)}
                                        disabled={!childRow.category_id}
                                        sx={{ mr: 1 }}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        aria-label="delete"
                                        color="warning"
                                        onClick={() => handleSubDeleteClick(childRow)}
                                        disabled={!childRow.category_id}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </>
                                )}
                              </TableRow>
                            )}
                          </Draggable>
                        ))}
                      </TableBody>
                    )}
                  </Droppable>
                </Table>
              </DragDropContext>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
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

interface TableProps {
  rows: Category[];
}

export default function CollapsibleTable({ rows }: TableProps) {
  const { t } = useTranslation('common')

  const [view, setView] = React.useState('hide'); // can be 'hide', 'add'
  const [rowsData, setRows] = React.useState(rows); // can be 'hide', 'add'

  React.useEffect(() => {
    setRows(rows);
  }, [rows]);

  const handleBackClick = () => {
    setView('hide');
  };

  const handleSaveClick = (data: Category) => {
    setView('hide');
    setRows([...rowsData, data])
  };

  const handleDeleteClick = (data: Category) => {
    const index = rowsData?.indexOf(data)
    if (index !== -1) rowsData?.splice(index, 1);
    setRows(rowsData?.filter(row => row !== data))
  }

  const handleAddClick = () => {
    setView('add');
  };

  const updateOrder = (row: Category, order: number) => {
    const formData = new FormData();

    formData.append("_method", "put")

    formData.append('category_name', row?.category_name);
    formData.append('category_order', order.toString());

    api.post(`/category/${row?.category_id}`, formData)
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

    updateOrder(items[result.destination.index], items[result.source.index].category_order)
    updateOrder(items[result.source.index], items[result.destination.index].category_order)

    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRows(items);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Paper component={Paper}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed' }} stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: 50 }} />
                <StyledTableCell sx={{ width: 50 }} />
                <StyledTableCell sx={{ minWidth: 160 }}>{t('name')}</StyledTableCell>
                <StyledTableCell sx={{ minWidth: 160 }}>{t('name_en')}</StyledTableCell>
                <StyledTableCell sx={{ minWidth: 160 }}>{t('name_zh')}</StyledTableCell>
                <StyledTableCell>{t('image')}</StyledTableCell>
                <StyledTableCell align="right">{t('created_at')}</StyledTableCell>
                <StyledTableCell sx={{ minWidth: 160 }}>
                  <IconButton aria-label="add"
                    color="info"
                    onClick={handleAddClick}
                  >
                    <PostAddIcon />
                  </IconButton>
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <Droppable droppableId="table1" direction="vertical">
              {(provided) => (
                <TableBody
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {view === 'add' && (
                    <AddPanel parent={0} onBack={handleBackClick} onSave={handleSaveClick} />
                  )}
                  {rowsData?.map((row, index) => (
                    <Draggable
                      key={row?.category_id}
                      draggableId={row?.category_id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Row key={row?.category_id} row={row} onDelete={handleDeleteClick} provided={provided} snapshot={snapshot} />
                      )}
                    </Draggable>
                  ))}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </TableContainer>
      </Paper>
    </DragDropContext>
  );
}