import Table from './table';
import { Category } from '@/utils/info';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nookies from "nookies";
import axios from 'axios';

export async function getServerSideProps(ctx) {
  const { locale } = ctx;
  const cookies = nookies.get(ctx);
  const token = cookies.token;

  let datas = [];
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/category`, {
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

export default function Page({ datas }: { datas: Category[] }) {
    const rows = datas.sort((a, b) => (a.category_order < b.category_order ? -1 : 1));

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
            <Table rows={parentRows} />
        </>
    )
}