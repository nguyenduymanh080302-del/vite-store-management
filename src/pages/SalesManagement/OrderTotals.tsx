import { Col, Form, FormInstance, InputNumber, Row } from 'antd'
import FormattedMessage from '@/components/FormattedMessage'
import { useEffect } from 'react'

type OrderLineFormValue = {
    warehouseId?: number | string
    productId?: number | string
    unitId?: number | string
    quantity?: number | string
    sellPrice?: number | string
    extraPrice?: number | string
    vatPercent?: number | string
}

interface OrderTotalsProps {
    form: FormInstance
}

export const OrderTotals = ({ form }: OrderTotalsProps) => {
    // Watch products value inside this small component so that only this component re-renders during editing
    const watchedProducts = Form.useWatch<OrderLineFormValue[]>('products', form) || []

    const subtotal = watchedProducts.reduce((sum: number, item: OrderLineFormValue) => {
        const quantity = Number(item?.quantity || 0)
        const sellPrice = Number(item?.sellPrice || 0)
        const extraPrice = Number(item?.extraPrice || 0)
        return sum + (sellPrice + extraPrice) * quantity
    }, 0)

    const vatValue = watchedProducts.reduce((sum: number, item: OrderLineFormValue) => {
        const quantity = Number(item?.quantity || 0)
        const sellPrice = Number(item?.sellPrice || 0)
        const extraPrice = Number(item?.extraPrice || 0)
        const vatPercent = Number(item?.vatPercent || 0)
        return sum + ((sellPrice + extraPrice) * quantity * vatPercent) / 100
    }, 0)

    useEffect(() => {
        form.setFieldsValue({
            totalAmount: Number(subtotal.toFixed(2)),
            vatValue: Number(vatValue.toFixed(2)),
        })
    }, [form, subtotal, vatValue])

    return (
        <Row gutter={12} className="mt-12">
            <Col xs={12} md={6}>
                <Form.Item
                    label={
                        <FormattedMessage
                            id="management.sales.form.label.subtotal"
                            defaultMessage="Subtotal"
                        />
                    }
                    name="totalAmount"
                >
                    <InputNumber
                        min={0}
                        className="w-full"
                        readOnly
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
                    />
                </Form.Item>
            </Col>
            <Col xs={12} md={6}>
                <Form.Item
                    label={
                        <FormattedMessage
                            id="management.sales.form.label.vat-value"
                            defaultMessage="VAT Value"
                        />
                    }
                    name="vatValue"
                >
                    <InputNumber
                        min={0}
                        className="w-full"
                        readOnly
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
                    />
                </Form.Item>
            </Col>
            <Col xs={12} md={6}>
                <Form.Item
                    label={
                        <FormattedMessage
                            id="management.sales.form.label.discount"
                            defaultMessage="Discount"
                        />
                    }
                    name="discountValue"
                >
                    <InputNumber
                        min={0}
                        className="w-full"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
                    />
                </Form.Item>
            </Col>
            <Col xs={12} md={6}>
                <Form.Item
                    label={
                        <FormattedMessage
                            id="management.sales.form.label.paid-amount"
                            defaultMessage="Paid Amount"
                        />
                    }
                    name="paidAmount"
                >
                    <InputNumber
                        min={0}
                        className="w-full"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
                    />
                </Form.Item>
            </Col>
        </Row>
    )
}
