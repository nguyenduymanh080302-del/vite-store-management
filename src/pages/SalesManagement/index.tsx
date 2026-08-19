import { Flex } from 'antd'
import { useState } from 'react'
import SalesHeader from './SalesHeader'
import SalesModal from './SalesModal'
import SalesTable from './SalesTable'

const SalesManagement = () => {
    const [filters, setFilters] = useState<GetOrdersQuery>({
        page: 1,
        limit: 10,
    })
    const [searchValue, setSearchValue] = useState('')
    const [mode, setMode] = useState<ModalActionMode>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const handleChangeMode = (nextMode: ModalActionMode, order?: Order) => {
        setMode(nextMode)
        setSelectedOrder(order || null)
    }

    const handleSearchChange = (value: string) => {
        setSearchValue(value)
        setFilters((prev) => ({
            ...prev,
            page: 1,
        }))
    }

    const handleStatusChange = (status?: OrderStatusValue) => {
        setFilters((prev) => ({
            ...prev,
            page: 1,
            status,
        }))
    }

    const handlePageChange = (page: number, pageSize: number) => {
        setFilters((prev) => ({
            ...prev,
            page,
            limit: pageSize,
        }))
    }

    return (
        <Flex vertical gap={12}>
            <SalesHeader
                searchValue={searchValue}
                status={filters.status}
                handleSearchChange={handleSearchChange}
                handleStatusChange={handleStatusChange}
                handleChangeMode={handleChangeMode}
            />
            <SalesTable
                filters={filters}
                searchValue={searchValue}
                handleChangeMode={handleChangeMode}
                handlePageChange={handlePageChange}
            />
            <SalesModal
                mode={mode}
                selectedOrder={selectedOrder}
                handleChangeMode={handleChangeMode}
            />
        </Flex>
    )
}

export default SalesManagement
