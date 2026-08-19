import { Flex, Modal, Typography } from 'antd'
import FormattedMessage from '@/components/FormattedMessage'
import { useDeleteOrderMutation } from '@/hooks/useOrder'
import { OrderFormModal } from './OrderFormModal'

interface Props {
    mode: ModalActionMode
    selectedOrder: Order | null
    handleChangeMode: (mode: ModalActionMode) => void
}

const SalesModal = ({ mode, selectedOrder, handleChangeMode }: Props) => {
    const { mutateAsync: deleteOrder, isPending: isDeleting } = useDeleteOrderMutation()

    const handleClose = () => {
        handleChangeMode(null)
    }

    const handleSubmitDelete = async () => {
        if (!selectedOrder) return

        try {
            await deleteOrder(selectedOrder.id)
            handleClose()
        } catch (error) {
            console.error('Delete order failed:', error)
        }
    }

    return (
        <>
            {mode !== null && mode !== 'delete' && (
                <OrderFormModal
                    open={mode !== null}
                    mode={mode}
                    order={selectedOrder}
                    onClose={handleClose}
                />
            )}

            <Modal
                open={mode === 'delete'}
                title={
                    <FormattedMessage
                        id="management.sales.modal.title.delete-order"
                        defaultMessage="Delete Order"
                    />
                }
                onCancel={handleClose}
                onOk={handleSubmitDelete}
                okText={
                    <FormattedMessage
                        id="management.sales.modal.btn.delete"
                        defaultMessage="Delete"
                    />
                }
                okButtonProps={{
                    className: 'bg-red-3',
                    loading: isDeleting,
                }}
                cancelText={
                    <FormattedMessage
                        id="management.sales.modal.btn.cancel"
                        defaultMessage="Cancel"
                    />
                }
            >
                <Flex
                    vertical
                    justify="center"
                    align="center"
                    className="p-24 border-red-4 border-2 rounded-12"
                >
                    <FormattedMessage
                        id="management.sales.modal.confirm-delete"
                        defaultMessage="Are you sure you want to delete this order?"
                    />
                    <Typography.Text strong className="mx-4">
                        {selectedOrder?.orderCode}
                    </Typography.Text>
                </Flex>
            </Modal>
        </>
    )
}

export default SalesModal
