import { Flex, Form } from 'antd'
import { useState } from 'react'

import CustomerHeader from './CustomerHeader'
import CustomerModal from './CustomerModal'
import CustomerTable from './CustomerTable'


const CustomerManagement = () => {


    const [mode, setMode] = useState<ModalActionMode>(null)

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

    const [form] = Form.useForm()

    const handleChangeMode = (mode: ModalActionMode, customer?: Customer) => {
        setMode(mode)

        switch (mode) {


            case 'edit':
                if (!customer) return

                form.setFieldsValue({
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    debt: customer.debt,
                })

                setSelectedCustomer(customer)
                break

            case 'delete':
                if (!customer) return

                setSelectedCustomer(customer)
                break

            case 'create':
            case null:
                form.resetFields()
                setSelectedCustomer(null)
                break
        }
    }

    return (
        <Flex vertical gap={12}>
            <CustomerHeader handleChangeMode={handleChangeMode} />

            <CustomerTable handleChangeMode={handleChangeMode} />

            <CustomerModal
                open={open}
                mode={mode}
                selectedCustomer={selectedCustomer}
                handleClose={handleClose}
            />
        </Flex>
    )
}

export default CustomerManagement