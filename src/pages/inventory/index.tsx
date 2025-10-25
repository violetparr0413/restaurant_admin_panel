import { useState } from 'react';
import Table from './table';
import { Inventory } from '../../utils/info';
import { Alert, Box } from '@mui/material';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SearchBox from '@/_components/inventory/SearchBox';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function Page() {

    const [data, setData] = useState<Inventory[]>([]);
    const [infoMessage, setInfoMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isShow, setIsShow] = useState<boolean>(false);
    const [filterSupplierId, setFilterSupplierId] = useState<number>(0);
    const [time, setTime] = useState<string>('')
    
    return (
        <Box>
            <SearchBox refreshTime={setTime} refresh={setData} isShow={isShow} filterSupplier={setFilterSupplierId} filterSupplierId={filterSupplierId}/>
            {errorMessage && (
                <Alert sx={{mb:1}} severity="error">{errorMessage}</Alert>
            )}
            {infoMessage && (
                <Alert sx={{mb:1}} severity="success">{infoMessage}</Alert>
            )}
            <Table time={time} rows={data} info={setInfoMessage} error={setErrorMessage} setIsShow={setIsShow} filterSupplierId={filterSupplierId} setFilterSupplierId={setFilterSupplierId}/>
        </Box>
    )
}