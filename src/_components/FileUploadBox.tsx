import React, { useRef, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Stack,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTranslation } from 'next-i18next';

type FileUploadProps = {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const FileUpload: React.FC<FileUploadProps> = ({ onChange }) => {
    const { t } = useTranslation('common')

    const [fileName, setFileName] = useState<string>('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
        onChange(e); // Pass the full event to the parent
    };

    return (
        <Box>
            <input
                type="file"
                ref={inputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleChange}
            />
            <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                    variant="contained"
                    startIcon={<UploadFileIcon />}
                    onClick={handleClick}
                    size="large"
                    sx={{
                        borderRadius: '4px',
                        height: '56px',
                        textTransform: 'none',
                        backgroundColor: '#757575', // grey (Material Grey 600)
                        '&:hover': {
                            backgroundColor: '#616161', // darker grey (Material Grey 700)
                        },
                        color: 'white', // ensure text stays readable
                    }}
                >
                    {t('upload_image')}
                </Button>
                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {fileName || t('no_file_selected')}
                </Typography>
            </Stack>
        </Box>
    );
};

export default FileUpload;
