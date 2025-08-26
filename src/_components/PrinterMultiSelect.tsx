import { Printer } from '@/utils/info';
import {
    Box,
    Chip,
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
} from '@mui/material';
import { useMemo } from 'react';

interface PrinterMultiSelectProps {
    printers?: Printer[];
    value: number[];                      // selected printer_ids
    onChange: (ids: number[]) => void;    // lift state to parent
    label?: string;                       // e.g., t('printer')
    placeholder?: string;                 // e.g., t('select')
}

export default function PrinterMultiSelect({
    printers = [],
    value,
    onChange,
    label = 'Printer(s)',
    placeholder = 'select…',
}: PrinterMultiSelectProps) {
    const labelId = 'printer-multi-label';

    const nameById = useMemo(
        () =>
            new Map(
                (printers ?? []).map((p) => [p.printer_id, p.printer_name] as const)
            ),
        [printers]
    );

    const handleChange = (e: SelectChangeEvent<typeof value>) => {
        const v = e.target.value as unknown as (string[] | number[]);
        // Coerce string[] -> number[] just in case
        const ids =
            typeof v[0] === 'string' ? (v as string[]).map((x) => Number(x)) : (v as number[]);
        onChange(ids);
    };

    return (
        <FormControl fullWidth variant="outlined">
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select<number[]>
                labelId={labelId}
                multiple
                value={value ?? []}
                onChange={handleChange}
                label={label}
                renderValue={(selected) =>
                    selected.length ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as number[]).map((id) => (
                                <Chip key={id} label={nameById.get(id) ?? id} />
                            ))}
                        </Box>
                    ) : (
                        <em>{placeholder}</em>
                    )
                }
                MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
            >
                {(printers ?? []).map((x) => {
                    const checked = value.includes(x.printer_id);
                    return (
                        <MenuItem value={x.printer_id} key={x.printer_id}>
                            <Checkbox checked={checked} />
                            <ListItemText primary={x.printer_name} />
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}
