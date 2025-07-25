import React, { useState } from 'react';
import { Box, Avatar, Dialog, DialogContent } from '@mui/material';

interface ParamProps {
  src: string;
}

const DishImagePreview: React.FC<ParamProps> = ({ src }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        position="relative"
        width={50}
        height={50}
        onClick={() => setOpen(true)}
        sx={{ cursor: 'pointer' }}
      >
        <Avatar
          src={src}
          variant="square"
          sx={{ width: '100%', height: '100%' }}
        />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 2,
            bgcolor: 'black',
          }}
        >
          <img
            src={src}
            alt="Dish Preview"
            style={{ maxWidth: '100%', maxHeight: '80vh' }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DishImagePreview;
