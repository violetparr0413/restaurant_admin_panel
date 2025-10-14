import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    TextField,
    Select,
    MenuItem,
    Box,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Stack,
    Alert,
    Grid,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Category, Dish, Inventory, Printer } from '@/utils/info';
import api, { convertDateTime, uploader } from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import PrinterMultiSelect from '@/_components/PrinterMultiSelect';
import ImageUploader from '@/_components/ImageUploader';
import MiniTable, { MiniTableColumn } from '@/_components/dish/MiniTable';

type EditPanelProps = {
    row: Dish
    onBack: () => void;
    onSave: (data: Dish) => void;
};

const EditPanel: React.FC<EditPanelProps> = ({ row, onBack, onSave }) => {

    const { t } = useTranslation('common')

    const DISH_STATUS = [
        '---',
        t('takeout'),
        t('popular'),
        t('extra'),
    ];

    const [category, setCategory] = useState<number>(0);
    const [subcategory, setSubCategory] = useState<number>(0);

    const [name, setName] = useState<string>(row?.dish_name);
    const [unit, setUnit] = useState<string>(row?.dish_unit);
    const [status, setStatus] = useState<number>(row?.dish_status);
    const [price, setPrice] = useState<number>(row?.dish_price);
    // const [taxPrice, setTaxPrice] = useState<number>(row?.tax_price);
    const [image, setImage] = useState<File | null>(null);
    const [available, setAvailable] = useState<boolean>(row?.dish_available ? true : false);
    const [description, setDescription] = useState<string>(row?.dish_description);
    const [youtubeUrl, setYoutubeUrl] = useState<string>(row?.youtube_url);
    const [printerIds, setPrinterIds] = useState<number[]>(row?.printers?.map(x => x.printer_id) || []);

    const [errorMessage, setErrorMessage] = useState('');

    const [categories, setCategories] = useState<Category[] | null>(null);
    const [subCategories, setSubCategories] = useState<Category[] | null>(null);
    const [printers, setPrinters] = useState<Printer[] | null>(null);

    const initCols: MiniTableColumn[] = [
        {
            key: "inventory_id", label: t('ingredient'), width: "20ch", input: {
                type: "select",
                required: true,
                options: [],
                placeholder: t('select')
            }
        },
        {
            key: "quantity", label: t('quantity'), width: "10ch", input: {
                type: "number",
                required: true,
                placeholder: "0",
            }
        }
    ]

    type SubRow = { inventory_id: number; quantity: number }

    const [cols, setCols] = useState<MiniTableColumn[]>(initCols);

    const [rows, setRows] = useState<SubRow[]>(() =>
        (row?.ingredients ?? []).map(x => ({
            inventory_id: Number(x?.inventory_id ?? 0),
            quantity: Number(x?.quantity ?? 0)
        })));

    function handleRowsChange(newRows: SubRow[]) {
        setRows(newRows.map((row) => ({
            inventory_id: row.inventory_id,
            quantity: row.quantity
        })))
    }

    const getInventories = () => {
        api.get('/inventory') // your server endpoint
            .then(res => {
                initCols[0].input.options = res.data?.map((inv: Inventory) => ({
                    label: `${inv.name} (${inv.unit?.unit_name})`,
                    value: inv.inventory_id
                }))
                setCols(initCols)
                // setInventories(res.data)
            }).catch(error => {
                console.error(t('unexpected_error'), error);
            });
    }

    const initAttributeCols: MiniTableColumn[] = [
        {
            key: "name", label: t('name'), width: "10ch", input: {
                type: "text",
                required: true,
            }
        },
        {
            key: "extra_price", label: t('extra_price'), width: "10ch", input: {
                type: "number",
                // required: true,
                placeholder: "0",
            }
        },
        {
            key: "is_required", label: t('is_required'), width: "10ch", input: {
                type: "select",
                required: true,
                options: [
                    { label: t('required'), value: 1 },
                    { label: t('optional'), value: 0 }
                ],
                placeholder: t('select')
            }
        }
    ]

    type SubRow2 = { name: string; extra_price: number, is_required: number }

    const [cols2, setCols2] = useState<MiniTableColumn[]>(initAttributeCols);
    const [rows2, setRows2] = useState<SubRow2[]>(() =>
        (JSON.parse(row?.extra_setting) ?? []).map(x => ({
            name: x?.name ?? '',
            extra_price: Number(x?.extra_price ?? 0),
            is_required: Number(x?.is_required ?? 0)
        })));

    function handleRows2Change(newRows: SubRow2[]) {
        setRows2(newRows.map((row) => ({
            name: row.name,
            extra_price: Number(row.extra_price),
            is_required: Number(row.is_required)
        })))
    }

    const getCategoryData = () => {
        api.get('/category') // your server endpoint
            .then(res => {
                const rows = res.data
                const parentRows = rows.filter((row: { parent_id: number; }) => row?.parent_id === 0);
                setCategories(parentRows)
                const target = parentRows.find((x: { category_id: number; }) => x.category_id === row?.category_id)

                if (target) {
                    setCategory(row?.category_id)
                    api.get(`/get-child-category/${row?.category_id}`)
                        .then(res => {
                            setSubCategories(res.data.categories)
                        }).catch(error => {
                            if (error.response) {
                                console.error(t('unexpected_error'), error);
                                setErrorMessage(t('something_went_wrong'));
                            }
                        });
                } else {
                    setSubCategory(row?.category_id)
                    setCategory(row?.category.parent_id)
                    api.get(`/get-child-category/${row?.category.parent_id}`)
                        .then(res => {
                            setSubCategories(res.data.categories)
                        }).catch(error => {
                            if (error.response) {
                                console.error(t('unexpected_error'), error);
                                setErrorMessage(t('something_went_wrong'));
                            }
                        });
                }
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    const getPrinters = () => {
        uploader.get('/printer') // your server endpoint
            .then(res => {
                setPrinters(res.data.filter(x => x.position !== 'COUNTER'))
            })
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    React.useEffect(() => {
        getCategoryData()
        getPrinters()
        getInventories()
        // getInventories()
    }, []);

    const router = useRouter();
    const { locale } = router;

    React.useEffect(() => {
        const name = locale === 'en' ? row?.dish_en_name :
            locale === 'zh' ? row?.dish_zh_name :
                locale === 'ko' ? row?.dish_ko_name :
                    row?.dish_name
        setName(name ? name : '')

        const description = locale === 'en' ? row?.dish_en_description :
            locale === 'zh' ? row?.dish_zh_description :
                locale === 'ko' ? row?.dish_ko_description :
                    row?.dish_description
        setDescription(description ? description : '')

        const unit = locale === 'en' ? row?.dish_en_unit :
            locale === 'zh' ? row?.dish_zh_unit :
                locale === 'ko' ? row?.dish_ko_unit :
                    row?.dish_unit
        setUnit(unit ? unit : '')
    }, [locale]);

    const handleSave = () => {
        if (name && categories) {
            const formData = new FormData();

            formData.append("_method", "put")

            locale === 'en' ? formData.append('dish_en_name', name) :
                locale === 'zh' ? formData.append('dish_zh_name', name) :
                    locale === 'ko' ? formData.append('dish_ko_name', name) :
                        formData.append('dish_name', name);

            if (description) {
                locale === 'en' ? formData.append('dish_en_description', description) :
                    locale === 'zh' ? formData.append('dish_zh_description', description) :
                        locale === 'ko' ? formData.append('dish_ko_description', description) :
                            formData.append('dish_description', description);
            }

            if (unit) {
                locale === 'en' ? formData.append('dish_en_unit', unit) :
                    locale === 'zh' ? formData.append('dish_zh_unit', unit) :
                        locale === 'ko' ? formData.append('dish_ko_unit', unit) :
                            formData.append('dish_unit', unit);
            }

            image && formData.append('dish_image', image);
            youtubeUrl && formData.append('youtube_url', youtubeUrl);
            formData.append('dish_status', status.toString());
            subcategory ? formData.append('category_id', subcategory.toString()) : formData.append('category_id', category.toString());
            (price !== null) && formData.append('dish_price', price.toString());
            // (taxPrice !== null) && formData.append('tax_price', taxPrice.toString());
            (available !== null) && formData.append('dish_available', available ? '1' : '0');
            printerIds && formData.append('printer_ids', JSON.stringify(printerIds));
            rows && formData.append('ingredient', JSON.stringify(rows))
            rows2 && formData.append('extra_setting', JSON.stringify(rows2))

            uploader.post(`/dish/${row?.dish_id}`, formData)
                .then(res => onSave(res.data))
                .catch(error => {
                    if (error.response && error.response.status === 422) {
                        // Validation error from server
                        console.log(error.response.data);
                        // setErrorMessage(error.response.data.message);
                        setErrorMessage(t('something_went_wrong'));
                    } else {
                        // Other errors
                        console.error(t('unexpected_error'), error);
                        setErrorMessage(t('something_went_wrong'));
                    }
                })
        } else {
            if (!name) setErrorMessage(t('name_field_required'));
            if (!categories) setErrorMessage(t('categories_field_required'));
        }
    };

    const onCategoryChange = (id: number) => {
        api.get(`/get-child-category/${id}`) // your server endpoint
            .then(res => setSubCategories(res.data.categories))
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    return (
        <TableRow>
            <TableCell colSpan={9}>
                <Box p={3}>
                    <Grid container spacing={2}>
                        {errorMessage && (
                            <Grid size={{ xs: 12 }}>
                                <Alert severity="error">{errorMessage}</Alert>
                            </Grid>)}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 2 }}>
                                <ImageUploader handleImageChange={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    if (target.files && target.files[0]) {
                                        setImage(target.files[0]);
                                    }
                                }} imageFile={image} imageFilePath={row?.dish_image} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 10 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <InputLabel>{t('category')}</InputLabel>
                                            <Select
                                                required
                                                value={category}
                                                onChange={(e) => {
                                                    setCategory(Number(e.target.value))
                                                    onCategoryChange(Number(e.target.value))
                                                }}
                                                label={t('category')}
                                            >
                                                <MenuItem value={0}>{t('select')}</MenuItem>
                                                {categories?.map((x) => (
                                                    <MenuItem value={x.category_id}>
                                                        {locale === 'en' ? x?.category_en_name :
                                                            locale === 'zh' ? x?.category_zh_name :
                                                                locale === 'ko' ? x?.category_ko_name :
                                                                    x?.category_name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <InputLabel>{t('subcategory')}</InputLabel>
                                            <Select
                                                required
                                                value={subcategory}
                                                onChange={(e) => {
                                                    setSubCategory(Number(e.target.value))
                                                }}
                                                label={t('subcategory')}
                                            >
                                                <MenuItem value={0}>{t('select')}</MenuItem>
                                                {subCategories && subCategories?.map((x) => (
                                                    <MenuItem value={x.category_id}>
                                                        {locale === 'en' ? x?.category_en_name :
                                                            locale === 'zh' ? x?.category_zh_name :
                                                                locale === 'ko' ? x?.category_ko_name :
                                                                    x?.category_name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>

                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            required
                                            label={t('name')}
                                            name="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <InputLabel>{t('status')}</InputLabel>
                                            <Select
                                                required
                                                value={status}
                                                onChange={(e) => {
                                                    setStatus(Number(e.target.value))
                                                }}
                                                label={t('status')}
                                            >
                                                {Object.entries(DISH_STATUS)?.map(([key, value]) => (
                                                    <MenuItem key={key} value={key}>{value}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <PrinterMultiSelect
                                            printers={printers}
                                            value={printerIds}
                                            onChange={setPrinterIds}
                                            label={t('printer')}
                                            placeholder={t('select')}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label={t('unit')}
                                            name="unit"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label={t('price')}
                                            name="price"
                                            value={price}
                                            onChange={(e) => setPrice(Number(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label={t('youtube_url')}
                                            name="youtube_url"
                                            value={youtubeUrl}
                                            onChange={(e) => setYoutubeUrl(e.target.value)}
                                        />
                                        {/* <TextField
                                    fullWidth
                                    label={t('tax_price')}
                                    name="tax_price"
                                    value={taxPrice}
                                    onChange={(e) => setTaxPrice(Number(e.target.value))}
                                /> */}
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FormControl component="fieldset" variant="standard">
                                            <FormControlLabel
                                                control={
                                                    <Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} name="gilad" />
                                                }
                                                sx={{ mt: 1, ml: 1 }}
                                                label={t('dish_availability')}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <TextField
                                            fullWidth
                                            name="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            label={t('description')}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 12 }}>
                                        <MiniTable
                                            columns={cols}
                                            value={rows}
                                            onChange={handleRowsChange}
                                            dense
                                            maxHeight={128}
                                            addLabel="Add detail"
                                            showIndex={false}
                                        // className="my-mini-table"  // optional hook
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 12 }}>
                                        <MiniTable
                                            columns={cols2}
                                            value={rows2}
                                            onChange={handleRows2Change}
                                            dense
                                            maxHeight={128}
                                            addLabel="Add detail"
                                            showIndex={false}
                                        // className="my-mini-table"  // optional hook
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </TableCell>
            <TableCell>
                <IconButton
                    aria-label="save"
                    color="primary"
                    onClick={handleSave}
                    sx={{ mr: 1 }}
                >
                    <SaveIcon />
                </IconButton>
                <IconButton
                    aria-label="save"
                    color="secondary"
                    onClick={onBack}
                >
                    <ArrowBackIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};

export default EditPanel;
