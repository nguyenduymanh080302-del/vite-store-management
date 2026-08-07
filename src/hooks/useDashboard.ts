import { useSuspenseQuery } from '@tanstack/react-query'
import dayjs, { Dayjs } from 'dayjs'
import { fetchDashboardOrders } from '@/apis/order.api'

export type DashboardRange = {
    from: Dayjs
    to: Dayjs
}

export type DashboardTrendPoint = {
    date: string
    label: string
    revenue: number
    profit: number
    orders: number
}

export type DashboardTopProduct = {
    key: string
    productId: number
    name: string
    unit: string
    quantity: number
    revenue: number
}

export type DashboardSummary = {
    orders: Order[]
    totalOrders: number
    revenue: number
    profit: number
    averageOrderValue: number
    trend: DashboardTrendPoint[]
    topProducts: DashboardTopProduct[]
}

const formatDateKey = (value: Dayjs) => value.format('YYYY-MM-DD')

const createEmptyTrend = (from: Dayjs, to: Dayjs) => {
    const points: DashboardTrendPoint[] = []
    let cursor = from.startOf('day')
    const end = to.endOf('day')

    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
        points.push({
            date: formatDateKey(cursor),
            label: cursor.format('DD/MM'),
            revenue: 0,
            profit: 0,
            orders: 0,
        })

        cursor = cursor.add(1, 'day')
    }

    return points
}

const buildDashboardSummary = (orders: Order[], from: Dayjs, to: Dayjs): DashboardSummary => {
    const start = from.startOf('day')
    const end = to.endOf('day')
    const trendMap = new Map<string, DashboardTrendPoint>()
    const productMap = new Map<string, DashboardTopProduct>()

    const trend = createEmptyTrend(start, end)
    trend.forEach((point) => trendMap.set(point.date, point))

    let revenue = 0
    let profit = 0

    orders.forEach((order) => {
        const orderDate = dayjs(order.createdAt)
        if (orderDate.isBefore(start) || orderDate.isAfter(end)) return

        const orderRevenue = Number(order.totalAmount || 0) + Number(order.vatValue || 0) - Number(order.discountValue || 0)
        const orderProfit = Number(order.profit || 0)
        revenue += orderRevenue
        profit += orderProfit

        const dayKey = formatDateKey(orderDate)
        const trendPoint = trendMap.get(dayKey)
        if (trendPoint) {
            trendPoint.revenue += orderRevenue
            trendPoint.profit += orderProfit
            trendPoint.orders += 1
        }

        order.products.forEach((item) => {
            const productId = item.productUnit?.product?.id ?? item.productId
            const productName = item.productUnit?.product?.name ?? `Product #${item.productId}`
            const unitName = item.productUnit?.unit?.name ?? `Unit #${item.unitId}`
            const quantity = Number(item.quantity || 0)
            const lineRevenue = quantity * (Number(item.sellPrice || 0) + Number(item.extraPrice || 0))
            const key = `${productId}`
            const current = productMap.get(key)

            if (current) {
                current.quantity += quantity
                current.revenue += lineRevenue
                if (!current.unit && unitName) current.unit = unitName
                return
            }

            productMap.set(key, {
                key,
                productId,
                name: productName,
                unit: unitName,
                quantity,
                revenue: lineRevenue,
            })
        })
    })

    const topProducts = [...productMap.values()]
        .sort((left, right) => {
            if (right.quantity !== left.quantity) return right.quantity - left.quantity
            return right.revenue - left.revenue
        })
        .slice(0, 8)

    return {
        orders,
        totalOrders: orders.length,
        revenue,
        profit,
        averageOrderValue: orders.length ? revenue / orders.length : 0,
        trend,
        topProducts,
    }
}

export const DASHBOARD_QUERY_KEY = {
    summary: (from: string, to: string) => ['dashboard-summary', from, to] as const,
}

export const useDashboardSummaryQuery = (range: DashboardRange) => {
    const from = range.from.startOf('day')
    const to = range.to.endOf('day')

    return useSuspenseQuery({
        queryKey: DASHBOARD_QUERY_KEY.summary(from.format('YYYY-MM-DD'), to.format('YYYY-MM-DD')),
        queryFn: async () => {
            const orders = await fetchDashboardOrders({
                from: from.toISOString(),
                to: to.toISOString(),
                status: 'DONE',
            })

            return buildDashboardSummary(orders, from, to)
        },
    })
}
