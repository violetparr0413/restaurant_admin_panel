import { useState } from 'react';
import Table from './table';
import { ReportDifference } from '../../utils/info';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box } from '@mui/material';
import SearchBox from '@/_components/report/DifferenceSearchBox';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

export default function Page() {

    const [headers, setHeaders] = useState<string[]>([]);
    const [data, setData] = useState<ReportDifference[]>([]);

    return (
        <Box>
            <SearchBox headers={setHeaders} refresh={setData} url='/get-inventory-difference' />
            <Table headers={headers} rows={data} />
        </Box>
    )
}