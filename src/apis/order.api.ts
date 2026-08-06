import axios from '@/configs/axios'
import dayjs from 'dayjs'

export const fetchOrderList = async (
    params?: GetOrdersQuery
): Promise<ApiResponse<PaginatedData<Order>>> => {
    const res = await axios.get('/order', { params })
    return res.data
}

export const fetchOrderById = async (id: number): Promise<ApiResponse<Order>> => {
    const res = await axios.get(`/order/${id}`)
    return res.data
}

export const createOrder = async (data: CreateOrderPayload): Promise<ApiResponse<Order>> => {
    const res = await axios.post('/order', data)
    return res.data
}

export const updateOrder = async (
    id: number,
    data: UpdateOrderPayload
): Promise<ApiResponse<Order>> => {
    const res = await axios.patch(`/order/${id}`, data)
    return res.data
}

export const deleteOrder = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`/order/${id}`)
    return res.data
}

const DASHBOARD_PAGE_SIZE = 100

type DashboardOrderRange = {
    from: string
    to: string
    status?: OrderStatusValue
}

export const fetchDashboardOrders = async ({
    from,
    to,
    status = 'DONE',
}: DashboardOrderRange): Promise<Order[]> => {
    const start = dayjs(from).startOf('day')
    const end = dayjs(to).endOf('day')
    const orders: Order[] = []
    let page = 1

    while (true) {
        const response = await fetchOrderList({
            page,
            limit: DASHBOARD_PAGE_SIZE,
            status,
        })

        const items = response.data?.items || []
        if (!items.length) break

        for (const order of items) {
            const createdAt = dayjs(order.createdAt)

            if (createdAt.isBefore(start)) {
                return orders
            }

            if (createdAt.isAfter(end)) {
                continue
            }

            orders.push(order)
        }

        const totalPages = response.data?.pagination.totalPages || 0
        if (page >= totalPages || items.length < DASHBOARD_PAGE_SIZE) {
            break
        }

        page += 1
    }

    return orders
}
