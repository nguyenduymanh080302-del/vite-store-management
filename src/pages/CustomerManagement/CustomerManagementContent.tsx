import {
    Button,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Typography,
} from 'antd'
import Table, { ColumnType } from 'antd/es/table'
import { IconPlus, IconTrash } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import dayjs from 'dayjs'
import {
    useCustomerListQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
} from '@/hooks/useCustomer'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from '@/stores/app.store'
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant'
import { normalizeSpace } from '@/utils/hepler'

export const CustomerManagementContent = () => {
    const { data } = useCustomerListQuery()
    const { mutateAsync: createCustomer, isPending: isCreating } = useCreateCustomerMutation()
    const { mutateAsync: updateCustomer, isPending: isUpdating } = useUpdateCustomerMutation()
    const { mutateAsync: deleteCustomer, isPending: isDeleting } = useDeleteCustomerMutation()
    const locale = useAppStore((state) => state.locale)
    const intl = useIntl()

    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<ModalActionMode>('create')
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [form] = Form.useForm()

    /* ======================
       HANDLERS
    ====================== */

    const handleChangeMode = (mode: ModalActionMode, customer?: Customer) => {
        setMode(mode)
        switch (mode) {
            case 'create':
                form.resetFields()
                break
            case 'edit':
                if (customer) {
                    form.setFieldsValue({
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.address,
                        debt: customer.debt,
                    })
                    setSelectedCustomer(customer)
                }
                break
            case 'delete':
                if (customer) setSelectedCustomer(customer)
                break
        }

        setOpen(true)
    }

    const handleClose = () => {
        form.resetFields()
        setSelectedCustomer(null)
        setMode('create')
        setOpen(false)
    }

    const handleSubmit = async () => {
        try {
            if (!selectedCustomer && mode !== 'create') return

            const values = mode === 'delete' ? null : await form.validateFields()

            switch (mode) {
                case 'create':
                    await createCustomer(values)
                    break
                case 'edit':
                    await updateCustomer({
                        id: selectedCustomer!.id,
                        data: values,
                    })
                    break
                case 'delete':
                    await deleteCustomer(selectedCustomer!.id)
                    break
            }

            handleClose()
        } catch (error) {
            console.error('Action failed:', error)
        }
    }

    const customerList = data?.data || []

    /* ======================
       TABLE COLUMNS
    ====================== */

    const columns: ColumnType<Customer>[] = [
        {
            title: <FormattedMessage id="table.column.id" />,
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: <FormattedMessage id="table.column.customer" />,
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
            render: (value) => value
                ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale])
                : '--/--/----',
            sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
        },
        {
            title: <FormattedMessage id="table.column.updated-at" />,
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (value) => value
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

    /* ======================
       RENDER
    ====================== */

    return (
        <Flex vertical gap={12}>
            <Flex justify="space-between">
                <Typography.Title level={5} className="m-0" />
                <Button type="primary" size="middle"
                    className="flex flex-row items-center gap-8"
                    onClick={() => handleChangeMode('create')}
                >
                    <IconPlus width={16} color="var(--color-neutral-0)" />
                    <FormattedMessage id="management.customer.btn.create-customer" />
                </Button>
            </Flex>

            <Table<Customer>
                rowKey="id"
                columns={columns}
                dataSource={customerList}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                className="flex-1"
                showSorterTooltip={false}
            />

            <Modal
                open={open}
                title={<FormattedMessage id={`management.customer.modal.title.${mode}-customer`} />}
                onCancel={handleClose}
                onOk={handleSubmit}
                okText={<FormattedMessage id={`management.customer.modal.btn.${mode}`} />}
                okButtonProps={{
                    className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary',
                    loading: isCreating || isUpdating || isDeleting,
                }}
                cancelText={<FormattedMessage id="management.customer.modal.btn.cancel" />}
            >
                {mode === 'delete' ? (
                    <Flex vertical justify="center" align="center"
                        className="p-24 border-red-4 border-2 rounded-12"
                    >
                        <FormattedMessage id="management.customer.modal.confirm-delete" />
                        <Typography.Text strong className="text-red-6 mx-4">
                            {selectedCustomer?.name}
                        </Typography.Text>
                    </Flex>
                ) : (
                    <Form form={form} layout="vertical" preserve={false}>
                        {/* NAME */}
                        <Form.Item label={<FormattedMessage id="management.customer.modal.label.customer-name" />}
                            name="name" normalize={normalizeSpace}
                            rules={[
                                {
                                    required: true,
                                    message: (<FormattedMessage id="message.customer.name-is-required" />),
                                },
                                {
                                    whitespace: true,
                                    message: (<FormattedMessage id="message.customer.name-not-empty" />),
                                },
                                {
                                    max: 64,
                                    message: (<FormattedMessage id="message.customer.name-max-length-is-64" />),
                                },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.customer.modal.placeholder.customer-name',
                                })}
                            />
                        </Form.Item>

                        {/* EMAIL (OPTIONAL) */}
                        <Form.Item label={<FormattedMessage id="management.customer.modal.label.customer-email" />}
                            name="email"
                            rules={[
                                {
                                    type: 'email',
                                    message: (<FormattedMessage id="message.customer.email-invalid" />),
                                },
                                {
                                    max: 128,
                                    message: (<FormattedMessage id="message.customer.email-max-length-is-128" />),
                                },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.customer.modal.placeholder.customer-email',
                                })}
                            />
                        </Form.Item>

                        {/* PHONE (OPTIONAL, VN REGEX) */}
                        <Form.Item
                            label={<FormattedMessage id="management.customer.modal.label.customer-phone" />}
                            name="phone"
                            rules={[
                                {
                                    pattern: /^(03|05|07|08|09)\d{8}$/,
                                    message: (<FormattedMessage id="message.customer.phone-invalid-vn" />),
                                },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.customer.modal.placeholder.customer-phone',
                                })}
                            />
                        </Form.Item>

                        {/* ADDRESS (OPTIONAL) */}
                        <Form.Item
                            label={<FormattedMessage id="management.customer.modal.label.customer-address" />}
                            name="address"
                            rules={[
                                {
                                    max: 255,
                                    message: (<FormattedMessage id="message.customer.address-max-length-is-255" />),
                                },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.customer.modal.placeholder.customer-address',
                                })}
                            />
                        </Form.Item>

                        {/* DEBT (OPTIONAL) */}
                        <Form.Item
                            label={<FormattedMessage id="management.customer.modal.label.customer-debt" />}
                            name="debt"
                            rules={[
                                {
                                    type: 'number',
                                    message: (<FormattedMessage id="message.customer.debt-must-is-number" />),
                                },
                            ]}
                        >
                            <InputNumber
                                placeholder={intl.formatMessage({
                                    id: 'management.customer.modal.placeholder.customer-debt',
                                })}
                                className="w-full" min={0}
                            />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </Flex>
    )
}

