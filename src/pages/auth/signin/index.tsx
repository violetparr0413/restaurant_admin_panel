import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';
import api from '@/utils/http_helper';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PasswordInput from '@/_components/PasswordInput';
import LanguageSwitcher from '@/_components/LanguageSwitcher/LanguageSwitcher';

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

  const [LogoPath, setLogoPath] = useState('');

  const onHandleSignIn = async () => {
    try {
      const response: ILoginResponse = (await api.post('/login', {
        username, password
      })).data;

      if (response.status == 'success') {
        localStorage.setItem('token', response.access_token!);
        router.push('/dashboard');
      } else {
        setErrorMessage(t(`login.invalid_credentials`));
      }
    } catch (err) {
      console.log(err);
      setErrorMessage(t('something_wrong'));
    }
  }

  const refresh = useCallback(async () => {
    api.get('/brand') // your server endpoint
      .then(res => {
        setLogoPath(res.data?.restaurant_logo)
      })
      .catch(error => {
        if (error.response) {
          console.error(t('unexpected_error'), error);
          setErrorMessage(t('something_went_wrong'));
        }
      });
  }, [t])

  useEffect(() => {
    refresh()
  }, [refresh]);

  return (
    <>
      <Box className="absolute top-0 lef-0 w-screen h-screen flex bg-cover bg-center p-4" sx={{ backgroundImage: 'url(/images/default-background.jpg)' }}>
        <Paper
          elevation={20}
          className="relative m-auto border-3 p-4 rounded-2xl! w-sm text-center"
        >
          <Box className="absolute top-2 right-2 text-blue-400">
            <LanguageSwitcher />
          </Box>
          <Box
            className='mx-auto mb-4'
            component='img'
            src={LogoPath ? process.env.NEXT_PUBLIC_API_BASE_URL2 + LogoPath : ''}
            width={100}
          />
          <TextField
            className='mb-2!'
            label={t('username')}
            placeholder={t('login.enter_username')}
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputLabelProps={{
              shrink: true, // keeps the label fixed at the top
            }}
          />
          <PasswordInput password={password} setPassword={setPassword} required={false} />
          <Typography variant='caption' className='text-rose-700 mb-4! text-left block'>{errorMessage}</Typography>
          <Button fullWidth onClick={onHandleSignIn}>{t('login')}</Button>
        </Paper>
      </Box>
    </>
  );
}