import { IconTrash } from '@/assets/icons'
import { useCategoryListQuery } from '@/hooks/useCategory'
import { useAppStore } from '@/stores/app.store'
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant'
import { Button, Table } from 'antd'
import { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'
import { FormattedMessage } from 'react-intl'

interface Props {
    handleChangeMode: (mode: ModalActionMode, category?: Category) => void
}

const CategoryTable = ({ handleChangeMode }: Props) => {

    const locale = useAppStore((state) => state.locale)
    const { data } = useCategoryListQuery();
    const categoryList = data?.data || []

    const columns: ColumnType<Category>[] = [
        {
            title: <FormattedMessage id='table.column.id' />,
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: <FormattedMessage id='table.column.category' />,
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <Button type="link" className='px-0' onClick={() => handleChangeMode("edit", record)}>
                    {record.name}
                </Button>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: <FormattedMessage id='table.column.slug' />,
            dataIndex: 'slug',
            key: 'slug',
            render: (_, record) => (
                <Button type="link" className='px-0' onClick={() => handleChangeMode("edit", record)}>
                    {record.slug}
                </Button>
            ),
        },
        {
            title: <FormattedMessage id="table.column.created-at" />,
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value) => value ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale]) : "--/--/----",
            sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
        },
        {
            title: <FormattedMessage id="table.column.updated-at" />,
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (value) => value ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale]) : "--/--/----",
            sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
        },
        {
            title: "",
            key: 'action',
            render: (_, record) => (
                <Button type="primary" className='bg-red-3'
                    onClick={() => handleChangeMode("delete", record)}
                >
                    <IconTrash height={18} width={18} />
                </Button>
            ),
        },
    ]

    return (
        <Table<Category>
            rowKey="id"
            columns={columns}
            dataSource={categoryList}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            className="flex-1"
            showSorterTooltip={false}
        />
    )
}

export default CategoryTable