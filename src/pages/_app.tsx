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
  const [initialized, setInitialized] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null); // null = unknown on first load

  const isPublicPath = useCallback(
    (p: string) => publicRoutes.some((r) => (r.endsWith('*') ? p.startsWith(r.slice(0, -1)) : p === r)),
    [publicRoutes]
  );

  const checkAuth = useCallback(async () => {
    try {
      const res = (await api.get('/user')).data;
      setAuthed(res?.status === 'success');
    } catch {
      setAuthed(false);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (isPublicPath(router.pathname)) {
      setAuthed(true);
      setInitialized(true);
    } else {
      checkAuth();
    }
  }, [router.pathname, isPublicPath, checkAuth]);

  // Handle client-side navigations
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      // Don't blank the screen on every navigation.
      // We only need to re-check when moving from a public route into a protected route
      // or if we haven't established auth yet.
      const nextPath = new URL(url, window.location.origin).pathname;
      if (!isPublicPath(nextPath) && authed === null) {
        // first load but navigation happened quickly — still initializing
        // let the initial backdrop show (initialized will still be false)
        return;
      }
      // Otherwise keep the UI mounted; optional: show a top progress bar instead.
    };

    const handleRouteChangeComplete = async (url: string) => {
      const nextPath = new URL(url, window.location.origin).pathname;
      if (isPublicPath(nextPath)) return;

      // If we don't know auth yet (rare) or user might have expired, re-check.
      if (authed === null) {
        await checkAuth();
      } else if (authed === false) {
        router.replace('/auth/signin');
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events, isPublicPath, authed, checkAuth, router]);

  // Initial gate only: show backdrop while we don't yet know
  if (!initialized) {
    return (
      <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  // If initialized and not authed on a protected route, redirect (and optionally keep UI)
  if (!isPublicPath(router.pathname) && authed === false) {
    // defensive: prevent flashing protected content
    router.replace('/auth/signin');
    return null;
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
        { url: '/inventory', label: t('raw_material') },
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