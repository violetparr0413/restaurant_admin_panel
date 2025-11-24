import { useState } from 'react';
import Table from './table';
import { InvoiceLog } from '../../utils/info';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box } from '@mui/material';
import InvoiceSearchBox from '@/_components/invoice/InvoiceSearchBox';
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

    formData.append('from_date', convertDateTime1(monthago));
    formData.append('to_date', convertDateTime2(today));

    let datas = [];
    try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get-guest-by-date`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        datas = res.data.data;
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

export default function Page({ datas }: { datas: InvoiceLog[] }) {

    const [data, setData] = useState<InvoiceLog[]>(datas);

    return (
        <Box>
            <InvoiceSearchBox refresh={setData}/>
            <Table rows={data} />
        </Box>
    )
}