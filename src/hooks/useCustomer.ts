import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import {
    fetchCustomerList,
    fetchCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} from '@/apis/customer.api'

/* ======================
   QUERY KEYS
====================== */

export const CUSTOMER_QUERY_KEY = {
    list: ['customerList'] as const,
    detail: (id?: number) => ['customer', id] as const,
}

/* ======================
   QUERIES
====================== */

export const useCustomerListQuery = () =>
    useSuspenseQuery({
        queryKey: CUSTOMER_QUERY_KEY.list,
        queryFn: fetchCustomerList,
    })

export const useCustomerByIdQuery = (id?: number) =>
    useQuery({
        queryKey: CUSTOMER_QUERY_KEY.detail(id),
        queryFn: () => fetchCustomerById(id!),
        enabled: !!id,
    })

/* ======================
   MUTATIONS
====================== */

export const useCreateCustomerMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createCustomer,

        onSuccess: (res) => {
            const newCustomer = res.data
            if (!newCustomer) return

            queryClient.setQueryData<ApiResponse<Customer[]>>(
                CUSTOMER_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: [newCustomer, ...old.data],
                    }
                }
            )
        },
    })
}

export const useUpdateCustomerMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data, }: { id: number, data: UpdateCustomerPayload }) => updateCustomer(id, data),
        onSuccess: (res, { id }) => {
            const updatedCustomer = res.data
            if (!updatedCustomer) return

            queryClient.setQueryData<ApiResponse<Customer[]>>(
                CUSTOMER_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: old.data.map((item) =>
                            item.id === id ? updatedCustomer : item
                        ),
                    }
                }
            )

            queryClient.setQueryData<ApiResponse<Customer>>(
                CUSTOMER_QUERY_KEY.detail(id),
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: updatedCustomer,
                    }
                }
            )
        },
    })
}

export const useDeleteCustomerMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteCustomer,

        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<ApiResponse<Customer[]>>(
                CUSTOMER_QUERY_KEY.list,
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
