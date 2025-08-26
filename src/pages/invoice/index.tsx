import { useState } from 'react';
import Table from './table';
import { InvoiceLog } from '../../utils/info';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box } from '@mui/material';
import InvoiceSearchBox from '@/_components/invoice/InvoiceSearchBox';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

export default function Page() {

    const [data, setData] = useState<InvoiceLog[]>([]);

    return (
        <Box>
            <InvoiceSearchBox refresh={setData}/>
            <Table rows={data} />
        </Box>
    )
}