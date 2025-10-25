import React, { useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    TableCell,
    TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography,
    Tooltip,
    Divider,
    Stack,
    CircularProgress
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'next-i18next';
import api, { convertDateTime } from '@/utils/http_helper';
import { Category } from '@/utils/info';
import DishImagePreview from '@/_components/ImagePreview';
import { useRouter } from 'next/router';

type DeletePanelProps = {
    row: Category;
    onBack: () => void;
    onDelete: (row: Category) => void;
};

const DeletePanel: React.FC<DeletePanelProps> = ({ row, onBack, onDelete }) => {
    const { t } = useTranslation('common');

    const [errorMessage, setErrorMessage] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const router = useRouter();
    const { locale } = router;

    // exact text requested (kept i18n-friendly)
    const SUBPRODUCTS_PROMPT =
        t('are_you_really_delete_dishes');

    const handleDeleteClick = () => {
        // Step 1: open confirm dialog (no API call yet)
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        // Step 2: after user confirms, post delete to server
        try {
            setSubmitting(true);
            setErrorMessage('');
            await api.delete(`/category/${row?.category_id}`);
            setConfirmOpen(false);
            onDelete(row);
        } catch (e) {
            // Show a simple inline error; you can customize per your API
            setErrorMessage(t('something_went_wrong', 'Something went wrong.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setConfirmOpen(false);
    };

    return (
        <>
            {/* Confirm dialog that shows BEFORE calling the API */}
            <Dialog
                open={confirmOpen}
                onClose={handleCancel}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', p: 0 } }}
                aria-describedby="delete-category-warning"
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
                    <WarningAmberRoundedIcon fontSize="medium" sx={{ color: 'warning.main', mr: 0.5 }} aria-hidden />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {t('confirm_delete')}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    {/* Top-right close (cancel) — keep this */}
                    <Tooltip title={t('cancel')}>
                        <span>
                            <IconButton
                                aria-label={t('cancel')}
                                onClick={handleCancel}
                                disabled={submitting}
                                edge="end"
                                sx={{ '&:focus-visible': { outline: '2px solid', outlineColor: 'divider' } }}
                            >
                                <CloseRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </DialogTitle>

                <Divider />

                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={1.5}>
                        <Typography id="delete-category-warning" variant="body2">
                            {SUBPRODUCTS_PROMPT}
                        </Typography>

                        {row?.category_name && (
                            <Box
                                sx={{
                                    mt: 0.5, px: 1.25, py: 0.75, borderRadius: 2,
                                    bgcolor: 'background.default', border: '1px solid', borderColor: 'divider',
                                }}
                            >
                                
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {locale === 'en' ? row?.category_en_name :
                                        locale === 'zh' ? row?.category_zh_name :
                                            locale === 'ko' ? row?.category_ko_name :
                                                row?.category_name}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                                    {convertDateTime(row?.created_at)}
                                </Typography>
                            </Box>
                        )}

                        {errorMessage && <Alert severity="error" sx={{ mt: 0.5 }}>{errorMessage}</Alert>}
                    </Stack>
                </DialogContent>

                <Divider />

                {/* Bottom actions — ONLY the confirm delete IconButton (right-aligned) */}
                <DialogActions sx={{ px: 1, py: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title={t('delete')} placement="top">
                        <span>
                            <IconButton
                                onClick={handleConfirmDelete}
                                aria-label={t('delete', 'Delete')}
                                disabled={submitting}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: 'error.main',
                                    color: 'error.contrastText',
                                    '&:hover': { bgcolor: 'error.dark' },
                                    '&:disabled': { bgcolor: 'action.disabledBackground' },
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                {submitting ? <CircularProgress size={20} thickness={5} /> : <DeleteForeverRoundedIcon />}
                            </IconButton>
                        </span>
                    </Tooltip>
                </DialogActions>
            </Dialog>


            {errorMessage && (
                <TableRow>
                    <TableCell colSpan={5} sx={{ border: 0 }}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </TableCell>
                </TableRow>
            )}
            <TableCell>
                {locale === 'en' ? row?.category_en_name :
                    locale === 'zh' ? row?.category_zh_name :
                        locale === 'ko' ? row?.category_ko_name :
                            row?.category_name}
            </TableCell>
            <TableCell>
                {row?.category_image ? (<DishImagePreview
                    src={process.env.NEXT_PUBLIC_API_BASE_URL2 + row?.category_image}
                />) : (<></>)}
            </TableCell>
            {!row?.parent_id && (
                <TableCell>
                    {row?.tax_rate && (<>
                        {row?.tax_rate?.tax_rate_name} ({row?.tax_rate?.tax_rate_value}%)
                    </>)}
                </TableCell>
            )}
            <TableCell>
                {row?.printers.reduce((a, x) => a += (a == '' ? '' : ', ') + x.printer_name, '')}
            </TableCell>
            <TableCell align="right">
                {convertDateTime(row?.created_at)}
            </TableCell>
            <TableCell>
                <IconButton
                    aria-label="delete"
                    color="error"
                    onClick={handleDeleteClick}
                    disabled={!row?.category_id}
                    sx={{ mr: 1 }}
                >
                    <DeleteIcon />
                </IconButton>
                <IconButton
                    aria-label="delete"
                    color="secondary"
                    onClick={onBack}
                >
                    <ArrowBackIcon />
                </IconButton>
            </TableCell>
        </>
    );
};

export default DeletePanel;
