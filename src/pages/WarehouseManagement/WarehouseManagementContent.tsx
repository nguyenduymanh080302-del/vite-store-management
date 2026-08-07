import { Button, Flex, Form, Input, Modal, Switch, Typography } from 'antd'
import Table, { ColumnType } from 'antd/es/table'
import { IconPlus, IconTrash } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import dayjs from 'dayjs'
import {
    useCreateWarehouseMutation,
    useDeleteWarehouseMutation,
    useUpdateWarehouseMutation,
    useWarehouseListQuery,
} from '@/hooks/useWarehouse'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from '@/stores/app.store'
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant'
import { normalizeSpace } from '@/utils/hepler'

export const WarehouseManagementContent = () => {
    const { data } = useWarehouseListQuery()
    const { mutateAsync: createWarehouse, isPending: isCreating } = useCreateWarehouseMutation()
    const { mutateAsync: updateWarehouse, isPending: isUpdating } = useUpdateWarehouseMutation()
    const { mutateAsync: deleteWarehouse, isPending: isDeleting } = useDeleteWarehouseMutation()

    const locale = useAppStore((state) => state.locale)
    const intl = useIntl()

    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<ModalActionMode>('create')
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
    const [form] = Form.useForm()

    const handleChangeMode = (mode: ModalActionMode, warehouse?: Warehouse) => {
        setMode(mode)
        switch (mode) {
            case 'create':
                form.resetFields()
                break
            case 'edit':
                if (warehouse) {
                    form.setFieldsValue({
                        name: warehouse.name,
                        address: warehouse.address,
                        isActive: warehouse.isActive ?? true,
                    })
                    setSelectedWarehouse(warehouse)
                }
                break
            case 'delete':
                if (warehouse) setSelectedWarehouse(warehouse)
                break
        }
        setOpen(true)
    }

    const handleClose = () => {
        form.resetFields()
        setSelectedWarehouse(null)
        setMode('create')
        setOpen(false)
    }

    const handleSubmit = async () => {
        try {
            if (!selectedWarehouse && mode !== 'create') return
            const values = mode === 'delete' ? null : await form.validateFields()
            switch (mode) {
                case 'create':
                    await createWarehouse(values)
                    break
                case 'edit':
                    await updateWarehouse({
                        id: selectedWarehouse!.id,
                        data: values,
                    })
                    break
                case 'delete':
                    await deleteWarehouse(selectedWarehouse!.id)
                    break
            }
            handleClose()
        } catch (error) {
            console.error('Action failed:', error)
        }
    }

    const warehouseList = data?.data || []

    const columns: ColumnType<Warehouse>[] = [
        {
            title: <FormattedMessage id="table.column.id" />,
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: <FormattedMessage id="management.warehouse.modal.label.warehouse-name" />,
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <Button type="link" className="px-0" onClick={() => handleChangeMode('edit', record)}>
                    {record.name}
                </Button>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: <FormattedMessage id="management.warehouse.modal.label.warehouse-address" />,
            dataIndex: 'address',
            key: 'address',
            render: (value) => value || '--',
        },
        {
            title: <FormattedMessage id="management.warehouse.modal.label.warehouse-active" />,
            dataIndex: 'isActive',
            key: 'isActive',
            render: (value) => <Switch checked={!!value} disabled />,
        },
        {
            title: <FormattedMessage id="table.column.created-at" />,
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (value) => value ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale]) : '--/--/----',
            sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
        },
        {
            title: <FormattedMessage id="table.column.updated-at" />,
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (value) => value ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale]) : '--/--/----',
            sorter: (a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" className="bg-red-3" onClick={() => handleChangeMode('delete', record)}>
                    <IconTrash height={18} width={18} />
                </Button>
            ),
        },
    ]

    return (
        <Flex vertical gap={12}>
            <Flex justify="space-between">
                <Typography.Title level={5} className="m-0" />
                <Button type="primary" size="middle" className="flex flex-row items-center gap-8" onClick={() => handleChangeMode('create')}>
                    <IconPlus width={16} color="var(--color-neutral-0)" />
                    <FormattedMessage id="management.warehouse.btn.create-warehouse" />
                </Button>
            </Flex>

            <Table<Warehouse>
                rowKey="id"
                columns={columns}
                dataSource={warehouseList}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                className="flex-1"
                showSorterTooltip={false}
            />

            <Modal
                open={open}
                title={<FormattedMessage id={`management.warehouse.modal.title.${mode}-warehouse`} />}
                onCancel={handleClose}
                onOk={handleSubmit}
                okText={<FormattedMessage id={`management.warehouse.modal.btn.${mode}`} />}
                okButtonProps={{
                    className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary',
                    loading: isCreating || isUpdating || isDeleting,
                }}
                cancelText={<FormattedMessage id="management.warehouse.modal.btn.cancel" />}
            >
                {mode === 'delete' ? (
                    <Flex vertical justify="center" align="center" className="p-24 border-red-4 border-2 rounded-12">
                        <FormattedMessage id="management.warehouse.modal.confirm-delete" />
                        <Typography.Text strong className="text-red-6 mx-4">{selectedWarehouse?.name}</Typography.Text>
                    </Flex>
                ) : (
                    <Form form={form} layout="vertical" preserve={false}>
                        <Form.Item
                            label={<FormattedMessage id="management.warehouse.modal.label.warehouse-name" />}
                            name="name"
                            normalize={normalizeSpace}
                            rules={[
                                { required: true, message: <FormattedMessage id="message.warehouse.name-is-required" /> },
                                { whitespace: true, message: <FormattedMessage id="message.warehouse.name-not-empty" /> },
                                { max: 64, message: <FormattedMessage id="message.warehouse.name-max-length-is-64" /> },
                            ]}
                        >
                            <Input placeholder={intl.formatMessage({ id: 'management.warehouse.modal.placeholder.warehouse-name' })} />
                        </Form.Item>
                        <Form.Item
                            label={<FormattedMessage id="management.warehouse.modal.label.warehouse-address" />}
                            name="address"
                            rules={[{ max: 255, message: <FormattedMessage id="message.warehouse.address-max-length-is-255" /> }]}
                        >
                            <Input placeholder={intl.formatMessage({ id: 'management.warehouse.modal.placeholder.warehouse-address' })} />
                        </Form.Item>
                        <Form.Item
                            label={<FormattedMessage id="management.warehouse.modal.label.warehouse-active" />}
                            name="isActive"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </Flex>
    )
}

