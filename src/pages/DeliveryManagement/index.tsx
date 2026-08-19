import { Flex, Form } from 'antd'
import { useState } from 'react'
import DeliveryHeader from './DeliveryHeader'
import DeliveryModal from './DeliveryModal'
import DeliveryTable from './DeliveryTable'

const DeliveryManagement = () => {
    const [mode, setMode] = useState<ModalActionMode>(null)
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
    const [form] = Form.useForm()

    const handleChangeMode = (mode: ModalActionMode, delivery?: Delivery) => {
        setMode(mode)

        switch (mode) {
            case 'create':
            case null:
                form.resetFields()
                setSelectedDelivery(null)
                break
            case 'edit':
                if (!delivery) return
                form.setFieldsValue({
                    name: delivery.name,
                    email: delivery.email,
                    phone: delivery.phone,
                    isActive: delivery.isActive,
                })
                setSelectedDelivery(delivery)
                break
            case 'delete':
                if (!delivery) return
                setSelectedDelivery(delivery)
                break
        }
    }

    return (
        <Flex vertical gap={12}>
            <DeliveryHeader handleChangeMode={handleChangeMode} />
            <DeliveryTable handleChangeMode={handleChangeMode} />
            <DeliveryModal
                form={form}
                mode={mode}
                selectedDelivery={selectedDelivery}
                handleChangeMode={handleChangeMode}
            />
        </Flex>
    )
}

export default DeliveryManagement
