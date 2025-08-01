import React, { useRef } from 'react';
import { Box, Avatar, IconButton } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';

type ParamTypes = {
  bgImages: File[];
  imagePaths: string[];
  handleFilesChange: (files: File[]) => void;
  handleImagePathsChange: (paths: string[]) => void;
};

const ImageBulkUploader: React.FC<ParamTypes> = ({
  bgImages,
  imagePaths,
  handleFilesChange,
  handleImagePathsChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    handleFilesChange([...bgImages, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // reset so same file can be re-added
    }
  };

  const handleRemoveLocalFile = (index: number) => {
    const updated = [...bgImages];
    updated.splice(index, 1);
    handleFilesChange(updated);
  };

  const handleRemoveImagePath = (index: number) => {
    const updated = [...imagePaths];
    updated.splice(index, 1);
    handleImagePathsChange(updated);
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      
      {/* Images from backend */}
      {imagePaths?.map((path, index) => (
        <Box key={`path-${index}`} position="relative" width={200} height={200} sx={{ borderRadius: 1, overflow: 'hidden' }}>
          <Avatar
            src={process.env.NEXT_PUBLIC_API_BASE_URL2 + path}
            variant="square"
            sx={{ width: '100%', height: '100%' }}
          />
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
            onClick={() => handleRemoveImagePath(index)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      {/* Local uploaded files */}
      {bgImages?.map((file, index) => (
        <Box key={`local-${index}`} position="relative" width={200} height={200} sx={{ borderRadius: 1, overflow: 'hidden' }}>
          <Avatar
            src={URL.createObjectURL(file)}
            variant="square"
            sx={{ width: '100%', height: '100%' }}
          />
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
            onClick={() => handleRemoveLocalFile(index)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      {/* Upload button */}
      <Box
        component="label"
        display="flex"
        alignItems="center"
        justifyContent="center"
        width={200}
        height={200}
        sx={{
          border: '2px dashed grey',
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
        }}
      >
        <UploadFileIcon />
        <input
          type="file"
          accept="image/*"
          hidden
          multiple
          ref={fileInputRef}
          onChange={handleFileInputChange}
        />
      </Box>
    </Box>
  );
};

export default ImageBulkUploader;
