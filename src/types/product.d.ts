type Image = {
    id: number
    url: string
}

type ProductUnitExtraPrice = {
    label: string
    price: number
}

type ProductUnit = {
    unitId: number
    importPrice?: number
    sellPrice: number
    vatPercent: number
    extraPrices?: ProductUnitExtraPrice[]
    unit?: Unit
}

type Product = {
    id: number
    units: ProductUnit[]
    name: string
    slug: string
    images: Image[]
    description: string
    categoryId: number
    category: Category
    isActive: boolean
    createdAt: string
    updatedAt: string
}

type ProductExtraPricePayload = {
    label: string
    price: number
}

type ProductUnitPayload = {
    unitId: number
    importPrice?: number
    sellPrice: number
    vatPercent: number
    extraPrices?: ProductExtraPricePayload[]
}

type CreateProductPayload = {
    name: string
    slug: string
    description: string
    categoryId: number
    units?: ProductUnitPayload[]
    isActive: boolean
}

type UpdateProductPayload = Partial<CreateProductPayload> & {
    deleteImageIds?: number[]
}

type GetProductsQuery = {
    search?: string
    page?: number
    limit?: number
    isActive?: boolean
}
