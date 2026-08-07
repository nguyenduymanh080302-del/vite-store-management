import {
    Button,
    Col,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Switch,
    Tag,
    Typography,
    Upload
} from 'antd'
import Table, { ColumnType } from 'antd/es/table'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { IconPlus, IconTrash } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import { useCategoryListQuery } from '@/hooks/useCategory'
import { useDebounce } from '@/hooks/useDebounce'
import {
    useCreateProductMutation,
    useDeleteProductMutation,
    useProductListQuery,
    useUpdateProductMutation
} from "@/hooks/useProduct"
import { useUnitListQuery } from '@/hooks/useUnit'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from '@/stores/app.store'
import { generatePathFromName, getBase64, normalizeSlug, normalizeSpace, removeCharactersTone } from '@/utils/hepler'

type ProductFormExtraPriceValue = {
    label: string
    price: number | string
}

type ProductFormUnitValue = {
    unitId: number | string
    importPrice?: number | string
    sellPrice: number | string
    vatPercent?: number | string
    extraPrices?: ProductFormExtraPriceValue[]
}

type ProductFormValues = Omit<CreateProductPayload, 'units' | 'images'> & {
    units?: ProductFormUnitValue[]
}

const validatePositiveNumber = (_: unknown, value?: number | string) => {
    if (value === undefined || value === null || value === '') {
        return Promise.reject(new Error('Required'))
    }

    if (Number(value) > 0) {
        return Promise.resolve()
    }

    return Promise.reject(new Error('Value must be greater than 0'))
}

const validateVatPercent = (_: unknown, value?: number | string) => {
    if (value === undefined || value === null || value === '') {
        return Promise.resolve()
    }

    const numericValue = Number(value)
    if (numericValue >= 0 && numericValue <= 100) {
        return Promise.resolve()
    }

    return Promise.reject(new Error('VAT must be between 0 and 100'))
}

const normalizeProductFormValues = (raw: ProductFormValues): CreateProductPayload => ({
    ...raw,
    units: raw.units?.map((unit) => ({
        ...unit,
        unitId: Number(unit.unitId),
        importPrice: unit.importPrice === undefined || unit.importPrice === null || unit.importPrice === '' ? 0 : Number(unit.importPrice),
        sellPrice: Number(unit.sellPrice),
        vatPercent: Number(unit.vatPercent || 0),
        extraPrices: unit.extraPrices?.map((extraPrice) => ({
            label: extraPrice.label,
            price: Number(extraPrice.price),
        })),
    })),
})

const formatAmount = (value?: number, locale?: string) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        maximumFractionDigits: 2,
    }).format(value || 0)

export const ProductManagementContent = () => {
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<ModalActionMode>('create')
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [imageFileList, setImageFileList] = useState<UploadFile[]>([])
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([])
    const [searchValue, setSearchValue] = useState('')
    const debouncedSearchValue = useDebounce(searchValue, 300)
    const [form] = Form.useForm<ProductFormValues>()

    const { data } = useProductListQuery({
        page: 1,
        limit: 100,
        search: debouncedSearchValue.trim() ? removeCharactersTone(debouncedSearchValue.trim()) : undefined,
    })
    const { data: categoryData } = useCategoryListQuery()
    const { data: unitData } = useUnitListQuery()

    const { mutateAsync: createProduct, isPending: isCreating } = useCreateProductMutation()
    const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProductMutation()
    const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProductMutation()

    const locale = useAppStore(state => state.locale)
    const intl = useIntl()

    const handleChangeMode = (mode: ModalActionMode, product?: Product) => {
        setMode(mode)

        switch (mode) {
            case 'create':
                form.resetFields()
                setImageFileList([])
                setDeletedImageIds([])
                break

            case 'edit':
                if (product) {
                    form.setFieldsValue({
                        name: product.name,
                        slug: product.slug,
                        description: product.description,
                        categoryId: product.categoryId,
                        units: product.units as unknown as ProductFormValues['units'],
                        isActive: product?.isActive,
                    })
                    setImageFileList(
                        (product.images || []).map((image) => ({
                            uid: `existing-${image.id}`,
                            name: `image-${image.id}`,
                            status: 'done' as const,
                            url: image.url,
                        }))
                    )
                    setDeletedImageIds([])
                    setSelectedProduct(product)
                }
                break

            case 'delete':
                if (product) setSelectedProduct(product)
                break
        }

        setOpen(true)
    }

    const handleClose = () => {
        form.resetFields()
        setSelectedProduct(null)
        setImageFileList([])
        setDeletedImageIds([])
        setMode('create')
        setOpen(false)
    }

    const handleSubmit = async () => {
        try {
            switch (mode) {
                case 'create': {
                    const formData = await form.validateFields()
                    const newFiles = imageFileList
                        .filter(file => file.originFileObj)
                        .map(file => file.originFileObj!)
                        .filter(Boolean)

                    await createProduct({
                        data: normalizeProductFormValues(formData),
                        imageFiles: newFiles,
                    })
                    break
                }
                case 'edit': {
                    const formData = await form.validateFields()
                    const newFiles = imageFileList
                        .filter(file => file.originFileObj)
                        .map(file => file.originFileObj!)
                        .filter(Boolean)

                    await updateProduct({
                        id: selectedProduct!.id,
                        data: {
                            ...normalizeProductFormValues(formData),
                            deleteImageIds: deletedImageIds,
                        },
                        imageFiles: newFiles,
                    })
                    break
                }
                case 'delete':
                    await deleteProduct(selectedProduct!.id)
                    break
            }

            handleClose()
        } catch (error) {
            console.error(error)
        }
    }

    const handleGenerateSlug = () => {
        const name = form.getFieldValue('name')
        if (!name) return

        form.setFieldValue('slug', generatePathFromName(name))
    }

    const handleImageChange = async ({ fileList }: UploadChangeParam<UploadFile>) => {
        const nextFileList = [...fileList]

        // Track deleted existing images
        const currentUids = nextFileList.map(f => f.uid)
        const previousUids = imageFileList.map(f => f.uid)
        const removedUids = previousUids.filter(uid => !currentUids.includes(uid))

        const newDeletedIds = removedUids
            .filter(uid => uid.startsWith('existing-'))
            .map(uid => {
                const idStr = uid.replace('existing-', '')
                return parseInt(idStr, 10)
            })
            .filter(id => !isNaN(id))

        if (newDeletedIds.length > 0) {
            setDeletedImageIds(prev => [...prev, ...newDeletedIds])
        }

        // For new files, set thumbUrl for preview
        await Promise.all(
            nextFileList.map(async (file) => {
                if (file.url || file.thumbUrl) return

                if (file.originFileObj) {
                    const base64 = await getBase64(file.originFileObj)
                    if (typeof base64 === 'string') {
                        file.thumbUrl = base64
                    }
                }
            })
        )

        setImageFileList(nextFileList)
    }

    const productList = data?.data?.items || []
    const categories = categoryData?.data || []
    const units = unitData?.data || []

    const columns: ColumnType<Product>[] = [
        {
            title: <FormattedMessage id="table.column.image" />,
            dataIndex: 'images',
            width: 96,
            render: (images: Product['images']) => {
                const imageUrl = images?.[0]?.url

                return imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Product"
                        style={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '1px solid var(--color-neutral-4)',
                        }}
                    />
                ) : (
                    <Typography.Text type="secondary">--</Typography.Text>
                )
            },
        },
        {
            title: <FormattedMessage id="table.column.product" />,
            dataIndex: 'name',
            render: (_, record) => (
                <Button
                    type="link"
                    className="px-0"
                    onClick={() => handleChangeMode('edit', record)}
                >
                    {record.name}
                </Button>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: <FormattedMessage id="table.column.category" />,
            render: (_, record) => record.category?.name,
        },
        {
            title: <FormattedMessage id="table.column.unit" />,
            dataIndex: 'units',
            render: (productUnits: Product['units']) => (
                <Flex vertical gap={4}>
                    {productUnits?.length ? (
                        productUnits.map((unit) => (
                            <Typography.Text key={`${unit.unitId}-${unit.sellPrice}`}>
                                {(unit.unit?.name || `Unit ${unit.unitId}`)}: {formatAmount(unit.sellPrice, locale)}
                            </Typography.Text>
                        ))
                    ) : (
                        <Typography.Text type="secondary">--</Typography.Text>
                    )}
                </Flex>
            ),
        },
        {
            title: <FormattedMessage id="table.column.active" />,
            dataIndex: 'isActive',
            render: (value: boolean) => (
                <Tag color={value ? 'green' : 'red'}>
                    <FormattedMessage id={value ? 'common.yes' : 'common.no'} />
                </Tag>
            ),
        },
    ]

    return (
        <Flex vertical gap={12}>
            <Flex justify="space-between">
                <Input
                    allowClear
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder={intl.formatMessage({
                        id: 'management.product.filter.search-placeholder',
                    })}
                    style={{ maxWidth: 320 }}
                />

                <Button
                    type="primary"
                    onClick={() => handleChangeMode('create')}
                >
                    <IconPlus width={16} color="var(--color-neutral-0)" />
                    <FormattedMessage id="management.product.btn.create-product" />
                </Button>
            </Flex>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={productList}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                open={open}
                title={<FormattedMessage id={`management.product.modal.title.${mode}-product`} />}
                onCancel={handleClose}
                onOk={handleSubmit}
                width={960}
                okText={<FormattedMessage id={`management.product.modal.btn.${mode}`} />}
                okButtonProps={{
                    className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary',
                    loading: isCreating || isUpdating || isDeleting,
                }}
                cancelText={<FormattedMessage id="management.product.modal.btn.cancel" />}
            >
                {mode === 'delete' ? (
                    <Flex vertical justify="center" align="center" className="p-24 border-red-4 border-2 rounded-12">
                        <FormattedMessage id="management.product.modal.confirm-delete" />
                        <Typography.Text strong className="mx-4">
                            {selectedProduct?.name}
                        </Typography.Text>
                    </Flex>
                ) : (
                    <Form form={form} layout="vertical" preserve={false}>
                        <Row gutter={12}>
                            <Col xs={24} md={12}>
                                <Form.Item label={<FormattedMessage id='management.product.modal.label.product-images' />} required>
                                    <Upload
                                        accept="image/*"
                                        listType="picture-card"
                                        multiple
                                        beforeUpload={() => false}
                                        fileList={imageFileList}
                                        onChange={handleImageChange}
                                    >
                                        {imageFileList.length >= 5 ? null : '+'}
                                    </Upload>
                                </Form.Item>
                                <Form.Item name="images" hidden>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<FormattedMessage id='management.product.modal.label.product-name' />}
                                    name="name"
                                    normalize={normalizeSpace}
                                    rules={[{ required: true }]}
                                >
                                    <Input
                                        placeholder={intl.formatMessage({
                                            id: 'management.product.modal.placeholder.product-name',
                                        })}
                                    />
                                </Form.Item>
                                <Form.Item label={<FormattedMessage id='management.product.modal.label.product-slug' />} required>
                                    <Flex gap={8}>
                                        <Form.Item
                                            name="slug"
                                            noStyle
                                            normalize={normalizeSlug}
                                            rules={[{ required: true }]}
                                        >
                                            <Input
                                                placeholder={intl.formatMessage({
                                                    id: 'management.product.modal.placeholder.product-slug',
                                                })}
                                            />
                                        </Form.Item>
                                        <Button type="primary" htmlType="button" onClick={handleGenerateSlug}>
                                            <FormattedMessage id='management.product.modal.btn.generate-slug' />
                                        </Button>
                                    </Flex>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<FormattedMessage id='management.product.modal.label.product-category' />}
                                    name="categoryId"
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        options={categories.map(c => ({
                                            label: c.name,
                                            value: c.id,
                                        }))}
                                        placeholder={intl.formatMessage({
                                            id: 'management.product.modal.placeholder.select-category',
                                        })}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label={<FormattedMessage id='management.product.modal.label.product-active' />}
                                    name="isActive"
                                    valuePropName="checked"
                                    initialValue={true}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                {/* UNITS */}
                                <Form.List name="units">
                                    {(fields, { add, remove }) => (
                                        <>
                                            <Flex justify="space-between" align='center' className='mb-12'>
                                                <Typography.Title level={5} className='m-0'>
                                                    <FormattedMessage id='management.product.modal.label.units' />
                                                </Typography.Title>
                                                <Button onClick={() => add({ vatPercent: 0 })}>
                                                    <FormattedMessage id='management.product.modal.btn.add-unit' />
                                                </Button>
                                            </Flex>

                                            {fields.map(field => (
                                                <div key={field.key} className="border-t-1 border-neutral-4 p-12 rounded mb-12">
                                                    {/* UNIT ID */}
                                                    <Flex
                                                        align="center"
                                                        justify="space-between"
                                                        gap={12}
                                                        className="mb-12"
                                                    >
                                                        <Form.Item
                                                            name={[field.name, 'unitId']}
                                                            rules={[{ required: true }]}
                                                            className="mb-0"
                                                            style={{ width: 220, maxWidth: '100%' }}
                                                        >
                                                            <Select
                                                                options={units.map(unit => ({
                                                                    label: unit.name,
                                                                    value: unit.id,
                                                                }))}
                                                                placeholder={<FormattedMessage id='management.product.modal.placeholder.select-unit' />}
                                                            />
                                                        </Form.Item>
                                                        <Button danger onClick={() => remove(field.name)}>
                                                            <IconTrash width={18} height={18} />
                                                        </Button>
                                                    </Flex>

                                                    <Flex
                                                        align="center"
                                                        justify="space-between"
                                                        gap={12}
                                                        className='mb-12'
                                                    >
                                                        <Typography.Text>
                                                            <FormattedMessage id="management.product.modal.label.import-price" />
                                                        </Typography.Text>
                                                        <Form.Item
                                                            name={[field.name, 'importPrice']}
                                                            className="mb-0"
                                                            style={{ width: 140, maxWidth: '100%' }}
                                                        >
                                                            <InputNumber
                                                                min={0}
                                                                placeholder={intl.formatMessage({
                                                                    id: 'management.product.modal.placeholder.import-price',
                                                                })}
                                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Form.Item>
                                                    </Flex>

                                                    <Flex
                                                        align="center"
                                                        justify="space-between"
                                                        gap={12}
                                                        className='mb-12'
                                                    >
                                                        <Typography.Text>
                                                            <FormattedMessage id="management.product.modal.label.sell-price" />
                                                        </Typography.Text>
                                                        <Form.Item
                                                            name={[field.name, 'sellPrice']}
                                                            rules={[{ validator: validatePositiveNumber }]}
                                                            className="mb-0"
                                                            style={{ width: 140, maxWidth: '100%' }}
                                                        >
                                                            <InputNumber
                                                                min={0}
                                                                placeholder={intl.formatMessage({
                                                                    id: 'management.product.modal.placeholder.sell-price',
                                                                })}
                                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Form.Item>
                                                    </Flex>

                                                    <Flex
                                                        align="center"
                                                        justify="space-between"
                                                        gap={12}
                                                        className='mb-12'
                                                    >
                                                        <Typography.Text>
                                                            <FormattedMessage id="management.product.modal.label.vat" />
                                                        </Typography.Text>
                                                        <Form.Item
                                                            name={[field.name, 'vatPercent']}
                                                            rules={[{ validator: validateVatPercent }]}
                                                            className="mb-0"
                                                            style={{ width: 140, maxWidth: '100%' }}
                                                        >
                                                            <Input
                                                                type="number"
                                                                placeholder={intl.formatMessage({
                                                                    id: 'management.product.modal.placeholder.vat',
                                                                })}
                                                            />
                                                        </Form.Item>
                                                    </Flex>

                                                    {/* EXTRA PRICES */}
                                                    <Form.List name={[field.name, 'extraPrices']}>
                                                        {(extraFields, { add: addExtra, remove: removeExtra }) => (
                                                            <>
                                                                <Flex justify="space-between" align='center' className='mb-12'>
                                                                    <Typography.Text>
                                                                        <FormattedMessage id="management.product.modal.label.extra-prices" />
                                                                    </Typography.Text>
                                                                    <Button onClick={() => addExtra()}>
                                                                        <FormattedMessage id="management.product.modal.btn.add-extra-price" />
                                                                    </Button>
                                                                </Flex>

                                                                {extraFields.map(extra => (
                                                                    <Flex key={extra.key} gap={8}>
                                                                        <Form.Item
                                                                            name={[extra.name, 'label']}
                                                                            rules={[{ required: true }]}
                                                                        >
                                                                            <Input
                                                                                placeholder={intl.formatMessage({
                                                                                    id: 'management.product.modal.placeholder.extra-price-label',
                                                                                })}
                                                                            />
                                                                        </Form.Item>

                                                                        <Form.Item
                                                                            name={[extra.name, 'price']}
                                                                            rules={[{ validator: validatePositiveNumber }]}
                                                                        >
                                                                            <InputNumber
                                                                                min={0}
                                                                                placeholder={intl.formatMessage({
                                                                                    id: 'management.product.modal.placeholder.extra-price',
                                                                                })}
                                                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                                parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
                                                                            />
                                                                        </Form.Item>

                                                                        <Button
                                                                            danger
                                                                            onClick={() => removeExtra(extra.name)}
                                                                        >
                                                                            <IconTrash width={18} height={18} />
                                                                        </Button>
                                                                    </Flex>
                                                                ))}
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </Form.List>
                            </Col>
                        </Row>

                        {/* DESCRIPTION */}
                        <Form.Item
                            label={<FormattedMessage id="management.product.modal.label.product-description" />}
                            name="description"
                            rules={[{ required: true }]}
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder={intl.formatMessage({
                                    id: 'management.product.modal.placeholder.product-description',
                                })}
                            />
                        </Form.Item>

                        {/* CATEGORY */}





                    </Form>
                )}
            </Modal>
        </Flex>
    )
}

