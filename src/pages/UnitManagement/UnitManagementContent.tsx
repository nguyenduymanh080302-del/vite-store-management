import { Button, Flex, Form, Input, Modal, Typography } from 'antd'
import Table, { ColumnType } from 'antd/es/table'
import { IconPlus, IconTrash } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import dayjs from 'dayjs'
import {
    useUnitListQuery,
    useCreateUnitMutation,
    useUpdateUnitMutation,
    useDeleteUnitMutation,
} from '@/hooks/useUnit'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from '@/stores/app.store'
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant'
import { normalizeSpace } from '@/utils/hepler'

export const UnitManagementContent = () => {
    const { data } = useUnitListQuery()
    const { mutateAsync: createUnit, isPending: isCreating } = useCreateUnitMutation()
    const { mutateAsync: updateUnit, isPending: isUpdating } = useUpdateUnitMutation()
    const { mutateAsync: deleteUnit, isPending: isDeleting } = useDeleteUnitMutation()

    const locale = useAppStore(state => state.locale)
    const intl = useIntl()

    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<ModalActionMode>('create')
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

    const [form] = Form.useForm()

    const handleChangeMode = (mode: ModalActionMode, unit?: Unit) => {
        setMode(mode)

        switch (mode) {
            case 'create':
                form.resetFields()
                break
            case 'edit':
                if (unit) {
                    form.setFieldsValue({
                        name: unit.name,
                    })
                    setSelectedUnit(unit)
                }
                break
            case 'delete':
                if (unit) setSelectedUnit(unit)
                break
        }

        setOpen(true)
    }

    const handleClose = () => {
        form.resetFields()
        setSelectedUnit(null)
        setMode('create')
        setOpen(false)
    }

    const handleSubmit = async () => {
        try {
            if (!selectedUnit && mode !== 'create') return

            const values = mode === 'delete' ? null : await form.validateFields()

            switch (mode) {
                case 'create':
                    await createUnit(values)
                    break
                case 'edit':
                    await updateUnit({
                        id: selectedUnit!.id,
                        data: values,
                    })
                    break
                case 'delete':
                    await deleteUnit(selectedUnit!.id)
                    break
            }

            handleClose()
        } catch (error) {
            console.error('Action failed:', error)
        }
    }

    const unitList = data?.data || []

    const columns: ColumnType<Unit>[] = [
        {
            title: <FormattedMessage id="table.column.id" />,
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: <FormattedMessage id="table.column.unit" />,
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
                    <FormattedMessage id="management.unit.btn.create-unit" />
                </Button>
            </Flex>

            <Table<Unit>
                rowKey="id"
                columns={columns}
                dataSource={unitList}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                className="flex-1"
                showSorterTooltip={false}
            />

            <Modal
                open={open}
                title={<FormattedMessage id={`management.unit.modal.title.${mode}-unit`} />}
                onCancel={handleClose}
                onOk={handleSubmit}
                okText={<FormattedMessage id={`management.unit.modal.btn.${mode}`} />}
                okButtonProps={{ className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary', loading: isCreating || isUpdating || isDeleting }}
                cancelText={<FormattedMessage id="management.unit.modal.btn.cancel" />}
            >
                {mode === 'delete' ? (
                    <Flex
                        vertical
                        justify="center"
                        align="center"
                        className="p-24 border-red-4 border-2 rounded-12"
                    >
                        <FormattedMessage id="management.unit.modal.confirm-delete" />
                        <Typography.Text strong className="text-red-6 mx-4">
                            {selectedUnit?.name}
                        </Typography.Text>
                    </Flex>
                ) : (
                    <Form form={form} layout="vertical" preserve={false}>
                        <Form.Item
                            label={<FormattedMessage id="management.unit.modal.label.unit-name" />}
                            name="name"
                            normalize={normalizeSpace}
                            rules={[
                                {
                                    required: true,
                                    message: (
                                        <FormattedMessage id="message.unit.name-is-required" />
                                    ),
                                },
                                {
                                    max: 32,
                                    message: (
                                        <FormattedMessage id="message.unit.name-max-length-is-32" />
                                    ),
                                },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: 'management.unit.modal.placeholder.unit-name',
                                })}
                            />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </Flex>
    )
}

