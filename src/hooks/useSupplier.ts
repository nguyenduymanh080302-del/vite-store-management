import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import {
    fetchSupplierList,
    fetchSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from '@/apis/supplier.api'

/* ======================
   QUERY KEYS
====================== */
export const SUPPLIER_QUERY_KEY = {
    list: ['supplierList'] as const,
    detail: (id?: number) => ['supplier', id] as const,
}

/* ======================
   QUERIES
====================== */

export const useSupplierListQuery = () =>
    useSuspenseQuery({
        queryKey: SUPPLIER_QUERY_KEY.list,
        queryFn: fetchSupplierList,
    })

export const useSupplierByIdQuery = (id?: number) =>
    useQuery({
        queryKey: SUPPLIER_QUERY_KEY.detail(id),
        queryFn: () => fetchSupplierById(id!),
        enabled: !!id,
    })

/* ======================
   MUTATIONS
====================== */

export const useCreateSupplierMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createSupplier,

        onSuccess: (res) => {
            const newSupplier = res.data
            if (!newSupplier) return

            queryClient.setQueryData<ApiResponse<Supplier[]>>(
                SUPPLIER_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: [newSupplier, ...old.data],
                    }
                }
            )
        },
    })
}

export const useUpdateSupplierMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number
            data: UpdateSupplierPayload
        }) => updateSupplier(id, data),

        onSuccess: (res, { id }) => {
            const updatedSupplier = res.data
            if (!updatedSupplier) return

            queryClient.setQueryData<ApiResponse<Supplier[]>>(
                SUPPLIER_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: old.data.map((item) =>
                            item.id === id ? updatedSupplier : item
                        ),
                    }
                }
            )

            queryClient.setQueryData<ApiResponse<Supplier>>(
                SUPPLIER_QUERY_KEY.detail(id),
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: updatedSupplier,
                    }
                }
            )
        },
    })
}

export const useDeleteSupplierMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteSupplier,

        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<ApiResponse<Supplier[]>>(
                SUPPLIER_QUERY_KEY.list,
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
