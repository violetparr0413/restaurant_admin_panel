import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from 'next-i18next';
import { Backdrop, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import createAppTheme from "@/theme/theme";
import { useRouter } from "next/router";
import Layout from "@/_components/Layout/Layout";

import { Dashboard, Person3, Category, Person, Checklist, BrandingWatermark, History, TableView, Print, Logout, Payment, CardGiftcard, PinInvoke, AcUnit, PriorityHigh, Inventory2, Inventory, Support, Storefront, Handshake, Settings } from '@mui/icons-material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/utils/http_helper";
import FileDownload from "@mui/icons-material/FileDownload";

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

function AuthGuard({
    children,
    publicRoutes,
}: {
    children: React.ReactNode;
    publicRoutes: string[];
}) {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    const isPublic = useMemo(() => {
        const p = router.pathname;
        return publicRoutes.some((r) =>
            r.endsWith('*') ? p.startsWith(r.slice(0, -1)) : p === r
        );
    }, [router.pathname, publicRoutes]);

    const check = useCallback(
        async (url?: string) => {
            const path = url
                ? new URL(url, window.location.origin).pathname
                : router.pathname;

            const pathIsPublic = publicRoutes.some((r) =>
                r.endsWith('*') ? path.startsWith(r.slice(0, -1)) : path === r
            );

            if (pathIsPublic) {
                setReady(true);
                return;
            }

            try {
                const res = (await api.get('/user')).data;
                if (res?.status === 'success') {
                    setReady(true);
                } else {
                    setReady(false);
                    router.replace('/auth/signin');
                }
            } catch {
                setReady(false);
                router.replace('/auth/signin');
            }
        },
        [router, publicRoutes]
    );

    useEffect(() => {
        // initial load
        check();

        // handle client-side navigations
        const start = () => setReady(false);
        const done = (url: string) => check(url);

        router.events.on('routeChangeStart', start);
        router.events.on('routeChangeComplete', done);
        return () => {
            router.events.off('routeChangeStart', start);
            router.events.off('routeChangeComplete', done);
        };
    }, [check, router.events]);

    if (!ready) {
        return (
            <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open>
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

    return <>{children}</>;
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
                    label: t('product_unit'),
                    url: '/inventory_unit',
                },
                {
                    label: t('supplier'),
                    url: '/supplier',
                },
                {
                    label: t('raw_material'),
                    url: '/inventory',
                },
                {
                    label: t('inventory_report'),
                    url: '/report_inventory',
                },
                {
                    label: t('difference_report'),
                    url: '/report_difference',
                },
                {
                    label: t('purchase_history'),
                    url: '/purchase_history',
                },
            ],
        },
        {
            icon: <FileDownload />,
            label: t('downloads'),
            url: '/downloads',
            childs: null,
        },
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
        { url: '/inventory_unit', label: t('product_unit') },
        { url: '/supplier', label: t('supplier') },
        { url: '/inventory', label: t('inventory') },
        { url: '/report_inventory', label: t('inventory_report') },
        { url: '/report_difference', label: t('difference_report') },
        { url: '/purchase_history', label: t('purchase_history') },
        { url: '/downloads', label: t('downloads') },
    ]

    const { locale = 'ja' } = useRouter();
    const theme = createAppTheme(locale);
    const router = useRouter();

    // Treat these as public (no auth required). You can also support prefixes with '*'.
    const publicRoutes = ['/', '/auth/signin', '/client*'];

    const isExcluded =
        router.pathname.startsWith('/client') ||
        publicRoutes.includes(router.pathname);

    return (
        <ThemeProvider theme={theme}>
            <Head>
                <title>千里香</title>
                <link rel="icon" href="/logo.ico" />
            </Head>
            <CssBaseline />

            {/* Wrap everything with AuthGuard so protected routes don't render until checked */}
            <AuthGuard publicRoutes={publicRoutes}>
                {isExcluded ? (
                    <Component {...pageProps} />
                ) : (
                    <Layout sidebarItems={sidebarItems} paths={paths}>
                        <Component {...pageProps} />
                    </Layout>
                )}
            </AuthGuard>
        </ThemeProvider>
    );
}

export default appWithTranslation(App);