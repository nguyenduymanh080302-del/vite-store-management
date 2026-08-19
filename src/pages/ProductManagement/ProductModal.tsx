import { IconTrash } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import { useCategoryListQuery } from '@/hooks/useCategory'
import { useCreateProductMutation, useDeleteProductMutation, useUpdateProductMutation } from '@/hooks/useProduct'
import { useUnitListQuery } from '@/hooks/useUnit'
import { getBase64, generatePathFromName, normalizeSlug, normalizeSpace } from '@/utils/hepler'
import { Button, Col, Flex, Form, Input, InputNumber, Modal, Row, Select, Switch, Typography, Upload } from 'antd'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import {
    normalizeProductFormValues,
    validatePositiveNumber,
    validateVatPercent,
    type ProductFormValues,
} from './productManagement.shared'

interface Props {
    mode: ModalActionMode
    selectedProduct: Product | null
    handleChangeMode: (mode: ModalActionMode) => void
}

const ProductModal = ({ mode, selectedProduct, handleChangeMode }: Props) => {
    const [form] = Form.useForm<ProductFormValues>()
    const [imageFileList, setImageFileList] = useState<UploadFile[]>(
        () =>
            selectedProduct?.images?.map((image) => ({
                uid: `existing-${image.id}`,
                name: `image-${image.id}`,
                status: 'done' as const,
                url: image.url,
            })) ?? []
    )
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([])
    const modalMode = mode ?? 'create'

    const { data: categoryData } = useCategoryListQuery()
    const { data: unitData } = useUnitListQuery()
    const { mutateAsync: createProduct, isPending: isCreating } = useCreateProductMutation()
    const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProductMutation()
    const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProductMutation()
    const intl = useIntl()

    const categories = categoryData?.data || []
    const units = unitData?.data || []

    const handleClose = () => {
        handleChangeMode(null)
    }

    const handleGenerateSlug = () => {
        const name = form.getFieldValue('name')
        if (!name) return

        form.setFieldValue('slug', generatePathFromName(name))
    }

    const handleImageChange = async ({ fileList }: UploadChangeParam<UploadFile>) => {
        const nextFileList = [...fileList]

        const currentUids = nextFileList.map((file) => file.uid)
        const previousUids = imageFileList.map((file) => file.uid)
        const removedUids = previousUids.filter((uid) => !currentUids.includes(uid))

        const newDeletedIds = removedUids
            .filter((uid) => uid.startsWith('existing-'))
            .map((uid) => {
                const idStr = uid.replace('existing-', '')
                return parseInt(idStr, 10)
            })
            .filter((id) => !Number.isNaN(id))

        if (newDeletedIds.length > 0) {
            setDeletedImageIds((prev) => [...prev, ...newDeletedIds])
        }

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

    const handleSubmit = async () => {
        try {
            if (mode === 'delete') {
                if (!selectedProduct) return

                await deleteProduct(selectedProduct.id)
                handleClose()
                return
            }

            const formData = await form.validateFields()
            const newFiles = imageFileList
                .filter((file) => file.originFileObj)
                .map((file) => file.originFileObj!)
                .filter(Boolean)

            if (mode === 'create') {
                await createProduct({
                    data: normalizeProductFormValues(formData),
                    imageFiles: newFiles,
                })
            }

            if (mode === 'edit' && selectedProduct) {
                await updateProduct({
                    id: selectedProduct.id,
                    data: {
                        ...normalizeProductFormValues(formData),
                        deleteImageIds: deletedImageIds,
                    },
                    imageFiles: newFiles,
                })
            }

            handleClose()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Modal
            open={mode !== null}
            title={<FormattedMessage id={`management.product.modal.title.${modalMode}-product`} />}
            onCancel={handleClose}
            onOk={handleSubmit}
            width={960}
            okText={<FormattedMessage id={`management.product.modal.btn.${modalMode}`} />}
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
                <Form
                    key={`${mode ?? 'closed'}-${selectedProduct?.id ?? 'new'}`}
                    form={form}
                    layout="vertical"
                    preserve={false}
                    initialValues={
                        mode === 'edit' && selectedProduct
                            ? {
                                name: selectedProduct.name,
                                slug: selectedProduct.slug,
                                description: selectedProduct.description,
                                categoryId: selectedProduct.categoryId,
                                units: selectedProduct.units as unknown as ProductFormValues['units'],
                                isActive: selectedProduct.isActive,
                            }
                            : { isActive: true }
                    }
                >
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
                                    options={categories.map((category) => ({
                                        label: category.name,
                                        value: category.id,
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

                                        {fields.map((field) => (
                                            <div key={field.key} className="border-t-1 border-neutral-4 p-12 rounded mb-12">
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
                                                            options={units.map((unit) => ({
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

                                                            {extraFields.map((extra) => (
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
                </Form>
            )}
        </Modal>
    )
}

export default ProductModal
