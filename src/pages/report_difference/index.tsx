import { useState } from 'react';
import Table from './table';
import { ReportDifference } from '../../utils/info';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box } from '@mui/material';
import SearchBox from '@/_components/report/DifferenceSearchBox';
import nookies from "nookies";
import axios from 'axios';
import { getCurrentDate } from '@/utils/client_http_helpers';
import { convertDateTime1, convertDateTime2, get1MonthAgo } from '@/utils/http_helper';

export async function getServerSideProps(ctx) {
    const { locale } = ctx;
    const cookies = nookies.get(ctx);
    const token = cookies.token;

    const formData = new FormData();

    const today = getCurrentDate();
    const monthago = get1MonthAgo()

    formData.append('from', convertDateTime1(monthago));
    formData.append('to', convertDateTime2(today));

    let header_data = [];
    let inventoryDifference_data = [];
    try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get-inventory-difference`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        header_data = res.data.input_dates;
        inventoryDifference_data = res.data.inventoryDifference;
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
            header_data,
            inventoryDifference_data,
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}

export default function Page({ header_data, inventoryDifference_data }: { header_data: string[], inventoryDifference_data: ReportDifference[] }) {

    const [headers, setHeaders] = useState<string[]>(header_data);
    const [data, setData] = useState<ReportDifference[]>(inventoryDifference_data);

    return (
        <Box>
            <SearchBox headers={setHeaders} refresh={setData} url='/get-inventory-difference' />
            <Table headers={headers} rows={data} />
        </Box>
    )
}