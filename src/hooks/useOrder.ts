import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createOrder,
    deleteOrder,
    fetchOrderById,
    fetchOrderList,
    updateOrder,
} from '@/apis/order.api'

export const ORDER_QUERY_KEY = {
    all: ['orders'] as const,
    list: (query?: GetOrdersQuery) => ['orders', query] as const,
    detail: (id?: number) => ['order', id] as const,
}

export const useOrderListQuery = (query?: GetOrdersQuery) =>
    useQuery({
        queryKey: ORDER_QUERY_KEY.list(query),
        queryFn: () => fetchOrderList(query),
        placeholderData: keepPreviousData,
    })

export const useOrderByIdQuery = (id?: number) =>
    useQuery({
        queryKey: ORDER_QUERY_KEY.detail(id),
        queryFn: () => fetchOrderById(id!),
        enabled: !!id,
    })

export const useCreateOrderMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY.all })
        },
    })
}

export const useUpdateOrderMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateOrderPayload }) =>
            updateOrder(id, data),
        onSuccess: (res, { id }) => {
            queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY.all })
            queryClient.setQueryData<ApiResponse<Order>>(
                ORDER_QUERY_KEY.detail(id),
                res
            )
        },
    })
}

export const useDeleteOrderMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY.all })
        },
    })
}
