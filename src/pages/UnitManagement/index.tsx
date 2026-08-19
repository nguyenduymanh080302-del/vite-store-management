import { Flex, Form } from 'antd'
import { useState } from 'react'
import UnitHeader from './UnitHeader'
import UnitModal from './UnitModal'
import UnitTable from './UnitTable'

const UnitManagement = () => {
    const [mode, setMode] = useState<ModalActionMode>(null)
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
    const [form] = Form.useForm()

    const handleChangeMode = (mode: ModalActionMode, unit?: Unit) => {
        setMode(mode)

        switch (mode) {
            case 'create':
            case null:
                form.resetFields()
                setSelectedUnit(null)
                break
            case 'edit':
                if (!unit) return
                form.setFieldsValue({
                    name: unit.name,
                })
                setSelectedUnit(unit)
                break
            case 'delete':
                if (!unit) return
                setSelectedUnit(unit)
                break
        }
    }

    return (
        <Flex vertical gap={12}>
            <UnitHeader handleChangeMode={handleChangeMode} />
            <UnitTable handleChangeMode={handleChangeMode} />
            <UnitModal
                form={form}
                mode={mode}
                selectedUnit={selectedUnit}
                handleChangeMode={handleChangeMode}
            />
        </Flex>
    )
}

export default UnitManagement
