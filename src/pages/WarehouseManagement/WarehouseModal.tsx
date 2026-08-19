import { useCreateWarehouseMutation, useDeleteWarehouseMutation, useUpdateWarehouseMutation } from '@/hooks/useWarehouse'
import { normalizeSpace } from '@/utils/hepler'
import { Flex, Form, Input, Modal, Switch, Typography } from 'antd'
import type { FormInstance } from 'antd'
import FormattedMessage from '@/components/FormattedMessage'

interface Props {
    mode: ModalActionMode
    handleChangeMode: (mode: ModalActionMode) => void
    selectedWarehouse: Warehouse | null
    form: FormInstance
}

const WarehouseModal = ({ mode, handleChangeMode, selectedWarehouse, form }: Props) => {
    const { mutateAsync: createWarehouse, isPending: isCreating } = useCreateWarehouseMutation()
    const { mutateAsync: updateWarehouse, isPending: isUpdating } = useUpdateWarehouseMutation()
    const { mutateAsync: deleteWarehouse, isPending: isDeleting } = useDeleteWarehouseMutation()

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

            handleChangeMode(null)
        } catch (error) {
            console.error('Action failed:', error)
        }
    }

    return (
        <Modal
            open={mode !== null}
            title={<FormattedMessage id={`management.warehouse.modal.title.${mode}-warehouse`} />}
            onCancel={() => handleChangeMode(null)}
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
                    <Typography.Text strong className="text-red-6 mx-4">
                        {selectedWarehouse?.name}
                    </Typography.Text>
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
                        <Input placeholder="" />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="management.warehouse.modal.label.warehouse-address" />}
                        name="address"
                        rules={[
                            { max: 255, message: <FormattedMessage id="message.warehouse.address-max-length-is-255" /> },
                        ]}
                    >
                        <Input placeholder="" />
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
    )
}

export default WarehouseModal
