import { useEffect, useState } from 'react';
import Table from './table';
import api from '@/utils/http_helper';
import { User } from '../../utils/info';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Alert, Box } from '@mui/material';
import nookies from "nookies";
import axios from 'axios';

export async function getServerSideProps(ctx) {
  const { locale } = ctx;
  const cookies = nookies.get(ctx);
  const token = cookies.token;

  let users = [];
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    users = res.data;
  } catch (error) {
    // optionally handle 401 → redirect
    if (error.response?.status === 401) {
      return {
        redirect: { destination: "/auth/signin", permanent: false },
      };
    }
  }

  return {
    props: {
      users,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default function Page({ users }: { users: User[] }) {
    const { t } = useTranslation('common');
    const [data, setData] = useState<User[]>(users || []);
    const [errorMessage, setErrorMessage] = useState('');

    const refresh = async () => {
        try {
            const res = await api.get('/users');
            setData(res.data);
        } catch (error: any) {
            if (error.response) {
                console.error(t('unexpected_error'), error);
                setErrorMessage(t('something_went_wrong'));
            }
        }
    };

    // ✅ keep data & cache in sync
    const handleDataChange = () => {
        refresh()
    };

    return (
        <Box>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <Table rows={data} onDataChange={handleDataChange} />
        </Box>
    );
}
