import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import OrderingComponent from "@/_components/OrderingComponent";
import ClientUIProvider from "@/_components/ClientUIProvider";
import Head from "next/head";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default function StartOrdering() {
  return (
    <>
      <Head>
        <title>Ordering</title>
        <link rel="icon" href="/logo.ico" />
      </Head>
      <ClientUIProvider>
        <OrderingComponent />
      </ClientUIProvider>
    </>
  );
}