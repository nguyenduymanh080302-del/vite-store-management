import { Alert, Card, Col, DatePicker, Empty, Flex, Row, Statistic, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import { useAppStore } from '@/stores/app.store'
import { useDashboardSummaryQuery } from '@/hooks'
import type { DashboardTopProduct } from '@/hooks/useDashboard'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import './index.scss'

const { RangePicker } = DatePicker

const formatAmount = (value: number, locale?: string) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        maximumFractionDigits: 2,
    }).format(value || 0)

export const DashboardContent = () => {
    const locale = useAppStore((state) => state.locale)
    const [range, setRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month'),
    ])

    const dashboardQuery = useDashboardSummaryQuery({
        from: range[0],
        to: range[1],
    })

    const summary = dashboardQuery.data

    const topProductsColumns: ColumnsType<DashboardTopProduct> = useMemo(() => [
        {
            title: 'Product',
            dataIndex: 'name',
            render: (value: string, record) => (
                <Flex vertical gap={2}>
                    <Typography.Text strong>{value}</Typography.Text>
                    <Typography.Text type="secondary">{record.unit}</Typography.Text>
                </Flex>
            ),
        },
        {
            title: 'Sold',
            dataIndex: 'quantity',
            align: 'right',
            width: 90,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            align: 'right',
            width: 140,
            render: (value: number) => formatAmount(value, locale),
        },
    ], [locale])

    const trendData = summary?.trend || []
    const topProducts = summary?.topProducts || []
    const completedOrders = summary?.totalOrders || 0
    const revenue = summary?.revenue || 0
    const profit = summary?.profit || 0
    const averageOrderValue = summary?.averageOrderValue || 0

    const chartTooltipFormatter = (value: unknown, name: unknown) => [
        formatAmount(Number(value || 0), locale),
        name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : name,
    ] as [string, string]

    return (
        <Flex vertical gap={16} className="dashboard-page">
            <Card className="dashboard-hero" bordered={false}>
                <Flex vertical gap={12}>
                    <Flex justify="space-between" align="start" gap={16} wrap>
                        <div>
                            <Typography.Title level={2} className="dashboard-title">
                                Sales Dashboard
                            </Typography.Title>
                            <Typography.Text className="dashboard-subtitle">
                                Monitor revenue, profit, and product performance for the selected date range.
                            </Typography.Text>
                        </div>

                        <RangePicker
                            value={range}
                            onChange={(values) => {
                                if (!values?.[0] || !values?.[1]) return
                                const [nextFrom, nextTo] = values[0].isAfter(values[1])
                                    ? [values[1], values[0]]
                                    : [values[0], values[1]]
                                setRange([nextFrom.startOf('day'), nextTo.endOf('day')])
                            }}
                            allowClear={false}
                            className="dashboard-range-picker"
                            format="DD/MM/YYYY"
                        />
                    </Flex>

                    <Typography.Text className="dashboard-range-text">
                        {range[0].format('DD MMM YYYY')} - {range[1].format('DD MMM YYYY')}
                    </Typography.Text>
                </Flex>
            </Card>

            {dashboardQuery.isError ? (
                <Alert
                    type="error"
                    showIcon
                    message="Failed to load dashboard data"
                    description="Please try again or check the order API connection."
                />
            ) : null}

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12} xl={6}>
                    <Card className="dashboard-stat-card" bordered={false}>
                        <Statistic
                            title="Revenue"
                            value={revenue}
                            formatter={(value) => formatAmount(Number(value), locale)}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <Card className="dashboard-stat-card" bordered={false}>
                        <Statistic
                            title="Profit"
                            value={profit}
                            formatter={(value) => formatAmount(Number(value), locale)}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <Card className="dashboard-stat-card" bordered={false}>
                        <Statistic
                            title="Completed Orders"
                            value={completedOrders}
                            formatter={(value) => Number(value).toLocaleString()}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <Card className="dashboard-stat-card" bordered={false}>
                        <Statistic
                            title="Average Order Value"
                            value={averageOrderValue}
                            formatter={(value) => formatAmount(Number(value), locale)}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} xl={16}>
                    <Card
                        className="dashboard-panel"
                        title="Sales Trend"
                        bordered={false}
                    >
                        <div className="dashboard-chart">
                            {trendData.length ? (
                                <ResponsiveContainer width="100%" height={340}>
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
                                                <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                                            </linearGradient>
                                            <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.28} />
                                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tickMargin={12} />
                                        <YAxis tickFormatter={(value) => formatAmount(Number(value), locale)} />
                                        <Tooltip formatter={chartTooltipFormatter} />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#0f766e"
                                            fill="url(#revenueFill)"
                                            strokeWidth={2}
                                            name="Revenue"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="profit"
                                            stroke="#38bdf8"
                                            fill="url(#profitFill)"
                                            strokeWidth={2}
                                            name="Profit"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="No completed orders in this date range" />
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} xl={8}>
                    <Card
                        className="dashboard-panel"
                        title="Top Selling Products"
                        bordered={false}
                    >
                        {topProducts.length ? (
                            <div className="dashboard-top-products">
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart
                                        data={topProducts.slice(0, 5).slice().reverse()}
                                        layout="vertical"
                                        margin={{ left: 24, right: 16 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis
                                            type="number"
                                            tickFormatter={(value) => Number(value).toLocaleString()}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={120}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip
                                            formatter={(value: unknown) => [
                                                Number(value || 0).toLocaleString(),
                                                'Sold',
                                            ]}
                                        />
                                        <Bar
                                            dataKey="quantity"
                                            fill="#0f766e"
                                            radius={[0, 10, 10, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>

                                <Table<DashboardTopProduct>
                                    size="small"
                                    pagination={false}
                                    rowKey="key"
                                    dataSource={topProducts}
                                    columns={topProductsColumns}
                                    className="dashboard-products-table"
                                    scroll={{ y: 260 }}
                                />
                            </div>
                        ) : (
                            <Empty description="No products sold in this date range" />
                        )}
                    </Card>
                </Col>
            </Row>
        </Flex>
    )
}

