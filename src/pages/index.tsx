import { useCallback, useEffect, useState } from 'react';
import api from '@/utils/http_helper';
import { useRouter } from 'next/router';

import { Backdrop, CircularProgress } from '@mui/material';

interface ICheckAuthResponse {
  status: string;
  user?: {
    user_id: number;
    user_role: string;
    username: string;
  }
}

export default function HomePage() {

  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const response: ICheckAuthResponse = (await api.get('/user')).data;

      if (response.status == 'success') {
        router.push('/dashboard');
      } else {
        router.push('/auth/signin');
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}