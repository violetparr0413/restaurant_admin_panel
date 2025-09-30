import { useState } from 'react';
import Table from './table';
import { PurchaseHistory } from '../../utils/info';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box } from '@mui/material';
import SearchBox from '@/_components/purchase/SearchBox';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

export default function Page() {

    const [data, setData] = useState<PurchaseHistory[]>([]);

    return (
        <Box>
            <SearchBox refresh={setData} />
            <Table rows={data} />
        </Box>
    )
}