import { useEffect, useState } from 'react';
import Table from './table';
import api, { getCurrentTimeMin } from '@/utils/http_helper';
import { Inventory } from '../../utils/info';
import { Alert, Box } from '@mui/material';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SearchBox from '@/_components/inventory/SearchBox';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function Page() {

    const [data, setData] = useState<Inventory[]>([]);

    return (
        <Box>
            <SearchBox refresh={setData}/>
            <Table rows={data} />
        </Box>
    )
}