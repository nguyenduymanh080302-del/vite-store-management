import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import {
    createWarehouse,
    deleteWarehouse,
    fetchWarehouseById,
    fetchWarehouseList,
    updateWarehouse,
} from '@/apis/warehouse.api'

export const WAREHOUSE_QUERY_KEY = {
    list: ['warehouseList'] as const,
    detail: (id?: number) => ['warehouse', id] as const,
}

export const useWarehouseListQuery = () =>
    useSuspenseQuery({
        queryKey: WAREHOUSE_QUERY_KEY.list,
        queryFn: fetchWarehouseList,
    })

export const useWarehouseByIdQuery = (id?: number) =>
    useQuery({
        queryKey: WAREHOUSE_QUERY_KEY.detail(id),
        queryFn: () => fetchWarehouseById(id!),
        enabled: !!id,
    })

export const useCreateWarehouseMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createWarehouse,
        onSuccess: (res) => {
            const newWarehouse = res.data
            if (!newWarehouse) return

            queryClient.setQueryData<ApiResponse<Warehouse[]>>(
                WAREHOUSE_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old
                    return { ...old, data: [newWarehouse, ...old.data] }
                }
            )
        },
    })
}

export const useUpdateWarehouseMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateWarehousePayload }) => updateWarehouse(id, data),
        onSuccess: (res, { id }) => {
            const updatedWarehouse = res.data
            if (!updatedWarehouse) return

            queryClient.setQueryData<ApiResponse<Warehouse[]>>(
                WAREHOUSE_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old
                    return {
                        ...old,
                        data: old.data.map((item) => (item.id === id ? updatedWarehouse : item)),
                    }
                }
            )

            queryClient.setQueryData<ApiResponse<Warehouse>>(
                WAREHOUSE_QUERY_KEY.detail(id),
                (old) => {
                    if (!old?.data) return old
                    return { ...old, data: updatedWarehouse }
                }
            )
        },
    })
}

export const useDeleteWarehouseMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteWarehouse,
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<ApiResponse<Warehouse[]>>(
                WAREHOUSE_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old
                    return { ...old, data: old.data.filter((item) => item.id !== deletedId) }
                }
            )
        },
    })
}
