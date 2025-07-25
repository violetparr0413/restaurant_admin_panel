import { useEffect, useState } from 'react';
import Table from './table';
import { Category } from '@/utils/info';
import api from '@/utils/http_helper';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Alert } from '@mui/material';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

export default function Page({ }) {

    const { t } = useTranslation('common')

    const [data, setData] = useState<Category[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const refresh = () => {
        api.get('/category') // your server endpoint
            .then(res => setData(res.data))
            .catch(error => {
                if (error.response) {
                    console.error(t('unexpected_error'), error);
                    setErrorMessage(t('something_went_wrong'));
                }
            });
    }

    useEffect(() => {
        refresh()
    }, []);

    if (!data) {
        return <div>{t('loading')}...</div>;
    }

    const rows = data.sort((a, b) => (a.category_order < b.category_order ? -1 : 1));

    const parentRows: (Category & { childs: Category[] })[] = rows
        .filter(row => row?.parent_id === 0)
        .map(parent => ({
            ...parent,
            childs: [] as Category[] // ensure fresh empty childs array each render
        }));

    const childRows = rows.filter(row => row?.parent_id !== 0);

    childRows.forEach(childRow => {
        const parent = parentRows.find(parentRow => parentRow.category_id === childRow.parent_id);
        if (parent) {
            parent.childs.push(childRow); // safe, since parent.childs is fresh each render
        }
    });

    return (
        <>
            {errorMessage && (
                <Alert severity="error">{errorMessage}</Alert>
            )}
            <Table rows={parentRows} />
        </>
    )
}