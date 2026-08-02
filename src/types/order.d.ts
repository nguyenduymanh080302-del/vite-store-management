type OrderStatusValue = 'PENDING' | 'CANCELED' | 'DELIVERING' | 'DONE'

type OrderProduct = {
    id: number
    orderId: number
    productId: number
    unitId: number
    quantity: number
    sellPrice: number
    extraPrice: number
    vatPercent: number
    warehouseId?: number | null
    warehouse?: Warehouse | null
    createdAt: string
    updatedAt: string
    productUnit: {
        productId: number
        unitId: number
        sellPrice: number
        vatPercent: number
        extraPrices?: ProductExtraPricePayload[]
        product: Product
        unit: Unit
    }
}

type Order = {
    id: number
    orderCode: string
    customerId?: number | null
    customer?: Customer | null
    customerName: string
    customerEmail: string
    customerPhone: string
    customerAddress: string
    customerPayment: number
    paymentMethodId?: number
    paymentMethod?: PaymentMethod
    vatValue: number
    discountValue?: number | null
    totalAmount: number
    status: OrderStatusValue
    creatorId: number
    createdBy: Account
    deliveryId?: number | null
    delivery?: Delivery | null
    deliveryPerson?: string | null
    deliveryPhone?: string | null
    paidAmount?: number | null
    products: OrderProduct[]
    createdAt: string
    updatedAt: string
}

type OrderProductPayload = {
    warehouseId?: number | null
    productId: number
    unitId: number
    quantity: number
    sellPrice: number
    extraPrice?: number
    vatPercent: number
}

type CreateOrderPayload = {
    orderCode: string
    customerId?: number
    customerName: string
    customerEmail?: string
    customerPhone: string
    customerAddress: string
    customerPayment: number
    paymentMethodId?: number
    vatValue: number
    discountValue?: number
    totalAmount: number
    status?: OrderStatusValue
    deliveryId?: number
    deliveryPerson?: string
    deliveryPhone?: string
    paidAmount?: number
    products: OrderProductPayload[]
}

type UpdateOrderPayload = Partial<CreateOrderPayload>

type GetOrdersQuery = {
    search?: string
    status?: OrderStatusValue
    page?: number
    limit?: number
}
