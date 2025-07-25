import SearchBox from '@/_components/dashboard/SearchBox';
import Dashboard from '@/_components/dashboard/dashboard';
import { Statistics } from '@/utils/info';
import { Box } from '@mui/material';
import { useState } from 'react';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

export default function Page() {


  const [data, setData] = useState<Statistics|null>(null);

  return (
    <Box>
       <SearchBox refresh={setData}/>
       <Dashboard statistics={data} />
    </Box>
  );
}