import { Button, Col, Flex, Form, FormInstance, InputNumber, Row, Select, Typography } from 'antd'
import FormattedMessage from '@/components/FormattedMessage'
import { IconTrash } from '@/assets/icons'
import { useIntl } from 'react-intl'

interface OrderFormItemRowProps {
    field: {
        name: number
        key: number
        isListField?: boolean
        fieldKey?: number
    }
    form: FormInstance
    remove: (index: number) => void
    warehouses: Warehouse[]
    isWarehousesLoading: boolean
    locale: string
    getProductById: (productId?: number | string) => Product | undefined
    getUnitByProduct: (productId?: number | string, unitId?: number | string) => ProductUnit | undefined
    handleOpenProductSearch: (fieldName: number) => void
    handleUnitChange: (index: number, unitId?: number) => void
}

/**
 * Formats a numeric amount for the current locale.
 * @param value The number to format.
 * @param locale The active locale string used to pick the correct number format.
 * @returns A locale-formatted money string.
 */
const formatAmount = (value?: number, locale?: string) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        maximumFractionDigits: 2,
    }).format(value || 0)

/**
 * Renders one editable order line item with product, unit, warehouse, and price fields.
 * @param props The row props containing the current form instance, row metadata, and callback handlers.
 * @returns A table row-like form block for a single order item.
 */
export const OrderFormItemRow = ({
    field,
    form,
    remove,
    warehouses,
    isWarehousesLoading,
    locale,
    getProductById,
    getUnitByProduct,
    handleOpenProductSearch,
    handleUnitChange,
}: OrderFormItemRowProps) => {
    const intl = useIntl()
    const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage })

    // Watch ONLY the productId and unitId fields for this specific row index.
    const productId = Form.useWatch(['products', field.name, 'productId'], form)
    const selectedUnitId = Form.useWatch(['products', field.name, 'unitId'], form)

    const currentProduct = getProductById(productId)
    const selectedUnit = getUnitByProduct(productId, selectedUnitId)

    const unitOptions = (currentProduct?.units || []).map((unit) => ({
        label: unit.unit?.name || `Unit ${unit.unitId}`,
        value: unit.unitId,
    }))

    const warehouseOptions = warehouses
        .map((warehouse) => {
            const quantity =
                warehouse.products?.find(
                    (stock) =>
                        stock.productId === Number(productId) &&
                        stock.unitId === Number(selectedUnitId)
                )?.quantity || 0

            return {
                label: `${warehouse.name} (${quantity} remaining)`,
                value: warehouse.id,
                quantity,
            }
        })
        .filter((warehouse) => warehouse.quantity > 0)

    return (
        <Flex vertical gap={12} className="border-1 border-neutral-4 rounded-12 p-12">
            <Flex justify="space-between" align="center">
                <Typography.Text strong>
                    {intl.formatMessage(
                        {
                            id: 'management.sales.form.order-item',
                            defaultMessage: 'Item #{index}',
                        },
                        { index: field.name + 1 }
                    )}
                </Typography.Text>
                <Button danger onClick={() => remove(field.name)}>
                    <IconTrash width={18} height={18} />
                </Button>
            </Flex>
            <Row gutter={12}>
                <Col xs={12} md={8}>
                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.sales.form.label.product"
                                defaultMessage="Product"
                            />
                        }
                        name={[field.name, 'productId']}
                        rules={[
                            {
                                required: true,
                                message: (
                                    <FormattedMessage
                                        id="message.sales.product-required"
                                        defaultMessage="Product is required"
                                    />
                                ),
                            },
                        ]}
                    >
                        <Flex
                            onClick={() => handleOpenProductSearch(field.name)}
                            className="border-1 border-neutral-4 rounded-8 p-12 cursor-pointer hover:border-main-primary"
                            align="center"
                            gap={12}
                        >
                            {currentProduct ? (
                                <>
                                    {currentProduct.images?.[0]?.url && (
                                        <img
                                            src={currentProduct.images[0].url}
                                            alt={currentProduct.name}
                                            style={{
                                                width: 60,
                                                height: 60,
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                            }}
                                        />
                                    )}
                                    <Typography.Text strong>{currentProduct.name}</Typography.Text>
                                </>
                            ) : (
                                <Typography.Text type="secondary">
                                    {t(
                                        'management.sales.form.placeholder.select-product',
                                        'Click to select product'
                                    )}
                                </Typography.Text>
                            )}
                        </Flex>
                    </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.sales.form.label.unit"
                                defaultMessage="Unit"
                            />
                        }
                        name={[field.name, 'unitId']}
                        rules={[
                            {
                                required: true,
                                message: (
                                    <FormattedMessage
                                        id="message.sales.unit-required"
                                        defaultMessage="Unit is required"
                                    />
                                ),
                            },
                        ]}
                    >
                        <Select
                            options={unitOptions}
                            placeholder={t(
                                'management.sales.form.placeholder.select-unit',
                                'Select unit'
                            )}
                            onChange={(value) => handleUnitChange(field.name, value)}
                        />
                    </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.sales.form.label.warehouse-id"
                                defaultMessage="Warehouse"
                            />
                        }
                        name={[field.name, 'warehouseId']}
                    >
                        <Select
                            showSearch
                            loading={isWarehousesLoading}
                            options={warehouseOptions}
                            placeholder={t(
                                'management.sales.form.placeholder.select-warehouse',
                                'Select warehouse'
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.sales.form.label.quantity"
                                defaultMessage="Quantity"
                            />
                        }
                        name={[field.name, 'quantity']}
                        rules={[
                            {
                                required: true,
                                message: (
                                    <FormattedMessage
                                        id="message.sales.quantity-is-required"
                                        defaultMessage="Quantity is required"
                                    />
                                ),
                            },
                        ]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>
                </Col>
                <Col xs={8} md={6}>
                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.sales.form.label.sell-price"
                                defaultMessage="Sell Price"
                            />
                        }
                        name={[field.name, 'sellPrice']}
                        rules={[
                            {
                                required: true,
                                message: (
                                    <FormattedMessage
                                        id="message.sales.sell-price-is-required"
                                        defaultMessage="Sell price is required"
                                    />
                                ),
                            },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            className="w-full"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
                        />
                    </Form.Item>
                </Col>
                <Col xs={8} md={6}>
                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.sales.form.label.extra-price"
                                defaultMessage="Extra Price"
                            />
                        }
                        name={[field.name, 'extraPrice']}
                    >
                        <InputNumber
                            min={0}
                            className="w-full"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
                        />
                    </Form.Item>
                </Col>
                <Col xs={8} md={6}>
                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.sales.form.label.vat-percent"
                                defaultMessage="VAT (%)"
                            />
                        }
                        name={[field.name, 'vatPercent']}
                        rules={[
                            {
                                required: true,
                                message: (
                                    <FormattedMessage
                                        id="message.sales.vat-is-required"
                                        defaultMessage="VAT is required"
                                    />
                                ),
                            },
                        ]}
                    >
                        <InputNumber min={0} max={100} className="w-full" />
                    </Form.Item>
                </Col>
            </Row>

            {selectedUnit?.extraPrices?.length ? (
                <Typography.Text type="secondary">
                    {t(
                        'management.sales.form.label.available-extra-prices',
                        'Available extra prices:'
                    )}{' '}
                    {selectedUnit.extraPrices
                        .map((item) => `${item.label}: ${formatAmount(item.price, locale)}`)
                        .join(' | ')}
                </Typography.Text>
            ) : null}
        </Flex>
    )
}