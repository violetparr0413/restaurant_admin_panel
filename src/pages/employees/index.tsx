import { useEffect, useState } from 'react';
import Table from './table';
import api from '@/utils/http_helper';
import { Employee } from '../../utils/info';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Alert, Box } from '@mui/material';
import nookies from "nookies";
import axios from 'axios';

export async function getServerSideProps(ctx) {
  const { locale } = ctx;
  const cookies = nookies.get(ctx);
  const token = cookies.token;

  let datas = [];
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employee`, {
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

export default function Page({ datas }: { datas: Employee[] }) {

    const { t } = useTranslation('common')

    const [data, setData] = useState<Employee[]>(datas || []);
    const [errorMessage, setErrorMessage] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    const refresh = async () => {
        try {
            const res = await api.get('/employee');
            setData(res.data);
        } catch (error: any) {
            if (error.response) {
                console.error(t('unexpected_error'), error);
                setErrorMessage(t('something_went_wrong'));
            }
        }
    };

    const handleDataChange = () => {
        refresh()
    };

    return (
        <Box>
            {errorMessage && (
                <Alert sx={{ mb: 1 }} severity="error">{errorMessage}</Alert>
            )}
            {infoMessage && (
                <Alert sx={{ mb: 1 }} severity="success">{infoMessage}</Alert>
            )}
            <Table rows={data} info={setInfoMessage} error={setErrorMessage} onDataChange={handleDataChange} />
        </Box>
    )
}