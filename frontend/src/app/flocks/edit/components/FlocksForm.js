import React, { useEffect, useState } from "react";
import { useParams  } from 'next/navigation';
import { AiOutlineLeft } from 'react-icons/ai';
import { Alert, Button, Card, Form, Input, Space, Row, Col, Select } from 'antd';

const FlocksForm = ({onSaved}) => {
    const [dataIsLoaded, setDataIsLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [toast, setToast] = useState(false);
    const [action, setAction] = useState('save');
    const [employeeData, setEmplyeeData] = useState({
        id: '',
        name: '',
        cd_especies: '',
        cd_food: '',
        cd_product: '',
        cd_livestock: '',
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
                                {action === 'save' ? 'Adicionar' : 'Editar'} Rebanho
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
                            <Col span={6}>
                                <Form.Item
                                    label="Espécie:"
                                    name="cd_especies"
                                    rules={[{ required: true, message: 'Insira a espécie ' }]}
                                    >
                                    <Select value={employeeData?.cd_especies} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Tipo de Criação:"
                                    name="cd_livestock"
                                    rules={[{ required: true, message: 'Insira o tipo de criação ' }]}
                                    >
                                    <Select value={employeeData?.cd_livestock} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Tipo de Manejo Alimentar:"
                                    name="cd_food"
                                    rules={[{ required: true, message: 'Insira o tipo de manejo alimentar ' }]}
                                    >
                                    <Select value={employeeData?.cd_food} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Produção:"
                                    name="cd_product"
                                    rules={[{ required: true, message: 'Insira a produção ' }]}
                                    >
                                    <Select value={employeeData?.cd_product} />
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
export default FlocksForm