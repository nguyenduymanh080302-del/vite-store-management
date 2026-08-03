import { Button, Col, Flex, Form, Input, Modal, Row, Select, Typography } from 'antd'
import FormattedMessage from '@/components/FormattedMessage'
import dayjs from 'dayjs'
import { useCustomerListQuery } from '@/hooks/useCustomer'
import { useDeliveryListQuery } from '@/hooks/useDelivery'
import { useWarehouseListQuery } from '@/hooks/useWarehouse'
import { useCreateOrderMutation, useUpdateOrderMutation } from '@/hooks/useOrder'
import { PRODUCT_QUERY_KEY } from '@/hooks/useProduct'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from '@/stores/app.store'
import { ORDER_STATUS } from '@/utils/enum'
import { normalizeSpace } from '@/utils/hepler'
import { OrderFormItemRow } from './OrderFormItemRow'
import { OrderTotals } from './OrderTotals'
import { ProductSearchModal } from './ProductSearchModal'

type OrderLineFormValue = {
    warehouseId?: number | string
    productId?: number | string
    unitId?: number | string
    quantity?: number | string
    importPrice?: number | string
    sellPrice?: number | string
    extraPrice?: number | string
    vatPercent?: number | string
}

type OrderFormValues = Omit<
    CreateOrderPayload,
    | 'customerId'
    | 'deliveryId'
    | 'discountValue'
    | 'paidAmount'
    | 'products'
> & {
    customerId?: number | string
    deliveryId?: number | string
    discountValue?: number | string
    paidAmount?: number | string
    products?: OrderLineFormValue[]
}

/**
 * Generates a unique order code for the current create-order form.
 * @returns A formatted order code string.
 */
const generateOrderCode = () => `ORD-${dayjs().format('YYYYMMDDHHmmss')}`

/**
 * Converts the form's raw order input into the backend payload shape.
 * @param raw The form values collected from the order modal.
 * @returns A normalized `CreateOrderPayload` object ready for mutation.
 */
const normalizeOrderValues = (raw: OrderFormValues): CreateOrderPayload => ({
    orderCode: raw.orderCode,
    customerId: raw.customerId ? Number(raw.customerId) : undefined,
    customerName: raw.customerName,
    customerEmail: raw.customerEmail,
    customerPhone: raw.customerPhone,
    customerAddress: raw.customerAddress,
    customerPayment: Number(raw.customerPayment || 0),
    vatValue: Number(raw.vatValue || 0),
    discountValue:
        raw.discountValue === undefined || raw.discountValue === ''
            ? undefined
            : Number(raw.discountValue),
    totalAmount: Number(raw.totalAmount || 0),
    deliveryFee: Number(raw.deliveryFee || 0),
    status: raw.status || ORDER_STATUS.PENDING,
    deliveryId: raw.deliveryId ? Number(raw.deliveryId) : undefined,
    deliveryPerson: raw.deliveryPerson || undefined,
    deliveryPhone: raw.deliveryPhone || undefined,
    paidAmount:
        raw.paidAmount === undefined || raw.paidAmount === ''
            ? undefined
            : Number(raw.paidAmount),
    products: (raw.products || []).map((item) => ({
        warehouseId: item.warehouseId ? Number(item.warehouseId) : undefined,
        productId: Number(item.productId),
        unitId: Number(item.unitId),
        quantity: Number(item.quantity),
        importPrice: Number(item.importPrice || 0),
        sellPrice: Number(item.sellPrice || 0),
        extraPrice:
            item.extraPrice === undefined || item.extraPrice === ''
                ? undefined
                : Number(item.extraPrice),
        vatPercent: Number(item.vatPercent || 0),
    })),
})

interface OrderFormModalProps {
    open: boolean
    mode: 'create' | 'edit'
    order: Order | null
    onClose: () => void
}

/**
 * Main modal for creating or editing an order.
 * @param props The modal control props: visibility, mode, selected order, and close handler.
 * @returns A React modal UI for the order form.
 */
export const OrderFormModal = ({ open, mode, order, onClose }: OrderFormModalProps) => {
    const locale = useAppStore((state) => state.locale)
    const intl = useIntl()
    const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage })
    const queryClient = useQueryClient()

    const [form] = Form.useForm<OrderFormValues>()

    // Modal data queries (only fetch when modal is open to optimize performance)
    const { data: customerData } = useCustomerListQuery()
    const { data: deliveryData } = useDeliveryListQuery()
    const { data: warehouseData, isLoading: isWarehousesLoading } = useWarehouseListQuery()

    const { mutateAsync: createOrder, isPending: isCreating } = useCreateOrderMutation()
    const { mutateAsync: updateOrder, isPending: isUpdating } = useUpdateOrderMutation()

    const customers = customerData?.data || []
    const deliveries = deliveryData?.data || []
    const warehouses = warehouseData?.data || []

    const orderStatusOptions = Object.values(ORDER_STATUS).map((status) => ({
        label: t(`order.status.${status.toLowerCase()}`, status),
        value: status,
    }))

    // Product search popup state
    const [productSearchOpen, setProductSearchOpen] = useState(false)
    const [currentProductField, setCurrentProductField] = useState<number | null>(null)

    // Initialize/Reset form and hydrate product detail cache on mount or modal state change
    useEffect(() => {
        if (open) {
            if (mode === 'create') {
                form.resetFields()
                form.setFieldsValue({
                    orderCode: generateOrderCode(),
                    status: ORDER_STATUS.PENDING,
                    discountValue: 0,
                    customerPayment: 0,
                    paidAmount: 0,
                    products: [{ quantity: 1, extraPrice: 0, vatPercent: 0 }],
                })
            } else if (mode === 'edit' && order) {
                order.products.forEach((item) => {
                    if (item.productUnit?.product) {
                        queryClient.setQueryData<ApiResponse<Product>>(
                            PRODUCT_QUERY_KEY.detail(item.productId),
                            { data: item.productUnit.product } as ApiResponse<Product>,
                        )
                    }
                })

                form.setFieldsValue({
                    orderCode: order.orderCode,
                    customerId: order.customerId ?? undefined,
                    customerName: order.customerName,
                    customerEmail: order.customerEmail,
                    customerPhone: order.customerPhone,
                    customerAddress: order.customerAddress,
                    customerPayment: order.customerPayment,
                    vatValue: order.vatValue,
                    discountValue: order.discountValue ?? 0,
                    totalAmount: order.totalAmount,
                    status: order.status,
                    deliveryId: order.deliveryId ?? undefined,
                    deliveryPerson: order.deliveryPerson ?? undefined,
                    deliveryPhone: order.deliveryPhone ?? undefined,
                    deliveryFee: order.deliveryFee ?? 0,
                    paidAmount: order.paidAmount ?? 0,
                    products: order.products.map((item) => ({
                        warehouseId: item.warehouseId ?? undefined,
                        productId: item.productId,
                        unitId: item.unitId,
                        quantity: item.quantity,
                        importPrice: item.importPrice,
                        sellPrice: item.sellPrice,
                        extraPrice: item.extraPrice,
                        vatPercent: item.vatPercent,
                    })),
                })
            }
        } else {
            form.resetFields()
        }
    }, [open, mode, order, form, queryClient])

    /**
     * Returns the cached product detail record for a given product id.
     * @param productId The numeric or string product id to resolve from the query cache.
     * @returns The cached product object if it exists, otherwise `undefined`.
     */
    const getProductById = (productId?: number | string) => {
        if (!productId) return undefined

        return queryClient.getQueryData<ApiResponse<Product>>(
            PRODUCT_QUERY_KEY.detail(Number(productId)),
        )?.data
    }

    /**
     * Finds the unit configuration for a selected product and unit id.
     * @param productId The product id whose unit list should be searched.
     * @param unitId The unit id to match inside the product's units array.
     * @returns The matching unit object, or `undefined` if not found.
     */
    const getUnitByProduct = (productId?: number | string, unitId?: number | string) =>
        getProductById(productId)?.units?.find((item) => item.unitId === Number(unitId))

    // Product search popup handlers
    /**
     * Opens the product search modal and remembers which form row triggered it.
     * @param fieldName The order products array index that is currently being edited.
     */
    const handleOpenProductSearch = (fieldName: number) => {
        setCurrentProductField(fieldName)
        setProductSearchOpen(true)
    }

    /**
     * Closes the product search modal and clears the active product field reference.
     */
    const handleCloseProductSearch = () => {
        setProductSearchOpen(false)
        setCurrentProductField(null)
    }

    /**
     * Stores the selected product in the shared query cache and applies its details to the current order row.
     * @param product The product object chosen from the search modal.
     */
    const handleSelectProduct = (product: Product) => {
        if (currentProductField !== null) {
            queryClient.setQueryData<ApiResponse<Product>>(
                PRODUCT_QUERY_KEY.detail(product.id),
                { data: product } as ApiResponse<Product>,
            )
            form.setFieldValue(['products', currentProductField, 'productId'], product.id)
            handleProductChange(currentProductField, product.id, product)
        }
        handleCloseProductSearch()
    }

    /**
     * Fills customer-related form fields from the selected customer record.
     * @param customerId The id of the chosen customer.
     */
    const handleCustomerChange = (customerId?: number) => {
        const selectedCustomer = customers.find((item) => item.id === customerId)

        if (!selectedCustomer) return

        form.setFieldsValue({
            customerName: selectedCustomer.name,
            customerEmail: selectedCustomer.email || '',
            customerPhone: selectedCustomer.phone || '',
            customerAddress: selectedCustomer.address || '',
        })
    }

    /**
     * Fills delivery contact fields from the selected delivery provider.
     * @param deliveryId The id of the chosen delivery provider.
     */
    const handleDeliveryChange = (deliveryId?: number) => {
        const selectedDelivery = deliveries.find((item) => item.id === deliveryId)

        if (!selectedDelivery) return

        form.setFieldsValue({
            deliveryPerson: selectedDelivery.name,
            deliveryPhone: selectedDelivery.phone || '',
        })
    }

    /**
     * Applies the selected product's first unit defaults into the current order line row.
     * @param index The form products array index for the current row.
     * @param productId The product id to resolve from cache if no product object is provided.
     * @param productObj Optional product object that is already available from the search modal.
     */
    const handleProductChange = (index: number, productId?: number, productObj?: Product) => {
        const product = productObj || getProductById(productId)
        const firstUnit = product?.units[0]

        form.setFieldValue(['products', index, 'unitId'], firstUnit?.unitId)
        form.setFieldValue(['products', index, 'warehouseId'], undefined)
        form.setFieldValue(['products', index, 'importPrice'], firstUnit?.importPrice ?? 0)
        form.setFieldValue(['products', index, 'sellPrice'], firstUnit?.sellPrice ?? 0)
        form.setFieldValue(['products', index, 'extraPrice'], 0)
        form.setFieldValue(['products', index, 'vatPercent'], firstUnit?.vatPercent ?? 0)
    }

    /**
     * Recalculates the price and tax fields after a unit selection changes.
     * @param index The form products array index for the current row.
     * @param unitId The unit id selected for the current product.
     */
    const handleUnitChange = (index: number, unitId?: number) => {
        const productId = form.getFieldValue(['products', index, 'productId'])
        const unit = getUnitByProduct(productId, unitId)

        form.setFieldValue(['products', index, 'warehouseId'], undefined)
        form.setFieldValue(['products', index, 'importPrice'], unit?.importPrice ?? 0)
        form.setFieldValue(['products', index, 'sellPrice'], unit?.sellPrice ?? 0)
        form.setFieldValue(['products', index, 'extraPrice'], 0)
        form.setFieldValue(['products', index, 'vatPercent'], unit?.vatPercent ?? 0)
    }

    /**
     * Validates the form and submits either a create or update order mutation.
     */
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            const payload = normalizeOrderValues(values)

            if (mode === 'create') {
                await createOrder(payload)
            } else if (mode === 'edit' && order) {
                await updateOrder({
                    id: order.id,
                    data: payload,
                })
            }

            onClose()
        } catch (error) {
            console.error('Order action failed:', error)
        }
    }

    return (
        <>
            <Modal
                open={open}
                width={1100}
                title={
                    <FormattedMessage
                        id={`management.sales.modal.title.${mode}-order`}
                        defaultMessage={mode === 'create' ? 'Create Order' : 'Edit Order'}
                    />
                }
                onCancel={onClose}
                onOk={handleSubmit}
                okText={
                    <FormattedMessage
                        id={`management.sales.modal.btn.${mode}`}
                        defaultMessage={mode === 'create' ? 'Create' : 'Update'}
                    />
                }
                okButtonProps={{
                    className: 'bg-main-primary',
                    loading: isCreating || isUpdating,
                }}
                cancelText={
                    <FormattedMessage
                        id="management.sales.modal.btn.cancel"
                        defaultMessage="Cancel"
                    />
                }
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Row gutter={12}>
                        <Col xs={12} md={12} lg={8}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.order-code"
                                        defaultMessage="Order Code"
                                    />
                                }
                                name="orderCode"
                                normalize={normalizeSpace}
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="message.sales.order-code-is-required"
                                                defaultMessage="Order code is required"
                                            />
                                        ),
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={12} lg={8}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.status"
                                        defaultMessage="Status"
                                    />
                                }
                                name="status"
                                initialValue={ORDER_STATUS.PENDING}
                            >
                                <Select options={orderStatusOptions} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8} lg={8}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.customer"
                                        defaultMessage="Customer"
                                    />
                                }
                                name="customerId"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    options={customers.map((item) => ({
                                        label: `${item.name} (${item.phone || item.email || t('management.sales.form.default.no-contact', 'No contact')})`,
                                        value: item.id,
                                    }))}
                                    placeholder={t(
                                        'management.sales.form.placeholder.select-customer',
                                        'Select customer'
                                    )}
                                    onChange={handleCustomerChange}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={8} lg={6}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.customer-name"
                                        defaultMessage="Customer Name"
                                    />
                                }
                                name="customerName"
                                normalize={normalizeSpace}
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="message.sales.customer-name-is-required"
                                                defaultMessage="Customer name is required"
                                            />
                                        ),
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={8} lg={6}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.customer-phone"
                                        defaultMessage="Customer Phone"
                                    />
                                }
                                name="customerPhone"
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="message.sales.customer-phone-is-required"
                                                defaultMessage="Customer phone is required"
                                            />
                                        ),
                                    },
                                    {
                                        pattern: /^(03|05|07|08|09)\d{8}$/,
                                        message: (
                                            <FormattedMessage
                                                id="message.sales.customer-phone-invalid-vn"
                                                defaultMessage="Customer phone must be a valid VN number"
                                            />
                                        ),
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={10} lg={6}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.customer-address"
                                        defaultMessage="Customer Address"
                                    />
                                }
                                name="customerAddress"
                                normalize={normalizeSpace}
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="message.sales.customer-address-is-required"
                                                defaultMessage="Customer address is required"
                                            />
                                        ),
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={7} lg={6}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.customer-email"
                                        defaultMessage="Customer Email"
                                    />
                                }
                                name="customerEmail"
                                rules={[
                                    {
                                        required: false,
                                    },
                                    {
                                        type: 'email',
                                        message: (
                                            <FormattedMessage
                                                id="message.sales.customer-email-invalid"
                                                defaultMessage="Invalid email address"
                                            />
                                        ),
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.delivery-provider"
                                        defaultMessage="Delivery Provider"
                                    />
                                }
                                name="deliveryId"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    options={deliveries.map((item) => ({
                                        label: item.name,
                                        value: item.id,
                                    }))}
                                    placeholder={t(
                                        'management.sales.form.placeholder.select-delivery-provider',
                                        'Select delivery provider'
                                    )}
                                    onChange={handleDeliveryChange}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.delivery-person"
                                        defaultMessage="Delivery Person"
                                    />
                                }
                                name="deliveryPerson"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.delivery-phone"
                                        defaultMessage="Delivery Phone"
                                    />
                                }
                                name="deliveryPhone"
                                rules={[
                                    {
                                        pattern: /^(03|05|07|08|09)\d{8}$/,
                                        message: (
                                            <FormattedMessage
                                                id="message.sales.delivery-phone-invalid-vn"
                                                defaultMessage="Delivery phone must be a valid VN number"
                                            />
                                        ),
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item
                                label={
                                    <FormattedMessage
                                        id="management.sales.form.label.delivery-fee"
                                        defaultMessage="Delivery Fee"
                                    />
                                }
                                name="deliveryFee"
                                rules={[
                                    {
                                        pattern: /^(03|05|07|08|09)\d{8}$/,
                                        message: (
                                            <FormattedMessage
                                                id="message.sales.delivery-phone-invalid-vn"
                                                defaultMessage="Delivery phone must be a valid VN number"
                                            />
                                        ),
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.List
                        name="products"
                        rules={[
                            {
                                validator: async (_, value) => {
                                    if (!value || value.length < 1) {
                                        throw new Error(
                                            t(
                                                'message.sales.at-least-one-product',
                                                'At least one product is required'
                                            )
                                        )
                                    }
                                },
                            },
                        ]}
                    >
                        {(fields, { add, remove }, { errors }) => (
                            <Flex vertical gap={12}>
                                <Flex justify="space-between" align="center">
                                    <Typography.Title level={5} className="m-0">
                                        <FormattedMessage
                                            id="management.sales.form.label.order-items"
                                            defaultMessage="Order Items"
                                        />
                                    </Typography.Title>
                                    <Button
                                        onClick={() =>
                                            add({ quantity: 1, extraPrice: 0, vatPercent: 0 })
                                        }
                                    >
                                        {t('management.sales.form.btn.add-item', 'Add Item')}
                                    </Button>
                                </Flex>

                                {fields.map((field) => (
                                    <OrderFormItemRow
                                        key={field.key}
                                        field={field}
                                        form={form}
                                        remove={remove}
                                        warehouses={warehouses}
                                        isWarehousesLoading={isWarehousesLoading}
                                        locale={locale}
                                        getProductById={getProductById}
                                        getUnitByProduct={getUnitByProduct}
                                        handleOpenProductSearch={handleOpenProductSearch}
                                        handleUnitChange={handleUnitChange}
                                    />
                                ))}

                                {errors.length ? (
                                    <Typography.Text type="danger">{errors[0]}</Typography.Text>
                                ) : null}
                            </Flex>
                        )}
                    </Form.List>
                    <OrderTotals form={form} />
                </Form>
            </Modal>

            {/* Product Search Modal - rendered conditionally */}
            <ProductSearchModal
                open={productSearchOpen}
                onCancel={handleCloseProductSearch}
                onSelectProduct={handleSelectProduct}
                initialSearchValue={
                    currentProductField !== null
                        ? getProductById(
                            form.getFieldValue(['products', currentProductField, 'productId'])
                        )?.name || ''
                        : ''
                }
            />
        </>
    )
}
