import { useState } from 'react';
import Table from './table';
import { PurchaseHistory } from '../../utils/info';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box } from '@mui/material';
import SearchBox from '@/_components/purchase/SearchBox';
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

    formData.append('filter', "ALL");
    formData.append('from', convertDateTime1(monthago));
    formData.append('to', convertDateTime2(today));

    let datas = [];
    try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get-inventory-history`, formData, {
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

export default function Page({ datas }: { datas: PurchaseHistory[] }) {

    const [data, setData] = useState<PurchaseHistory[]>(datas);

    return (
        <Box>
            <SearchBox refresh={setData} />
            <Table rows={data} />
        </Box>
    )
}