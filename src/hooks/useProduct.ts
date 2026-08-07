import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import {
    fetchProductList,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from "@/apis/product.api"

const upsertProductIntoListCache = (
    queryClient: ReturnType<typeof useQueryClient>,
    product: Product,
) => {
    queryClient.setQueriesData<ApiResponse<PaginatedData<Product>>>(
        { queryKey: ['productList'] },
        (old) => {
            if (!old?.data?.items) return old

            const existingIndex = old.data.items.findIndex((item) => item.id === product.id)
            const items = [...old.data.items]

            if (existingIndex >= 0) {
                items[existingIndex] = product
            } else {
                items.unshift(product)
            }

            return {
                ...old,
                data: {
                    ...old.data,
                    items,
                },
            }
        },
    )
}

const removeProductFromListCache = (
    queryClient: ReturnType<typeof useQueryClient>,
    productId: number,
) => {
    queryClient.setQueriesData<ApiResponse<PaginatedData<Product>>>(
        { queryKey: ['productList'] },
        (old) => {
            if (!old?.data?.items) return old

            return {
                ...old,
                data: {
                    ...old.data,
                    items: old.data.items.filter((item) => item.id !== productId),
                },
            }
        },
    )
}

/* ======================
   QUERY KEYS
====================== */
export const PRODUCT_QUERY_KEY = {
    list: (params?: GetProductsQuery) => ['productList', params] as const,
    detail: (id?: number) => ['product', id] as const,
}

/* ======================
   QUERIES
====================== */

export const useProductListQuery = (params?: GetProductsQuery) =>
    useSuspenseQuery({
        queryKey: PRODUCT_QUERY_KEY.list(params),
        queryFn: () => fetchProductList(params),
    })

export const useProductByIdQuery = (id?: number) =>
    useQuery({
        queryKey: PRODUCT_QUERY_KEY.detail(id),
        queryFn: () => fetchProductById(id!),
        enabled: !!id,
    })

/* ======================
   MUTATIONS
====================== */

export const useCreateProductMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            data,
            imageFiles,
        }: {
            data: CreateProductPayload
            imageFiles?: File[]
        }) => createProduct(data, imageFiles),

        onSuccess: (res) => {
            const newProduct = res.data
            if (!newProduct) return

            queryClient.setQueryData<ApiResponse<Product>>(
                PRODUCT_QUERY_KEY.detail(newProduct.id),
                { data: newProduct } as ApiResponse<Product>,
            )

            upsertProductIntoListCache(queryClient, newProduct)
        },
    })
}

export const useUpdateProductMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
            imageFiles,
        }: {
            id: number
            data: UpdateProductPayload
            imageFiles?: File[]
        }) => updateProduct(id, data, imageFiles),

        onSuccess: (res, { id }) => {
            const updatedProduct = res.data
            if (!updatedProduct) return

            queryClient.setQueryData<ApiResponse<Product>>(
                PRODUCT_QUERY_KEY.detail(id),
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: updatedProduct,
                    }
                }
            )

            upsertProductIntoListCache(queryClient, updatedProduct)
        },
    })
}

export const useDeleteProductMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteProduct,

        onSuccess: (_, deletedId) => {
            removeProductFromListCache(queryClient, deletedId)
            queryClient.removeQueries({
                queryKey: PRODUCT_QUERY_KEY.detail(deletedId),
            })
        },
    })
}
