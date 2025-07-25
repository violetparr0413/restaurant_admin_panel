import React, { useState } from 'react';
import { Box, Avatar } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

type ParamTypes = {
    imageFile: File | null,
    imageFilePath: string,
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ImageUploader: React.FC<ParamTypes> = ({ imageFile, imageFilePath, handleImageChange }) => {

  return (
    <Box position="relative" width={50} height={50}>
      <Avatar
        src={
          imageFile
            ? URL.createObjectURL(imageFile)
            : imageFilePath
            ? process.env.NEXT_PUBLIC_API_BASE_URL2 + imageFilePath
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
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
};

export default ImageUploader;
