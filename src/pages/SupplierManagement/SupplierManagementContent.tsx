import { Button, Flex, Form, Input, InputNumber, Modal, Typography } from 'antd'
import Table, { ColumnType } from 'antd/es/table'
import { IconPlus, IconTrash } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import dayjs from 'dayjs'
import {
    useSupplierListQuery,
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation,
} from '@/hooks/useSupplier'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from '@/stores/app.store'
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant'
import { normalizeSpace } from '@/utils/hepler'

export const SupplierManagementContent = () => {
    const { data } = useSupplierListQuery()
    const { mutateAsync: createSupplier, isPending: isCreating } = useCreateSupplierMutation()
    const { mutateAsync: updateSupplier, isPending: isUpdating } = useUpdateSupplierMutation()
    const { mutateAsync: deleteSupplier, isPending: isDeleting } = useDeleteSupplierMutation()

    const locale = useAppStore(state => state.locale)
    const intl = useIntl()

    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<ModalActionMode>('create')
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
    const [form] = Form.useForm()

    const handleChangeMode = (mode: ModalActionMode, supplier?: Supplier) => {
        setMode(mode)
        switch (mode) {
            case 'create':
                form.resetFields()
                break
            case 'edit':
                if (supplier) {
                    form.setFieldsValue({
                        name: supplier.name,
                        email: supplier.email,
                        phone: supplier.phone,
                        address: supplier.address,
                        debt: supplier.debt,
                    })
                    setSelectedSupplier(supplier)
                }
                break
            case 'delete':
                if (supplier) setSelectedSupplier(supplier)
                break
        }

        setOpen(true)
    }

    const handleClose = () => {
        form.resetFields()
        setSelectedSupplier(null)
        setMode('create')
        setOpen(false)
    }

    const handleSubmit = async () => {
        try {
            if (!selectedSupplier && mode !== 'create') return
            const values = mode === 'delete' ? null : await form.validateFields()
            switch (mode) {
                case 'create':
                    await createSupplier(values)
                    break
                case 'edit':
                    await updateSupplier({
                        id: selectedSupplier!.id,
                        data: values,
                    })
                    break
                case 'delete':
                    await deleteSupplier(selectedSupplier!.id)
                    break
            }
            handleClose()
        } catch (error) {
            console.error('Action failed:', error)
        }
    }

    const supplierList = data?.data || []

    const columns: ColumnType<Supplier>[] = [
        {
            title: <FormattedMessage id="table.column.id" />,
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: <FormattedMessage id="table.column.supplier" />,
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <Button type="link" className="px-0"
                    onClick={() => handleChangeMode('edit', record)}
                >
                    {record.name}
                </Button>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: <FormattedMessage id="table.column.email" />,
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: <FormattedMessage id="table.column.phone" />,
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: <FormattedMessage id="table.column.address" />,
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: <FormattedMessage id="table.column.debt" />,
            dataIndex: 'debt',
            key: 'debt',
        },
        {
            title: <FormattedMessage id="table.column.created-at" />,
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: value => value
                ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale])
                : '--/--/----',
            sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
        },
        {
            title: <FormattedMessage id="table.column.updated-at" />,
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: value => value
                ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale])
                : '--/--/----',
            sorter: (a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" className="bg-red-3"
                    onClick={() => handleChangeMode('delete', record)}
                >
                    <IconTrash height={18} width={18} />
                </Button>
            ),
        },
    ]

    return (
        <Flex vertical gap={12}>
            <Flex justify="space-between">
                <Typography.Title level={5} className="m-0" />
                <Button type="primary" size="middle"
                    className="flex flex-row items-center gap-8"
                    onClick={() => handleChangeMode('create')}
                >
                    <IconPlus width={16} color="var(--color-neutral-0)" />
                    <FormattedMessage id="management.supplier.btn.create-supplier" />
                </Button>
            </Flex>

            <Table<Supplier>
                rowKey="id"
                columns={columns}
                dataSource={supplierList}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                className="flex-1"
                showSorterTooltip={false}
            />

            <Modal
                open={open}
                title={<FormattedMessage id={`management.supplier.modal.title.${mode}-supplier`} />}
                onCancel={handleClose}
                onOk={handleSubmit}
                okText={<FormattedMessage id={`management.supplier.modal.btn.${mode}`} />}
                okButtonProps={{
                    className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary',
                    loading: isCreating || isUpdating || isDeleting,
                }}
                cancelText={<FormattedMessage id="management.supplier.modal.btn.cancel" />}
            >
                {mode === 'delete' ? (
                    <Flex vertical justify="center" align="center"
                        className="p-24 border-red-4 border-2 rounded-12"
                    >
                        <FormattedMessage id="management.supplier.modal.confirm-delete" />
                        <Typography.Text strong className="text-red-6 mx-4">
                            {selectedSupplier?.name}
                        </Typography.Text>
                    </Flex>
                ) : (
                    <Form form={form} layout="vertical" preserve={false}>
                        {/* NAME */}
                        <Form.Item
                            label={<FormattedMessage id="management.supplier.modal.label.supplier-name" />}
                            name="name"
                            normalize={normalizeSpace}
                            rules={[
                                {
                                    required: true,
                                    message: (<FormattedMessage id="message.supplier.name-is-required" />),
                                },
                                {
                                    whitespace: true,
                                    message: (<FormattedMessage id="message.supplier.name-not-empty" />),
                                },
                                {
                                    max: 64,
                                    message: (<FormattedMessage id="message.supplier.name-max-length-is-64" />),
                                },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.supplier.modal.placeholder.supplier-name',
                                })}
                            />
                        </Form.Item>

                        {/* EMAIL */}
                        <Form.Item
                            label={<FormattedMessage id="management.supplier.modal.label.supplier-email" />}
                            name="email"
                            rules={[
                                {
                                    type: 'email',
                                    message: (<FormattedMessage id="message.supplier.email-invalid" />),
                                },
                                {
                                    max: 128,
                                    message: (<FormattedMessage id="message.supplier.email-max-length-is-128" />),
                                },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.supplier.modal.placeholder.supplier-email',
                                })}
                            />
                        </Form.Item>

                        {/* PHONE */}
                        <Form.Item
                            label={<FormattedMessage id="management.supplier.modal.label.supplier-phone" />}
                            name="phone"
                            rules={[
                                {
                                    max: 20,
                                    message: (<FormattedMessage id="message.supplier.phone-max-length-is-20" />),
                                },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.supplier.modal.placeholder.supplier-phone',
                                })}
                            />
                        </Form.Item>

                        {/* ADDRESS */}
                        <Form.Item
                            label={<FormattedMessage id="management.supplier.modal.label.supplier-address" />}
                            name="address"
                            rules={[
                                {
                                    max: 255,
                                    message: (<FormattedMessage id="message.supplier.address-max-length-is-255" />),
                                },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.supplier.modal.placeholder.supplier-address',
                                })}
                            />
                        </Form.Item>

                        {/* DEBT */}
                        <Form.Item
                            label={<FormattedMessage id="management.supplier.modal.label.supplier-debt" />}
                            name="debt"
                            rules={[
                                {
                                    type: 'number',
                                    message: (<FormattedMessage id="message.supplier.debt-must-is-number" />),
                                },
                            ]}
                        >
                            <InputNumber
                                className="w-full"
                                min={0}
                                placeholder={intl.formatMessage({
                                    id: 'management.supplier.modal.placeholder.supplier-debt',
                                })}
                            />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </Flex>
    )
}

