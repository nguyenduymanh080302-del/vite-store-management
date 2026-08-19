import { Flex, Form } from 'antd'
import { useState } from 'react'
import SupplierHeader from './SupplierHeader'
import SupplierModal from './SupplierModal'
import SupplierTable from './SupplierTable'

const SupplierManagement = () => {
    const [mode, setMode] = useState<ModalActionMode>(null)
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
    const [form] = Form.useForm()

    const handleChangeMode = (mode: ModalActionMode, supplier?: Supplier) => {
        setMode(mode)

        switch (mode) {
            case 'create':
            case null:
                form.resetFields()
                setSelectedSupplier(null)
                break
            case 'edit':
                if (!supplier) return
                form.setFieldsValue({
                    name: supplier.name,
                    email: supplier.email,
                    phone: supplier.phone,
                    address: supplier.address,
                    debt: supplier.debt,
                })
                setSelectedSupplier(supplier)
                break
            case 'delete':
                if (!supplier) return
                setSelectedSupplier(supplier)
                break
        }
    }

    return (
        <Flex vertical gap={12}>
            <SupplierHeader handleChangeMode={handleChangeMode} />
            <SupplierTable handleChangeMode={handleChangeMode} />
            <SupplierModal
                form={form}
                mode={mode}
                selectedSupplier={selectedSupplier}
                handleChangeMode={handleChangeMode}
            />
        </Flex>
    )
}

export default SupplierManagement
