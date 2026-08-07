import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import {
    fetchDeliveryList,
    fetchDeliveryById,
    createDelivery,
    updateDelivery,
    deleteDelivery,
} from '@/apis/delivery.api'

/* ======================
   QUERY KEYS
====================== */

export const DELIVERY_QUERY_KEY = {
    list: ['deliveryList'] as const,
    detail: (id?: number) => ['delivery', id] as const,
}

/* ======================
   QUERIES
====================== */

export const useDeliveryListQuery = () =>
    useSuspenseQuery({
        queryKey: DELIVERY_QUERY_KEY.list,
        queryFn: fetchDeliveryList,
    })

export const useDeliveryByIdQuery = (id?: number) =>
    useQuery({
        queryKey: DELIVERY_QUERY_KEY.detail(id),
        queryFn: () => fetchDeliveryById(id!),
        enabled: !!id,
    })

/* ======================
   MUTATIONS
====================== */

export const useCreateDeliveryMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createDelivery,

        onSuccess: (res) => {
            const newDelivery = res.data
            if (!newDelivery) return

            queryClient.setQueryData<ApiResponse<Delivery[]>>(
                DELIVERY_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: [newDelivery, ...old.data],
                    }
                }
            )
        },
    })
}

export const useUpdateDeliveryMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number
            data: UpdateDeliveryPayload
        }) => updateDelivery(id, data),

        onSuccess: (res, { id }) => {
            const updatedDelivery = res.data
            if (!updatedDelivery) return

            // update list
            queryClient.setQueryData<ApiResponse<Delivery[]>>(
                DELIVERY_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: old.data.map((item) =>
                            item.id === id ? updatedDelivery : item
                        ),
                    }
                }
            )

            // update detail
            queryClient.setQueryData<ApiResponse<Delivery>>(
                DELIVERY_QUERY_KEY.detail(id),
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: updatedDelivery,
                    }
                }
            )
        },
    })
}

export const useDeleteDeliveryMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteDelivery,

        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<ApiResponse<Delivery[]>>(
                DELIVERY_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: old.data.filter(
                            (item) => item.id !== deletedId
                        ),
                    }
                }
            )
        },
    })
}
