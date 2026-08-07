import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { fetchUnitList, fetchUnitById, createUnit, updateUnit, deleteUnit } from '@/apis/unit.api'

/* ======================
   QUERY KEYS
====================== */
export const UNIT_QUERY_KEY = {
    list: ['unitList'] as const,
    detail: (id?: number) => ['unit', id] as const,
}

/* ======================
   QUERIES
====================== */

export const useUnitListQuery = () =>
    useSuspenseQuery({
        queryKey: UNIT_QUERY_KEY.list,
        queryFn: fetchUnitList,
    })

export const useUnitByIdQuery = (id?: number) =>
    useQuery({
        queryKey: UNIT_QUERY_KEY.detail(id),
        queryFn: () => fetchUnitById(id!),
        enabled: !!id,
    })

/* ======================
   MUTATIONS
====================== */

export const useCreateUnitMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createUnit,

        onSuccess: (res) => {
            const newUnit = res.data
            if (!newUnit) return

            queryClient.setQueryData<ApiResponse<Unit[]>>(
                UNIT_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: [newUnit, ...old.data],
                    }
                }
            )
        },
    })
}

export const useUpdateUnitMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number
            data: UpdateUnitPayload
        }) => updateUnit(id, data),

        onSuccess: (res, { id }) => {
            const updatedUnit = res.data
            if (!updatedUnit) return

            queryClient.setQueryData<ApiResponse<Unit[]>>(
                UNIT_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: old.data.map((item) =>
                            item.id === id ? updatedUnit : item
                        ),
                    }
                }
            )

            queryClient.setQueryData<ApiResponse<Unit>>(
                UNIT_QUERY_KEY.detail(id),
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: updatedUnit,
                    }
                }
            )
        },
    })
}

export const useDeleteUnitMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteUnit,

        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<ApiResponse<Unit[]>>(
                UNIT_QUERY_KEY.list,
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
