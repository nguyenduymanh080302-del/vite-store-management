import { Button, Flex, Form, Input, Modal, Typography } from 'antd'
import Table, { ColumnType } from 'antd/es/table'
import { IconPlus, IconTrash } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import dayjs from 'dayjs'
import {
    useCreateDeliveryMutation,
    useDeleteDeliveryMutation,
    useDeliveryListQuery,
    useUpdateDeliveryMutation,
} from '@/hooks/useDelivery'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from '@/stores/app.store'
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant'
import { normalizeSpace } from '@/utils/hepler'

export const DeliveryManagementContent = () => {
    const { data } = useDeliveryListQuery()
    const { mutateAsync: createDelivery, isPending: isCreating } = useCreateDeliveryMutation()
    const { mutateAsync: updateDelivery, isPending: isUpdating } = useUpdateDeliveryMutation()
    const { mutateAsync: deleteDelivery, isPending: isDeleting } = useDeleteDeliveryMutation()

    const locale = useAppStore(state => state.locale)
    const intl = useIntl()

    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<ModalActionMode>('create')
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
    const [form] = Form.useForm()

    const handleChangeMode = (mode: ModalActionMode, delivery?: Delivery) => {
        setMode(mode)

        switch (mode) {
            case 'create':
                form.resetFields()
                break

            case 'edit':
                if (delivery) {
                    form.setFieldsValue({
                        name: delivery.name,
                        email: delivery.email,
                        phone: delivery.phone,
                        isActive: delivery.isActive,
                    })
                    setSelectedDelivery(delivery)
                }
                break

            case 'delete':
                if (delivery) setSelectedDelivery(delivery)
                break
        }

        setOpen(true)
    }

    const handleClose = () => {
        form.resetFields()
        setSelectedDelivery(null)
        setMode('create')
        setOpen(false)
    }

    const handleSubmit = async () => {
        try {
            if (!selectedDelivery && mode !== 'create') return
            const values = mode === 'delete' ? null : await form.validateFields()

            switch (mode) {
                case 'create':
                    await createDelivery(values)
                    break
                case 'edit':
                    await updateDelivery({
                        id: selectedDelivery!.id,
                        data: values,
                    })
                    break
                case 'delete':
                    await deleteDelivery(selectedDelivery!.id)
                    break
            }

            handleClose()
        } catch (error) {
            console.error('Action failed:', error)
        }
    }

    const deliveryList = data?.data || []

    const columns: ColumnType<Delivery>[] = [
        {
            title: <FormattedMessage id="table.column.id" />,
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: <FormattedMessage id="table.column.delivery" />,
            dataIndex: 'name',
            key: 'name',
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
            title: <FormattedMessage id="table.column.created-at" />,
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: value =>
                value
                    ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale])
                    : '--/--/----',
            sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
        },
        {
            title: <FormattedMessage id="table.column.updated-at" />,
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: value =>
                value
                    ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale])
                    : '--/--/----',
            sorter: (a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    className="bg-red-3"
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
                    <FormattedMessage id="management.delivery.btn.create-delivery" />
                </Button>
            </Flex>

            <Table<Delivery>
                rowKey="id"
                columns={columns}
                dataSource={deliveryList}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                className="flex-1"
                showSorterTooltip={false}
            />

            <Modal
                open={open}
                title={<FormattedMessage id={`management.delivery.modal.title.${mode}-delivery`} />}
                onCancel={handleClose}
                onOk={handleSubmit}
                okText={<FormattedMessage id={`management.delivery.modal.btn.${mode}`} />}
                okButtonProps={{
                    className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary',
                    loading: isCreating || isUpdating || isDeleting,
                }}
                cancelText={<FormattedMessage id="management.delivery.modal.btn.cancel" />}
            >
                {mode === 'delete' ? (
                    <Flex vertical justify="center" align="center"
                        className="p-24 border-red-4 border-2 rounded-12"
                    >
                        <FormattedMessage id="management.delivery.modal.confirm-delete" />
                        <Typography.Text strong className="text-red-6 mx-4">
                            {selectedDelivery?.name}
                        </Typography.Text>
                    </Flex>
                ) : (
                    <Form form={form} layout="vertical" preserve={false}>
                        {/* NAME */}
                        <Form.Item
                            label={<FormattedMessage id="management.delivery.modal.label.delivery-name" />}
                            name="name"
                            normalize={normalizeSpace}
                            rules={[
                                { required: true, message: <FormattedMessage id="message.delivery.name-is-required" /> },
                                { whitespace: true, message: <FormattedMessage id="message.delivery.name-not-empty" /> },
                                { max: 64, message: <FormattedMessage id="message.delivery.name-max-length-is-64" /> },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.delivery.modal.placeholder.delivery-name',
                                })}
                            />
                        </Form.Item>

                        {/* EMAIL */}
                        <Form.Item
                            label={<FormattedMessage id="management.delivery.modal.label.delivery-email" />}
                            name="email"
                            rules={[
                                { type: 'email', message: <FormattedMessage id="message.delivery.email-invalid" /> },
                                { max: 128, message: <FormattedMessage id="message.delivery.email-max-length-is-128" /> },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.delivery.modal.placeholder.delivery-email',
                                })}
                            />
                        </Form.Item>

                        {/* PHONE */}
                        <Form.Item
                            label={<FormattedMessage id="management.delivery.modal.label.delivery-phone" />}
                            name="phone"
                            rules={[
                                { max: 20, message: <FormattedMessage id="message.delivery.phone-max-length-is-20" /> },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.delivery.modal.placeholder.delivery-phone',
                                })}
                            />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </Flex>
    )
}

