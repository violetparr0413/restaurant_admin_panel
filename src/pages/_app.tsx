import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from 'next-i18next';
import { CssBaseline, ThemeProvider } from '@mui/material';
import createAppTheme from "@/theme/theme";
import { useRouter } from "next/router";
import Layout from "@/_components/Layout/Layout";

import { Dashboard, Person3, Category, Person, Checklist, BrandingWatermark, History, TableView, Print, Logout, Payment, CardGiftcard, PinInvoke, AcUnit, PriorityHigh, Inventory2, Inventory, Support, Storefront, Handshake, Settings } from '@mui/icons-material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from "next/head";

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

interface ISidebarChildItems {
    label: string;
    url: string;
}

interface ISidebarItems {
    icon: React.ReactNode;
    label: string;
    url: string;
    childs: ISidebarChildItems[] | null;
}

function App({ Component, pageProps }: AppProps) {

    const { t } = useTranslation('common')

    const sidebarItems: ISidebarItems[] = [
        {
            icon: <Dashboard />,
            label: t('dashboard'),
            url: '/dashboard',
            childs: null,
        },
        {
            icon: <BrandingWatermark />,
            label: t('brand'),
            url: '/brand',
            childs: null,
        },
        {
            icon: <Person3 />,
            label: t('users'),
            url: '/users',
            childs: null,
        },
        {
            icon: <Category />,
            label: t('categories'),
            url: '/categories',
            childs: null,
        },
        {
            icon: <Person />,
            label: t('employees'),
            url: '/employees',
            childs: null,
        },
        {
            icon: <Checklist />,
            label: t('dishes'),
            url: '/dishes',
            childs: null,
        },
        {
            icon: <ShoppingCartIcon />,
            label: t('orders'),
            url: '/orders',
            childs: null,
        },
        {
            icon: <History />,
            label: t('services'),
            url: null,
            childs: [
                {
                    label: t('service_list'),
                    url: '/services',
                },
                {
                    label: t('service_history'),
                    url: '/servicehistory',
                },
            ]
        },
        {
            icon: <TableView />,
            label: t('tables'),
            url: '/tables',
            childs: null,
        },
        {
            icon: <Settings />,
            label: t('settings'),
            url: null,
            childs: [
                {
                    label: t('printers'),
                    url: '/printers',
                },
                {
                    label: t('payment_methods'),
                    url: '/payments',
                },
                {
                    label: t('tax_rates'),
                    url: '/tax_rate',
                },
            ]
        },
        {
            icon: <PinInvoke />,
            label: t('invoice_log'),
            url: '/invoice',
            childs: null,
        },
        {
            icon: <Inventory2 />,
            label: t('inventory'),
            url: null,
            childs: [
                {
                    label: t('inventory_unit'),
                    url: '/inventory_unit',
                },
                {
                    label: t('supplier'),
                    url: '/supplier',
                },
                {
                    label: t('inventory'),
                    url: '/inventory',
                },
                {
                    label: t('report_inventory'),
                    url: '/report_inventory',
                },
            ],
        }
    ];

    const paths = [
        { url: '/dashboard', label: t('dashboard') },
        { url: '/brand', label: t('brand') },
        { url: '/users', label: t('users') },
        { url: '/categories', label: t('categories') },
        { url: '/employees', label: t('employees') },
        { url: '/dishes', label: t('dishes') },
        { url: '/orders', label: t('orders') },
        { url: '/services', label: t('services') },
        { url: '/servicehistory', label: t('service_history') },
        { url: '/tables', label: t('tables') },
        { url: '/printers', label: t('printers') },
        { url: '/payments', label: t('payment_methods') },
        { url: '/tax_rate', label: t('tax_rates') },
        { url: '/invoice', label: t('invoice_log') },
        { url: '/inventory_unit', label: t('inventory_unit') },
        { url: '/supplier', label: t('supplier') },
        { url: '/inventory', label: t('inventory') },
        { url: '/report_inventory', label: t('report_inventory') },
    ]

    const { locale = 'ja' } = useRouter();

    const theme = createAppTheme(locale);
    const router = useRouter();
    const excludedRoutes = ['/auth/signin'];

    const isExcluded = router.pathname.startsWith('/client') || excludedRoutes.includes(router.pathname);

    return (
        <ThemeProvider theme={theme}>
            <Head>
                <title>千里香</title>
                <link rel="icon" href="/logo.ico" /> {/* Your logo or favicon */}
            </Head>
            <CssBaseline />
            {isExcluded && <Component {...pageProps} />}
            {!isExcluded && <Layout sidebarItems={sidebarItems} paths={paths}>
                <Component {...pageProps} />
            </Layout>}
        </ThemeProvider>
    );
}

export default appWithTranslation(App);