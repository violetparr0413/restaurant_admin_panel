import React from 'react';
import { Box, Avatar, IconButton } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';

type ParamTypes = {
    bgImages: File[] | [],
    imagePaths: string[] | [],
    handleBgImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleRemove: (index:number) => void
};

const BackgroundImagesUpload: React.FC<ParamTypes> = ({
  bgImages,
  imagePaths,
  handleBgImagesChange,
  handleRemove
}) => {

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      {/* Existing uploaded images (local files) */}
      {bgImages?.length > 0 &&
        bgImages?.map((file, index) => (
          <Box
            key={index}
            position="relative"
            width={200}
            height={200}
            sx={{ borderRadius: 1, overflow: 'hidden' }}
          >
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
              onClick={() => handleRemove(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

      {/* Existing images from backend paths */}
      {bgImages?.length === 0 &&
        imagePaths?.length > 0 &&
        imagePaths?.map((path, index) => (
          <Box
            key={index}
            position="relative"
            width={200}
            height={200}
            sx={{ borderRadius: 1, overflow: 'hidden' }}
          >
            <Avatar
              src={process.env.NEXT_PUBLIC_API_BASE_URL2 + path}
              variant="square"
              sx={{ width: '100%', height: '100%' }}
            />
          </Box>
        ))}

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
          onChange={handleBgImagesChange}
        />
      </Box>
    </Box>
  );
};

export default BackgroundImagesUpload;
