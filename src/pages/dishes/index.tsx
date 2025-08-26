import { useEffect, useState } from 'react';
import Table from './table';
import api from '@/utils/http_helper';
import { Dish } from '../../utils/info';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Alert, Box } from '@mui/material';
import DishSearchBox from '@/_components/dish/DishSearchBox';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

export default function Page() {

    const [data, setData] = useState<Dish[]>([]);

    return (
        <Box>
            <DishSearchBox refresh={setData}/>
            <Table rows={data} />
        </Box>
    )
}