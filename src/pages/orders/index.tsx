import { useState } from 'react';
import Table from './table';
import { Order } from '../../utils/info';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box } from '@mui/material';
import OrderSearchBox from '@/_components/orders/OrderSearchBox';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

export default function Page() {

    const [data, setData] = useState<Order[]>([]);

    return (
        <Box>
            <OrderSearchBox refresh={setData}/>
            <Table rows={data} />
        </Box>
    )
}