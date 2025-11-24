import { useEffect, useState } from 'react';
import Table from './table';
import api from '@/utils/http_helper';
import { InventoryUnit } from '../../utils/info';
import { Alert, Box } from '@mui/material';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nookies from "nookies";
import axios from 'axios';

export async function getServerSideProps(ctx) {
  const { locale } = ctx;
  const cookies = nookies.get(ctx);
  const token = cookies.token;

  let datas = [];
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/unit`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    datas = res.data;
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
      datas,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default function Page({ datas }: { datas: InventoryUnit[] }) {

    const { t } = useTranslation('common')

    const [data, setData] = useState<InventoryUnit[]>(datas);
    const [errorMessage, setErrorMessage] = useState('');

    const refresh = async () => {
        try {
            const res = await api.get('/unit');
            setData(res.data);
        } catch (error: any) {
            if (error.response) {
                console.error(t('unexpected_error'), error);
                setErrorMessage(t('something_went_wrong'));
            }
        }
    }

    const handleDataChange = () => {
        refresh();
    };

    return (
        <Box>
            {errorMessage && (
                <Alert severity="error">{errorMessage}</Alert>
            )}
            <Table rows={data} onDataChange={handleDataChange} />
        </Box>
    )
}