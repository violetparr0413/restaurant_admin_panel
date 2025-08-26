import { useEffect, useState } from 'react';
import Table from './table';
import api from '@/utils/http_helper';
import { InventoryUnit } from '../../utils/info';
import { Alert, Box } from '@mui/material';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function Page() {

    const { t } = useTranslation('common')

    const [data, setData] = useState<InventoryUnit[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const refresh = () => {
        api.get('/unit') // your server endpoint
            .then(res => setData(res.data))
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    useEffect(() => {
        refresh()
    }, []);

    if (!data) {
        return <div>{t('loading')}...</div>;
    }

    return (
        <Box>
            {errorMessage && (
                <Alert severity="error">{errorMessage}</Alert>
            )}
            <Table rows={data} />
        </Box>
    )
}