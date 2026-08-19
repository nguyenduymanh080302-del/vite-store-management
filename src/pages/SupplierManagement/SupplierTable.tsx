import { IconTrash } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import { useSupplierListQuery } from '@/hooks/useSupplier'
import { useAppStore } from '@/stores/app.store'
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant'
import { Button, Table } from 'antd'
import type { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'

interface Props {
    handleChangeMode: (mode: ModalActionMode, supplier?: Supplier) => void
}

const SupplierTable = ({ handleChangeMode }: Props) => {
    const locale = useAppStore((state) => state.locale)
    const { data } = useSupplierListQuery()
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
                <Button type="link" className="px-0" onClick={() => handleChangeMode('edit', record)}>
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
            render: (value) =>
                value
                    ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale])
                    : '--/--/----',
            sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
        },
        {
            title: <FormattedMessage id="table.column.updated-at" />,
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (value) =>
                value
                    ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale])
                    : '--/--/----',
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
        <Table<Supplier>
            rowKey="id"
            columns={columns}
            dataSource={supplierList}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            className="flex-1"
            showSorterTooltip={false}
        />
    )
}

export default SupplierTable
