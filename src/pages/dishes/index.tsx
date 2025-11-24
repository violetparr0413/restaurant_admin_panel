import { useState } from 'react';
import Table from './table';
import { Dish } from '../../utils/info';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box } from '@mui/material';
import DishSearchBox from '@/_components/dish/DishSearchBox';
import nookies from "nookies";
import axios from 'axios';

export async function getServerSideProps(ctx) {
  const { locale } = ctx;
  const cookies = nookies.get(ctx);
  const token = cookies.token;

  let datas = [];
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/search-dish`, {}, {
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

export default function Page({ datas }: { datas: Dish[] }) {

    const [data, setData] = useState<Dish[]>(datas);

    return (
        <Box>
            <DishSearchBox refresh={setData}/>
            <Table rows={data} />
        </Box>
    )
}