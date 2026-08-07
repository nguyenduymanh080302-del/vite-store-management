import { Button, Flex, Form, Input, Modal, Typography } from 'antd';
import Table, { ColumnType } from 'antd/es/table';
import { IconPlus, IconTrash } from '@/assets/icons';
import FormattedMessage from '@/components/FormattedMessage';
import dayjs from 'dayjs';
import { useCategoryListQuery, useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation } from '@/hooks/useCategory';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useAppStore } from '@/stores/app.store';
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant';
import { generatePathFromName, normalizeSlug, normalizeSpace } from '@/utils/hepler';

export const CategoryManagementContent = () => {

    const { data } = useCategoryListQuery();
    const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategoryMutation();
    const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategoryMutation();
    const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategoryMutation();
    const locale = useAppStore(state => state.locale)
    const intl = useIntl()
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<ModalActionMode>("create");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const [form] = Form.useForm()

    const handleChangeMode = (mode: ModalActionMode, category?: Category) => {
        setMode(mode);
        switch (mode) {
            case "create":
                form.resetFields();
                break;
            case "edit":
                if (category) {
                    form.setFieldsValue({
                        name: category.name,
                        slug: category.slug,
                    });
                    setSelectedCategory(category);
                }
                break;
            case "delete":
                if (category) {
                    setSelectedCategory(category);
                }
                break;
        }
        setOpen(true);
    }

    const handleClose = () => {
        form.resetFields();
        setSelectedCategory(null);
        setMode("create");
        setOpen(false);
    };


    const handleSubmit = async () => {
        try {
            if (!selectedCategory && mode !== "create") return;
            const values = mode === "delete" ? null : await form.validateFields();
            switch (mode) {
                case "create":
                    await createCategory(values);
                    break;
                case "edit":
                    await updateCategory({
                        id: selectedCategory!.id,
                        data: values,
                    });
                    break;
                case "delete":
                    await deleteCategory(selectedCategory!.id);
                    break;
            }
            handleClose();
        } catch (error) {
            console.log("Action failed:", error);
        }
    };

    const handleGenerateSlug = () => {
        const name = form.getFieldValue('name');
        if (!name) return;
        form.setFieldValue('slug', generatePathFromName(name));
    };

    const categoryList = data?.data || [];

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
        <Flex vertical gap={12}>
            <Flex justify='space-between'>
                <Typography.Title level={5} className="m-0">
                </Typography.Title>
                <Button type="primary" size="middle"
                    className="flex flex-row items-center gap-8"
                    onClick={() => handleChangeMode("create")}
                >
                    <IconPlus width={16} color="var(--color-neutral-0)" />
                    <FormattedMessage id="management.category.btn.create-category" />
                </Button>

            </Flex>
            <Table<Category>
                rowKey="id"
                columns={columns}
                dataSource={categoryList}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                className="flex-1"
                showSorterTooltip={false}
            />
            <Modal
                open={open}
                title={<FormattedMessage id={`management.category.modal.title.${mode}-category`} />}
                onCancel={handleClose}
                onOk={handleSubmit}
                okText={<FormattedMessage id={`management.category.modal.btn.${mode}`} />}
                okButtonProps={{ className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary', loading: isCreating || isUpdating || isDeleting }}
                cancelText={<FormattedMessage id="management.category.modal.btn.cancel" />}
            >
                {mode === "delete" ? (
                    <Flex orientation="vertical" justify="center" align="center" className='p-24 border-red-4 border-2 rounded-12'>
                        <FormattedMessage id="management.category.modal.confirm-delete" />
                        <Typography.Text strong className="text-red-6 mx-4">{selectedCategory?.name}</Typography.Text>
                    </Flex>
                ) : (
                    <Form form={form} layout="vertical" preserve={false}>
                        <Form.Item
                            label={<FormattedMessage id="management.category.modal.label.category-name" />}
                            name="name" normalize={normalizeSpace}
                            rules={[
                                { required: true, message: <FormattedMessage id="message.category.name-is-required" /> },
                                { max: 32, message: <FormattedMessage id="message.category.name-max-length-is-32" /> }
                            ]}
                        >
                            <Input placeholder={intl.formatMessage({ id: "management.category.modal.placeholder.category-name" })} />
                        </Form.Item>
                        <Form.Item
                            label={<FormattedMessage id="management.category.modal.label.category-slug" />}
                            required
                        >
                            <Flex gap={8}>
                                <Form.Item name="slug" noStyle normalize={normalizeSlug}
                                    rules={[
                                        { required: true, message: <FormattedMessage id="message.category.slug-is-required" /> },
                                        { max: 32, message: <FormattedMessage id="message.category.slug-max-length-is-32" /> }
                                    ]}
                                >
                                    <Input
                                        placeholder={intl.formatMessage({
                                            id: "management.category.modal.placeholder.category-slug",
                                        })}
                                    />
                                </Form.Item>

                                <Button type="primary" htmlType="button"
                                    className="bg-blue-6"
                                    onClick={handleGenerateSlug}
                                >
                                    <FormattedMessage id="management.category.btn.generate-slug" />
                                </Button>
                            </Flex>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </Flex >
    )
}

