import { Flex, Form } from 'antd'
import { useState } from 'react'
import WarehouseHeader from './WarehouseHeader'
import WarehouseModal from './WarehouseModal'
import WarehouseTable from './WarehouseTable'

const WarehouseManagement = () => {
    const [mode, setMode] = useState<ModalActionMode>(null)
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
    const [form] = Form.useForm()

    const handleChangeMode = (mode: ModalActionMode, warehouse?: Warehouse) => {
        setMode(mode)

        switch (mode) {
            case 'create':
            case null:
                form.resetFields()
                setSelectedWarehouse(null)
                break
            case 'edit':
                if (!warehouse) return
                form.setFieldsValue({
                    name: warehouse.name,
                    address: warehouse.address,
                    isActive: warehouse.isActive ?? true,
                })
                setSelectedWarehouse(warehouse)
                break
            case 'delete':
                if (!warehouse) return
                setSelectedWarehouse(warehouse)
                break
        }
    }

    return (
        <Flex vertical gap={12}>
            <WarehouseHeader handleChangeMode={handleChangeMode} />
            <WarehouseTable handleChangeMode={handleChangeMode} />
            <WarehouseModal
                form={form}
                mode={mode}
                selectedWarehouse={selectedWarehouse}
                handleChangeMode={handleChangeMode}
            />
        </Flex>
    )
}

export default WarehouseManagement
