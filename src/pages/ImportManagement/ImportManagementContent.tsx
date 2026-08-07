import { Button, Flex, Form, Input, InputNumber, Modal, Select, Table, Typography } from 'antd'
import type { ColumnType } from 'antd/es/table'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { IconPlus, IconTrash } from '@/assets/icons'
import { useWarehouseListQuery } from '@/hooks/useWarehouse'
import { useSupplierListQuery } from '@/hooks/useSupplier'
import { useProductListQuery } from '@/hooks/useProduct'
import { useCreateImportMutation } from '@/hooks/useImport'
import { useDebounce } from '@/hooks/useDebounce'

type ImportLineFormValue = {
    productId?: number
    unitId?: number
    quantity?: number
}

type ImportFormValues = {
    supplierId?: number
    products?: ImportLineFormValue[]
}

export const ImportManagementContent = () => {
    const intl = useIntl()
    const [form] = Form.useForm<ImportFormValues>()
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isProductPickerOpen, setIsProductPickerOpen] = useState(false)
    const [productFieldIndex, setProductFieldIndex] = useState<number | null>(null)
    const [productSearch, setProductSearch] = useState('')
    const debouncedSearch = useDebounce(productSearch, 400)
    const { data: warehouseData } = useWarehouseListQuery()
    const { data: supplierData } = useSupplierListQuery()
    const { data: productData } = useProductListQuery({ page: 1, limit: 100 })
    const { data: productSearchData } = useProductListQuery({
        page: 1,
        limit: 20,
        search: debouncedSearch.trim() || undefined,
    })
    const { mutateAsync: createImport, isPending } = useCreateImportMutation()

    const warehouses = warehouseData?.data || []
    const suppliers = supplierData?.data || []
    const products = (productData?.data?.items || []).filter((product) => product.isActive)
    const searchProducts = (productSearchData?.data?.items || []).filter((product) => product.isActive)

    const openImportModal = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse)
        form.setFieldsValue({ products: [] })
        setIsModalOpen(true)
    }

    const closeImportModal = () => {
        form.resetFields()
        setSelectedWarehouse(null)
        setIsModalOpen(false)
    }

    const openProductPicker = (index: number) => {
        setProductFieldIndex(index)
        setProductSearch('')
        setIsProductPickerOpen(true)
    }

    const selectProduct = (product: Product) => {
        if (productFieldIndex !== null) {
            const firstUnit = product.units[0]
            form.setFields([
                { name: ['products', productFieldIndex, 'productId'], value: product.id },
                { name: ['products', productFieldIndex, 'unitId'], value: firstUnit?.unitId },
                { name: ['products', productFieldIndex, 'quantity'], value: 1 },
            ])
        }
        setIsProductPickerOpen(false)
        setProductFieldIndex(null)
    }

    const submitImport = async (values: ImportFormValues) => {
        if (!selectedWarehouse) return
        await createImport({
            warehouseId: selectedWarehouse.id,
            supplierId: Number(values.supplierId),
            products: (values.products || []).map((item) => ({
                productId: Number(item.productId),
                unitId: Number(item.unitId),
                quantity: Number(item.quantity),
            })),
        })
        closeImportModal()
    }

    const columns: ColumnType<Warehouse>[] = [
        { title: intl.formatMessage({ id: 'management.warehouse.modal.label.warehouse-name', defaultMessage: 'Warehouse' }), dataIndex: 'name' },
        {
            title: 'Total items',
            render: (_, warehouse) => warehouse.products?.reduce((total, product) => total + product.quantity, 0) || 0,
        },
        {
            title: 'Action',
            render: (_, warehouse) => (
                <Button type="primary" onClick={() => openImportModal(warehouse)}>
                    Import products
                </Button>
            ),
        },
    ]

    return (
        <>
            <Typography.Title level={3}>Import products to warehouse</Typography.Title>
            <Table<Warehouse> rowKey="id" columns={columns} dataSource={warehouses} pagination={false} />

            <Modal
                open={isModalOpen}
                title={`Import products to ${selectedWarehouse?.name || ''}`}
                onCancel={closeImportModal}
                onOk={() => form.submit()}
                okText="Import products"
                confirmLoading={isPending}
                width={780}
            >
                <Form form={form} layout="vertical" onFinish={submitImport}>
                    <Form.Item
                        name="supplierId"
                        label="Supplier"
                        rules={[{ required: true, message: 'Select a supplier' }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Select supplier"
                            options={suppliers.map((supplier) => ({ label: supplier.name, value: supplier.id }))}
                        />
                    </Form.Item>

                    <Form.List
                        name="products"
                        rules={[{ validator: async (_, value) => {
                            if (!value?.length) throw new Error('Add at least one product')
                        } }]}
                    >
                        {(fields, { add, remove }, { errors }) => (
                            <Flex vertical gap={12}>
                                <Flex justify="space-between" align="center">
                                    <Typography.Title level={5} className="m-0">Products</Typography.Title>
                                    <Button icon={<IconPlus width={16} height={16} />} onClick={() => add({ quantity: 1 })}>
                                        Add product
                                    </Button>
                                </Flex>

                                {fields.map((field) => {
                                    const productId = form.getFieldValue(['products', field.name, 'productId'])
                                    const selectedProduct = products.find((product) => product.id === productId)
                                    const unitOptions = (selectedProduct?.units || []).map((unit) => ({
                                        label: unit.unit?.name || `Unit ${unit.unitId}`,
                                        value: unit.unitId,
                                    }))

                                    return (
                                        <Flex key={field.key} gap={12} align="end" className="border-1 border-neutral-4 rounded-8 p-12">
                                            <Form.Item name={[field.name, 'productId']} hidden rules={[{ required: true, message: 'Select a product' }]} />
                                            <Form.Item label="Product" className="flex-1 m-0">
                                                <Button className="w-full text-left" onClick={() => openProductPicker(field.name)}>
                                                    {selectedProduct?.name || 'Select product'}
                                                </Button>
                                            </Form.Item>
                                            <Form.Item name={[field.name, 'unitId']} label="Unit" className="flex-1 m-0" rules={[{ required: true, message: 'Select a unit' }]}>
                                                <Select options={unitOptions} onChange={() => form.setFieldValue(['products', field.name, 'quantity'], 1)} />
                                            </Form.Item>
                                            <Form.Item name={[field.name, 'quantity']} label="Quantity" className="m-0" rules={[{ required: true, message: 'Enter quantity' }]}>
                                                <InputNumber min={1} />
                                            </Form.Item>
                                            <Button danger onClick={() => remove(field.name)}><IconTrash width={18} height={18} /></Button>
                                        </Flex>
                                    )
                                })}
                                {errors.map((error, index) => <Typography.Text key={index} type="danger">{error}</Typography.Text>)}
                            </Flex>
                        )}
                    </Form.List>
                </Form>
            </Modal>

            <Modal open={isProductPickerOpen} title="Select product" footer={null} onCancel={() => setIsProductPickerOpen(false)} width={700}>
                <Flex vertical gap={12}>
                    <Input.Search allowClear size="large" value={productSearch} placeholder="Search product by name..." onChange={(event) => setProductSearch(event.target.value)} />
                    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        <Flex vertical gap={8}>
                            {searchProducts.map((product) => (
                                <Flex key={product.id} onClick={() => selectProduct(product)} className="border-1 border-neutral-4 rounded-12 p-12 cursor-pointer hover:border-main-primary" align="center" gap={12}>
                                    {product.images?.[0]?.url && <img src={product.images[0].url} alt={product.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />}
                                    <Flex vertical><Typography.Text strong>{product.name}</Typography.Text><Typography.Text type="secondary">{product.category?.name}</Typography.Text></Flex>
                                </Flex>
                            ))}
                            {!searchProducts.length && <Typography.Text type="secondary">No products found</Typography.Text>}
                        </Flex>
                    </div>
                </Flex>
            </Modal>
        </>
    )
}
