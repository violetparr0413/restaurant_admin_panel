"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Stack,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import clientApi, { getEpochValue } from "@/utils/client_http_helpers";
import { Dish, Order, Service } from "@/utils/info";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL2;
// -----------------------------
// Types
// -----------------------------

export type CartItem = {
    order_id: number;
    dish: Dish;
    qty: number;
};

export type ServiceItem = {
    id: number;
    name: string;
    qty: number;
};

export type OrderRecord = {
    id: string;
    items: CartItem[];
    total: number;
    createdAt: number; // epoch ms
    note?: string;
};

type ClientUIContextType = {
    categories: any[];
    logoPath: string;
    cartCount: number;
    orderCount: number;
    parentCategory: any;
    childCategory: any;
    dishes: any[];
    parentIndex: number;
    childIndex: number;

    cart: CartItem[];
    orderHistory: OrderRecord[];
    services: ServiceItem[];

    // openers for drawers
    openDish: (dish: Dish) => void;
    openCart: () => void;
    openCallService: () => void;
    openOrderHistory: () => void;

    // actions
    getDish: () => Promise<void>;
    setParentCategory: (v: any) => void;
    setChildCategory: (v: any) => void;
    setDishes: (v: any[]) => void;
    setParentIndex: (n: number) => void;
    setChildIndex: (n: number) => void;
    setCartCount: (n: number) => void;
    setOrderCount: (n: number) => void;

    // helpers others might use
    addToCart: (order_id: number, dish: Dish, qty?: number) => void;
};

const ClientUIContext = createContext<ClientUIContextType | undefined>(undefined);

export const useClientUI = () => {
    const ctx = useContext(ClientUIContext);
    if (!ctx) throw new Error("useClientUI must be used within <ClientUIProvider/>");
    return ctx;
};

// -----------------------------
// Provider with responsive Drawers
// -----------------------------
export default function ClientUIProvider(props: { children?: React.ReactNode }) {
    const { t } = useTranslation("common");

    const router = useRouter();
    const { locale } = router;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [categories, setCategories] = useState<any[]>([]);
    const [logoPath, setLogoPath] = useState("");
    const [cartCount, setCartCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [parentCategory, setParentCategory] = useState<any>({});
    const [childCategory, setChildCategory] = useState<any>({});
    const [dishes, setDishes] = useState<any[]>([]);
    const [parentIndex, setParentIndex] = useState(0);
    const [childIndex, setChildIndex] = useState(0);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [orderHistory, setOrderHistory] = useState<OrderRecord[]>([]);

    // Drawer state
    const [dishDrawer, setDishDrawer] = useState<{ open: boolean; dish?: Dish; qty: number }>({ open: false, qty: 1 });
    const [cartOpen, setCartOpen] = useState(false);
    const [serviceOpen, setServiceOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const getServices = useCallback(() => {
        clientApi.get("/service")
            .then((res) => {
                setServices(res.data.map((s: Service) => ({
                    id: s.service_id,
                    name: locale === 'en' ? s.service_en_name :
                        locale === 'zh' ? s.service_zh_name :
                            locale === 'ko' ? s.service_ko_name :
                                s.service_name,
                    qty: 0,
                })));
            })
            .catch((error) => {
                if (error.response) {
                    console.error(t("unexpected_error"), error);
                }
            });
    }, [t]);

    const getDish = useCallback(async () => {
        clientApi
            .get("/get-dish")
            .then((res) => {
                setCategories(res.data);
                setParentCategory(res.data[0]);
                if (res.data[0]["children"]?.length > 0) {
                    setChildCategory(res.data[0]["children"][0]);
                    setDishes(res.data[0]["children"][0]["dishes"]);
                    setChildIndex(0);
                } else {
                    setChildCategory({});
                    setDishes(res.data[0]["dishes"]);
                    setChildIndex(-1);
                }
                setParentIndex(0);
            })
            .catch((error) => {
                if (error.response) {
                    console.error(t("unexpected_error"), error);
                }
            });
    }, [t]);

    const getBrandInfo = useCallback(async () => {
        clientApi
            .get("/brand")
            .then((res) => {
                if (Object.keys(res.data).length !== 0) {
                    setLogoPath(res.data?.restaurant_logo);
                }
            })
            .catch((error) => {
                if (error.response) {
                    console.error(t("unexpected_error"), error);
                }
            });
    }, [setLogoPath, t]);

    const getIncartOrder = useCallback(async () => {
        clientApi
            .get(`/get-order-by-status/INCART`)
            .then((res) => {
                setCart(res.data.map((o: Order) => ({
                    order_id: o.order_id,
                    dish: {
                        dish_id: o.dish.dish_id,
                        dish_name: o.dish.dish_name,
                        dish_en_name: o.dish.dish_en_name,
                        dish_zh_name: o.dish.dish_zh_name,
                        dish_ko_name: o.dish.dish_ko_name,
                        dish_image: o.dish.dish_image,
                        dish_price: o.dish.dish_price,
                    },
                    qty: o.order_qty,
                })));
                setCartCount(res.data.length);
            })
            .catch((error) => {
                if (error.response) {
                    console.error(t("unexpected_error"), error);
                }
            });
    }, [setCart, setCartCount, t]);

    const getOrderedOrder = useCallback(async () => {
        clientApi
            .get(`/get-order-by-status/ORDERED`)
            .then((res) => {
                const grouped: Record<string, OrderRecord> = {};

                for (const order of res.data) {
                    const epochMs = getEpochValue(order.created_at)

                    if (!grouped[epochMs]) {
                        grouped[epochMs] = {
                            id: `ord_${epochMs}`,
                            items: [],
                            total: 0,
                            createdAt: epochMs
                        };
                    }

                    grouped[epochMs].items.push({
                        order_id: order.order_id,
                        dish: order.dish,
                        qty: order.order_qty
                    });

                    grouped[epochMs].total += order.dish.dish_price * order.order_qty;
                }

                const orderHistory = Object.values(grouped)
                setOrderHistory(orderHistory)
                setOrderCount(orderHistory.length);
            })
            .catch((error) => {
                if (error.response) {
                    console.error(t("unexpected_error"), error);
                }
            });
    }, [setOrderCount, t]);

    useEffect(() => {
        getServices();
        getDish();
        getBrandInfo();
        getIncartOrder();
        getOrderedOrder();
    }, [getDish, getBrandInfo, getOrderedOrder, getIncartOrder]);

    // -------- Cart helpers
    const addToCart = useCallback((order_id: number, dish: Dish, qty: number = 1) => {
        setCart(prev => {
            const existing = prev.find(ci => ci.dish.dish_id === dish.dish_id);
            if (existing) {
                return prev
                    .map(ci => (ci.dish.dish_id === dish.dish_id ? { ...ci, qty: Math.max(0, ci.qty + qty) } : ci))
                    .filter(ci => ci.qty > 0);
            }
            return [...prev, { order_id, dish, qty }];
        });
    }, []);

    const setItemQty = (dishId: number, qty: number) => {
        setCart(prev => prev
            .map(ci => (ci.dish.dish_id === dishId ? { ...ci, qty: Math.max(0, qty) } : ci))
            .filter(ci => ci.qty > 0));
    };

    const cartTotal = useMemo(() => cart.reduce((sum, ci) => sum + ci.qty * ci.dish.dish_price, 0), [cart]);

    // -------- Order helpers
    const commitOrder = () => {
        if (cart.length === 0) return;

        clientApi
            .post("/update-order-qty", {
                data: cart.map(ci => ({
                    order_id: ci.order_id,
                    order_qty: ci.qty,
                })),
            })
            .then((res) => {
                if (res.data.status) {
                    clientApi
                        .post("/update-order-status")
                        .then(() => {
                            const record: OrderRecord = {
                                id: `ord_${Date.now()}`,
                                items: cart.map(ci => ({ ...ci })),
                                total: cartTotal,
                                createdAt: Date.now(),
                            };

                            setOrderHistory(prev => [record, ...prev]);
                            setCart([]);
                            setCartCount(0);
                        }).catch((error) => {
                            if (error.response) {
                                console.error(t("unexpected_error"), error);
                            }
                        });
                }
            })
            .catch((error) => {
                if (error.response) {
                    console.error(t("unexpected_error"), error);
                }
            });

        setCartOpen(false);
        setHistoryOpen(true);
    };

    // -------- Service helpers
    const setServiceQty = (id: number, qty: number) => {
        setServices(prev => prev.map(s => (s.id === id ? { ...s, qty: Math.max(0, qty) } : s)));
    };

    const confirmService = () => {
        const requested = services.filter(s => s.qty > 0);
        if (requested.length === 0) {
            setServiceOpen(false);
            return;
        }
        clientApi
            .post("/service-history", {
                data: services.map(ci => ({
                    service_id: ci.id,
                    amount: ci.qty,
                })),
            })
            .then(() => {
            }).catch((error) => {
                if (error.response) {
                    console.error(t("unexpected_error"), error);
                }
            });
        setServices(services.map(s => ({ ...s, qty: 0 })));
        setServiceOpen(false);
    };

    // -------- Openers used by main page
    const openDish = (dish: Dish) => setDishDrawer({ open: true, dish, qty: 1 });
    const openCart = () => setCartOpen(true);
    const openCallService = () => setServiceOpen(true);
    const openOrderHistory = () => setHistoryOpen(true);

    const value = useMemo(
        () => ({
            categories,
            logoPath,
            cartCount,
            orderCount,
            parentCategory,
            childCategory,
            dishes,
            parentIndex,
            childIndex,
            cart,
            orderHistory,
            services,
            openDish,
            openCart,
            openCallService,
            openOrderHistory,
            addToCart,
            getDish,
            setParentCategory,
            setChildCategory,
            setDishes,
            setParentIndex,
            setChildIndex,
            setCartCount,
            setOrderCount,
        }),
        [
            categories,
            logoPath,
            cartCount,
            orderCount,
            parentCategory,
            childCategory,
            dishes,
            parentIndex,
            childIndex,
            cart,
            orderHistory,
            services,
            getDish
        ]
    );

    const paperSx = isMobile
        ? {
            height: "90vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: "hidden",
            px: 2,
            pt: 1,
            display: "flex",
            flexDirection: "column",
        }
        : {
            width: 400,
            height: "100vh",
            borderRadius: 0,
            px: 2,
            pt: 1,
            display: "flex",
            flexDirection: "column",
        } as const;

    return (
        <ClientUIContext.Provider value={value}>
            {props.children}

            <Drawer
                anchor={isMobile ? "bottom" : "right"}
                open={dishDrawer.open}
                onClose={() => setDishDrawer(p => ({ ...p, open: false }))}
                PaperProps={{ sx: paperSx }}
            >
                <TopBar isRed={false} title={t('dish_details')} onClose={() => setDishDrawer(p => ({ ...p, open: false }))} />

                <Box sx={{
                    flexShrink: 0,
                    mt: 2, mb: 2,
                    height: 250,
                    borderRadius: 2,
                    backgroundImage: `url("${backendUrl}/${dishDrawer.dish?.dish_image ?? ""}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h5" fontWeight={700}>{
                        locale === 'en' ? dishDrawer.dish?.dish_en_name :
                            locale === 'zh' ? dishDrawer.dish?.dish_zh_name :
                                locale === 'ko' ? dishDrawer.dish?.dish_ko_name :
                                    dishDrawer.dish?.dish_name
                    }</Typography>
                    <Typography variant="h5" fontWeight={700}>{formatJPY(dishDrawer.dish?.dish_price ?? 0)}</Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />

                <FooterBar>
                    <QtyStepper
                        value={dishDrawer.qty}
                        onDec={() => setDishDrawer(p => ({ ...p, qty: Math.max(1, p.qty - 1) }))}
                        onInc={() => setDishDrawer(p => ({ ...p, qty: p.qty + 1 }))}
                    />
                    <Button
                        variant="contained"
                        startIcon={<CheckIcon />}
                        sx={{ bgcolor: "#ffc83d", color: "black", '&:hover': { bgcolor: "#e6b836" } }}
                        onClick={() => {
                            if (dishDrawer.dish) {
                                clientApi
                                    .post("/order", {
                                        dish_id: dishDrawer.dish.dish_id,
                                        order_qty: dishDrawer.qty,
                                        order_status: "INCART",
                                    })
                                    .then((res) => {
                                        console.log("Added to cart:", res.data);
                                        // getIncartOrder();
                                        addToCart(res.data.order_id, dishDrawer.dish, dishDrawer.qty)
                                    });
                            };
                            setDishDrawer(p => ({ ...p, open: false }));
                            setCartOpen(true);
                        }}
                    >
                        {t('add_to_cart')} ({dishDrawer.qty})
                    </Button>
                </FooterBar>
            </Drawer>

            <Drawer anchor={isMobile ? "bottom" : "right"} open={cartOpen} onClose={() => setCartOpen(false)} PaperProps={{ sx: paperSx }}>
                <TopBar isRed={true} title={t('my_cart')} onClose={() => setCartOpen(false)} right={<Chip label={`Total ${formatJPY(cartTotal)}`} sx={{ bgcolor: "#ffc83d" }} />} />
                <Box sx={{ flex: 1, overflow: "auto", py: 1 }}>
                    {cart.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: "center" }}>
                            <Typography variant="body1" color="text.secondary">{t('your_cart_empty')}</Typography>
                        </Box>
                    ) : (
                        <List>
                            {cart.map(ci => (
                                <ListItem key={ci.dish.dish_id} secondaryAction={
                                    <QtyStepper
                                        size="small"
                                        value={ci.qty}
                                        onDec={() => setItemQty(ci.dish.dish_id, ci.qty - 1)}
                                        onInc={() => setItemQty(ci.dish.dish_id, ci.qty + 1)}
                                    />
                                }>
                                    <ListItemAvatar>
                                        <Avatar variant="rounded" src={`${backendUrl}/${ci.dish?.dish_image ?? ""}`} alt={
                                            locale === 'en' ? ci.dish?.dish_en_name :
                                                locale === 'zh' ? ci.dish?.dish_zh_name :
                                                    locale === 'ko' ? ci.dish?.dish_ko_name :
                                                        ci.dish?.dish_name
                                        } />
                                    </ListItemAvatar>
                                    <ListItemText primary={locale === 'en' ? ci.dish?.dish_en_name :
                                        locale === 'zh' ? ci.dish?.dish_zh_name :
                                            locale === 'ko' ? ci.dish?.dish_ko_name :
                                                ci.dish?.dish_name} secondary={formatJPY(ci.dish.dish_price)} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
                <FooterBar>
                    <Button
                        variant="contained"
                        onClick={commitOrder}
                        fullWidth
                        // disabled={cart.length === 0}
                        sx={{ bgcolor: "#ffc83d", color: "black", '&:hover': { bgcolor: "#e6b836" } }}>
                        {t('confirm_order')}
                    </Button>
                </FooterBar>
            </Drawer>

            <Drawer anchor={isMobile ? "bottom" : "right"} open={serviceOpen} onClose={() => setServiceOpen(false)} PaperProps={{ sx: paperSx }}>
                <TopBar isRed={true} title={t('call_service')} onClose={() => setServiceOpen(false)} />
                <Box sx={{ flex: 1, overflow: "auto", py: 1 }}>
                    <List>
                        {services.map(s => (
                            <ListItem key={s.id} secondaryAction={
                                <QtyStepper
                                    size="small"
                                    value={s.qty}
                                    onDec={() => setServiceQty(s.id, s.qty - 1)}
                                    onInc={() => setServiceQty(s.id, s.qty + 1)}
                                />
                            }>
                                <ListItemText primary={s.name} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <FooterBar>
                    <Button variant="contained" fullWidth sx={{ bgcolor: "#ffc83d", color: "black", '&:hover': { bgcolor: "#e6b836" } }} onClick={confirmService}>
                        {t('confirm')}
                    </Button>
                </FooterBar>
            </Drawer>

            {/* Order History Drawer */}
            <Drawer anchor={isMobile ? "bottom" : "right"} open={historyOpen} onClose={() => setHistoryOpen(false)} PaperProps={{ sx: paperSx }}>
                <TopBar isRed={true} title={t('order_history')} onClose={() => setHistoryOpen(false)} />
                <Box sx={{ flex: 1, overflow: "auto", py: 1 }}>
                    {orderHistory.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: "center" }}>
                            <Typography variant="body1" color="text.secondary">{t('no_orders_yet')}</Typography>
                        </Box>
                    ) : (
                        <List>
                            {orderHistory.map((o) => (
                                <Box key={o.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Stack
                                                    direction="row"
                                                    alignItems="center"
                                                    spacing={1}
                                                    sx={{ flexWrap: "wrap", wordBreak: "break-word" }}
                                                >
                                                    <Typography fontWeight={700} sx={{ whiteSpace: "nowrap" }}>
                                                        {new Date(o.createdAt).toLocaleString()}
                                                    </Typography>
                                                    {!o.note && (
                                                        <Chip size="small" sx={{ bgcolor: "#ffc83d", color: "black" }} label={formatJPY(o.total)} />
                                                    )}
                                                </Stack>
                                            }
                                            secondary={
                                                !o.note ? (
                                                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                                                        {o.items.map(ci => (
                                                            <Typography
                                                                key={ci.dish.dish_id}
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
                                                            >
                                                                {locale === 'en' ? ci.dish?.dish_en_name :
                                                                    locale === 'zh' ? ci.dish?.dish_zh_name :
                                                                        locale === 'ko' ? ci.dish?.dish_ko_name :
                                                                            ci.dish?.dish_name} × {ci.qty} — {formatJPY(ci.dish.dish_price * ci.qty)}
                                                            </Typography>
                                                        ))}
                                                    </Stack>
                                                ) : (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mt: 1, whiteSpace: "normal", wordBreak: "break-word" }}
                                                    >
                                                        {o.note}
                                                    </Typography>
                                                )
                                            }
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </Box>
                            ))}
                        </List>
                    )}
                </Box>
            </Drawer>
        </ClientUIContext.Provider>
    );
}

// -----------------------------
// Utilities & small UI pieces
// -----------------------------
const formatJPY = (n: number) => `${n.toLocaleString()}円`;

function TopBar({ isRed, title, onClose, right }: { isRed: boolean, title: string; onClose: () => void; right?: React.ReactNode }) {
    return (
        isRed ? (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, borderBottom: "1px solid #cc3333" }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#cc3333" }}>{title}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {right}
                    <IconButton onClick={onClose} aria-label="Close" sx={{ color: "#cc3333" }}><CloseIcon /></IconButton>
                </Box>
            </Box>
        ) : (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, borderBottom: "1px solid #ddd" }}>
                <Typography variant="h6" fontWeight={700}>{title}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {right}
                    <IconButton onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
                </Box>
            </Box>
        )
    );
}

function FooterBar({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #ddd", py: 2, gap: 1 }}>
            {children}
        </Box>
    );
}

function QtyStepper({ value, onDec, onInc, size = "medium" as "small" | "medium" }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <IconButton aria-label="decrease quantity" onClick={onDec} size={size} sx={{ bgcolor: "#ffc83d" }}>
                <RemoveIcon />
            </IconButton>
            <Typography variant={size === "small" ? "body1" : "h6"} sx={{ minWidth: 24, textAlign: "center" }}>{value}</Typography>
            <IconButton aria-label="increase quantity" onClick={onInc} size={size} sx={{ bgcolor: "#ffc83d" }}>
                <AddIcon />
            </IconButton>
        </Stack>
    );
}
