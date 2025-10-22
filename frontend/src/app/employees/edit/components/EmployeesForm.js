import React, { useEffect, useState } from "react";
import { useParams  } from 'next/navigation';
import { AiOutlineLeft } from 'react-icons/ai';
import { Alert, Button, Card, Form, Input, Space, Row, Col, Select } from 'antd';

const EmployeesForm = ({onSaved}) => {
    const [dataIsLoaded, setDataIsLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [toast, setToast] = useState(false);
    const [action, setAction] = useState('save');
    const [employeeData, setEmplyeeData] = useState({
        id: '',
        name: '',
        cpf: '',
        state_id: '',
        city_id: '',
        phone: '',
        dimension: '',
        address: '',
        farm_id: ''
    });
    const [form] = Form.useForm();
    const params = useParams();
    const id = params?.id?.[0];

    const onFinish = async (data) => {
        setErrorMessage('Salvo com sucesso');
        setToast(true);
        onSaved();
    }
    useEffect(() => {
        if(id) {
            setAction('edit')
        }
    }, [id])

    return (
        <>
            <main style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                <Space direction="vertical">
                    <Card
                    title={
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <div style={{cursor: 'pointer'}}>
                                <AiOutlineLeft onClick={() => onSaved()} />
                            </div>
                            <div>
                                {action === 'save' ? 'Adicionar' : 'Editar'} Funcionário
                            </div>
                        <div></div>
                        </div>
                    }
                    >
                    <Form form={form} onFinish={onFinish} layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Nome:"
                                    name="name"
                                    rules={[{ required: true, message: 'Insira o nome ' }]}
                                    >
                                    <Input value={employeeData?.name} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="CPF:"
                                    name="cpf"
                                    rules={[{ required: true, message: 'Insira o cpf ' }]}
                                    >
                                    <Input value={employeeData?.cpf} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="E-mail:"
                                    name="email"
                                    rules={[{ required: true, message: 'Insira o e-mail ' }]}
                                    >
                                    <Input value={employeeData?.email} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Telefone:"
                                    name="phone"
                                    rules={[{ required: true, message: 'Insira o telefone ' }]}
                                    >
                                    <Input value={employeeData?.phone} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Estado:"
                                    name="state_id"
                                    rules={[{ required: true, message: 'Insira o estado' }]}
                                    >
                                    <Select value={employeeData?.state_id} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Municipio:"
                                    name="city_id"
                                    rules={[{ required: true, message: 'Insira a cidade ' }]}
                                    >
                                    <Select value={employeeData?.city_id} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Endereço:"
                                    name="address"
                                    rules={[{ required: true, message: 'Insira o endereço ' }]}
                                    >
                                    <Input value={employeeData?.address} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Usuário:"
                                    name="user"
                                    rules={[{ required: true, message: 'Insira o usuário' }]}
                                    >
                                    <Input value={employeeData?.user} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Senha:"
                                    name="password"
                                    rules={[{ required: true, message: 'Insira a senha ' }]}
                                    >
                                    <Input.Password value={employeeData?.password} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Confirmar a senha:"
                                    name="confirm_password"
                                    rules={[{ required: true, message: 'Insira o senha ' }]}
                                    >
                                    <Input.Password  value={employeeData?.confirm_password} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Salvar
                            </Button>
                        </Form.Item>
                    </Form>
                    </Card>
                </Space>
            </main>
        </>
    );
}
export default EmployeesForm