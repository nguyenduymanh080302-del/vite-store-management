import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
    fetchCategoryList,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "@/apis/category.api";

/* ======================
   QUERY KEYS
====================== */
export const CATEGORY_QUERY_KEY = {
    list: ["categoryList"] as const,
    detail: (id?: number) => ["category", id] as const,
};

/* ======================
   QUERIES
====================== */

export const useCategoryListQuery = () =>
    useSuspenseQuery({
        queryKey: CATEGORY_QUERY_KEY.list,
        queryFn: fetchCategoryList,
    });

export const useCategoryByIdQuery = (id?: number) =>
    useQuery({
        queryKey: CATEGORY_QUERY_KEY.detail(id),
        queryFn: () => fetchCategoryById(id!),
        enabled: !!id,
    });

/* ======================
   MUTATIONS
====================== */

export const useCreateCategoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCategory,

        onSuccess: (res) => {
            const newCategory = res.data;
            if (!newCategory) return;

            queryClient.setQueryData<ApiResponse<Category[]>>(
                CATEGORY_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old;

                    return {
                        ...old,
                        data: [newCategory, ...old.data],
                    };
                }
            );
        },
    });
};


export const useUpdateCategoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: UpdateCategoryPayload;
        }) => updateCategory(id, data),

        onSuccess: (res, { id }) => {
            const updatedCategory = res.data;
            if (!updatedCategory) return;
            queryClient.setQueryData<ApiResponse<Category[]>>(
                CATEGORY_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old;

                    return {
                        ...old,
                        data: old.data.map((item) =>
                            item.id === id ? updatedCategory : item
                        ),
                    };
                }
            );

            // 🔁 Update detail cache
            queryClient.setQueryData<ApiResponse<Category>>(
                CATEGORY_QUERY_KEY.detail(id),
                (old) => {
                    if (!old?.data)
                        return old;
                    return {
                        ...old,
                        data: updatedCategory,
                    }

                }
            );
        },
    });
};


export const useDeleteCategoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCategory,

        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<ApiResponse<Category[]>>(
                CATEGORY_QUERY_KEY.list,
                (old) => {
                    if (!old?.data) return old;

                    return {
                        ...old,
                        data: old.data.filter(
                            (item) => item.id !== deletedId
                        ),
                    };
                }
            );
        },
    });
};

