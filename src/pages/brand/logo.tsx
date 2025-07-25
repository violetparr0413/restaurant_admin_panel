import React from 'react';
import { Box, Avatar } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

type ParamTypes = {
    logoFile: File | null,
    logoFilePath: string,
    handleBrandChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const BrandLogoUpload: React.FC<ParamTypes> = ({ logoFile, logoFilePath, handleBrandChange }) => {

  return (
    <Box position="relative" width={100} height={100}>
      <Avatar
        src={
          logoFile
            ? URL.createObjectURL(logoFile)
            : logoFilePath
            ? process.env.NEXT_PUBLIC_API_BASE_URL2 + logoFilePath
            : undefined
        }
        variant="square"
        sx={{ width: '100%', height: '100%' }}
      />

      {/* Label overlay wraps input to trigger click */}
      <label
        htmlFor="brand-logo-upload"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
      >
        {/* Hover overlay */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'background-color 0.3s, opacity 0.3s',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              opacity: 1,
            },
          }}
        >
          <UploadFileIcon />
        </Box>
      </label>

      {/* Hidden input outside of label */}
      <input
        id="brand-logo-upload"
        type="file"
        accept="image/*"
        onChange={handleBrandChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
};

export default BrandLogoUpload;
