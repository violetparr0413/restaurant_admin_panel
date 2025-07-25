import React from "react";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Statistics } from "@/utils/info";
import { useTranslation } from 'next-i18next';

type ParamProps = {
    statistics: Statistics;
};

const Dashboard: React.FC<ParamProps> = ({ statistics }) => {

    const { t } = useTranslation('common')

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    return (
        <Box sx={{
            p: 4, 
            border: "1px solid #ccc",
            borderRadius: 1
        }}>
            <Typography variant="h4" gutterBottom>
                {t('statistics')}
            </Typography>

            <Grid container spacing={2}>
                {/* Total Paid */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1">{t('total_paid')}</Typography>
                            <Typography variant="h5">{t('currency_unit')} {statistics?.paidTotal}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total Unpaid */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1">{t('total_unpaid')}</Typography>
                            <Typography variant="h5">{t('currency_unit')} {statistics?.unpaidTotal}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Group Orders Section */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: 400, display: "flex", flexDirection: "column" }}>
                        <CardContent sx={{ flex: "0 0 auto" }}>
                            <Typography variant="h6" gutterBottom>
                                {t('group_orders_summary')}
                            </Typography>
                        </CardContent>
                        <Box sx={{ overflowY: "auto", flex: "1 1 auto" }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('dish_name')}</TableCell>
                                        <TableCell>{t('total_qty')}</TableCell>
                                        <TableCell>{t('total_value')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {statistics?.groupedOrders?.map((order) => (
                                        <TableRow key={order.dish_id}>
                                            <TableCell>{order.dish?.dish_name || "N/A"}</TableCell>
                                            <TableCell>{order.total_qty}</TableCell>
                                            <TableCell>{t('currency_unit')} {order.total_value}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('group_orders_bar_chart')}
                            </Typography>
                            <BarChart
                                width={400}
                                height={300}
                                data={statistics?.groupedOrders?.map(order => ({
                                    name: order.dish?.dish_name || "N/A",
                                    value: order.total_value,
                                }))}
                            >
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#1976d2" />
                            </BarChart>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Payment Orders Section */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: 400, display: "flex", flexDirection: "column" }}>
                        <CardContent sx={{ flex: "0 0 auto" }}>
                            <Typography variant="h6" gutterBottom>
                                {t('payment_orders_summary')}
                            </Typography>
                        </CardContent>
                        <Box sx={{ overflowY: "auto", flex: "1 1 auto" }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('payment_method')}</TableCell>
                                        <TableCell>{t('total_value')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {statistics?.paymentOrders?.map((order) => (
                                        <TableRow key={order.payment_method_id}>
                                            <TableCell>{order.payment_method_name}</TableCell>
                                            <TableCell>{t('currency_unit')} {order.total_value}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('payment_methods_pie_chart')}
                            </Typography>
                            <PieChart width={400} height={300}>
                                <Pie
                                    data={statistics?.paymentOrders}
                                    dataKey="total_value"
                                    nameKey="payment_method_name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label
                                    activeShape={false}
                                >
                                    {statistics?.paymentOrders?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box >
    );
};

export default Dashboard;
