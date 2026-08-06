import { Link, useNavigate } from '@tanstack/react-router'
import { App, Button, Card, Form, Input } from 'antd'
import { HttpStatusCode } from 'axios'
import { FormattedMessage } from 'react-intl'
import { useSignup } from '@/hooks'
import "../Login/Login.scss"

const Register = () => {
    const [registerForm] = Form.useForm()
    const signupMutation = useSignup()
    const navigate = useNavigate()
    const { notification } = App.useApp()

    const handleRegister = (values: any) => {
        signupMutation.mutate(values, {
            onSuccess: (response) => {
                if (response.status === HttpStatusCode.Created) {
                    notification.success({
                        message: <FormattedMessage id="register.message.success" />,
                    })
                    navigate({ to: '/auth/login' })
                } else {
                    notification.error({
                        message: <FormattedMessage id={response.message} />,
                    })
                }
            },
            onError: (error: any) => {
                const errorMessage = error?.response?.data?.message || 'register.message.failed'
                notification.error({
                    message: <FormattedMessage id={errorMessage} />,
                })
            },
        })
    }

    return (
        <Card title={<FormattedMessage id="register.form.title" />} className="login-card min-w-360">
            <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
                <Form.Item
                    label={<FormattedMessage id="register.form.name" />}
                    name="name"
                    rules={[
                        { required: true, message: <FormattedMessage id="message.account.name.is-required" /> },
                        { type: 'string', message: <FormattedMessage id="message.account.name.must-is-string" /> },
                        { min: 2, message: <FormattedMessage id="message.account.name.min-length-is-2" /> },
                        { max: 64, message: <FormattedMessage id="message.account.name.max-length-is-64" /> },
                    ]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item
                    label={<FormattedMessage id="register.form.username" />}
                    name="username"
                    rules={[
                        { required: true, message: <FormattedMessage id="message.account.username.is-required" /> },
                        { type: 'string', message: <FormattedMessage id="message.account.username.must-is-string" /> },
                        { min: 2, message: <FormattedMessage id="message.account.username.min-length-is-2" /> },
                        { max: 32, message: <FormattedMessage id="message.account.username.max-length-is-32" /> },
                    ]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item
                    label={<FormattedMessage id="register.form.email" />}
                    name="email"
                    rules={[
                        { type: 'email', message: <FormattedMessage id="message.account.email.wrong-format" /> },
                    ]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item
                    label={<FormattedMessage id="register.form.password" />}
                    name="password"
                    rules={[
                        { required: true, message: <FormattedMessage id="message.account.password.is-required" /> },
                        { min: 6, message: <FormattedMessage id="message.account.password.min-length-is-6" /> },
                    ]}
                >
                    <Input.Password size="large" />
                </Form.Item>

                <Form.Item
                    label={<FormattedMessage id="register.form.phone" />}
                    name="phone"
                    rules={[
                        { pattern: /^[0-9]{9,11}$/, message: <FormattedMessage id="message.account.phone.invalid" /> },
                    ]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item
                    label={<FormattedMessage id="register.form.address" />}
                    name="address"
                    rules={[
                        { max: 64, message: <FormattedMessage id="message.account.address.max-length-is-64" /> },
                    ]}
                >
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Button loading={signupMutation.isPending} className="mt-16" size="large" type="primary" htmlType="submit" block>
                    <FormattedMessage id="register.form.btn.register" />
                </Button>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/auth/login">
                    <FormattedMessage id="register.form.have-account" />
                </Link>
            </div>
        </Card>
    )
}

export default Register