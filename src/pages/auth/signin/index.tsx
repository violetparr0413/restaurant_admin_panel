import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import api from '@/utils/http_helper';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

interface ILoginResponse {
  status: string;
  message?: string;
  access_token?: string;
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function SignInPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onHandleSignIn = async () => {
    try {
      const response: ILoginResponse = (await api.post('/login', {
        username, password
      })).data;

      if (response.status == 'success') {
        localStorage.setItem('token', response.access_token!);
        router.push('/dashboard');
      } else {
        setErrorMessage(t(`login.${response.message}`));
      }
    } catch (err) {
      console.log(err);
      setErrorMessage(t('something_wrong'));
    }
  }

  return (
    <>
      <Box className="absolute top-0 lef-0 w-screen h-screen flex bg-cover bg-center p-4" sx={{ backgroundImage: 'url(/images/default-background.jpg)' }}>
        <Paper elevation={20} className='m-auto border-3 p-4 rounded-2xl! w-sm text-center'>
          <Box
            className='mx-auto mb-4'
            component='img'
            src={'/images/default-logo.png'}
            width={100}
          />
          <TextField
            className='mb-2!'
            label={t('username')}
            placeholder={t('login.enter_username')}
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            className='mb-2!'
            type="password"
            label={t('password')}
            placeholder={t('login.enter_password')}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Typography variant='caption' className='text-rose-700 mb-4! text-left block'>{errorMessage}</Typography>
          <Button fullWidth onClick={onHandleSignIn}>{t('login')}</Button>
        </Paper>
      </Box>
    </>
  );
}