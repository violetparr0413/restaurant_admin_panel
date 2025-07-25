import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from 'next-i18next';
import { CssBaseline, ThemeProvider } from '@mui/material';
import createAppTheme from "@/theme/theme";
import { useRouter } from "next/router";
import LanguageSwitcher from "@/_components/LanguageSwitcher/LanguageSwitcher";
import Layout from "@/_components/Layout/Layout";

import { Dashboard, Person3, Category, Person, Checklist, BrandingWatermark, History, TableView, Print, Logout, Payment } from '@mui/icons-material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

interface ISidebarItems {
    icon: React.ReactNode;
    label: string;
    url: string;
}

function App({ Component, pageProps }: AppProps) {

    const { t } = useTranslation('common')

    const sidebarItems: ISidebarItems[] = [
        {
            icon: <Dashboard />,
            label: t('dashboard'),
            url: '/dashboard'
        },
        {
            icon: <BrandingWatermark />,
            label: t('brand'),
            url: '/brand'
        },
        {
            icon: <Person3 />,
            label: t('users'),
            url: '/users'
        },
        {
            icon: <Category />,
            label: t('categories'),
            url: '/categories'
        },
        {
            icon: <Person />,
            label: t('employees'),
            url: '/employees'
        },
        {
            icon: <Checklist />,
            label: t('dishes'),
            url: '/dishes'
        },
        {
            icon: <ShoppingCartIcon />,
            label: t('orders'),
            url: '/orders'
        },
        {
            icon: <SupportAgentIcon />,
            label: t('services'),
            url: '/services'
        },
        {
            icon: <History />,
            label: t('service_history'),
            url: '/servicehistory'
        },
        {
            icon: <TableView />,
            label: t('tables'),
            url: '/tables'
        },
        {
            icon: <Print />,
            label: t('printers'),
            url: '/printers'
        },
        {
            icon: <Payment />,
            label: t('payment_methods'),
            url: '/payments'
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
    ]

    const { locale = 'ja' } = useRouter();

    const theme = createAppTheme(locale);
    const router = useRouter();
    const excludedRoutes = ['/auth/signin'];

    const isExcluded = excludedRoutes.includes(router.pathname);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {isExcluded && <Component {...pageProps} />}
            {!isExcluded && <Layout sidebarItems={sidebarItems} paths={paths}>
                <Component {...pageProps} />
            </Layout>}
            <LanguageSwitcher />
        </ThemeProvider>
    );
}

export default appWithTranslation(App);