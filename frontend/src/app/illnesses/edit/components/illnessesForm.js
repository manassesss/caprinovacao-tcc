import React, { useEffect, useState } from "react";
import { useParams  } from 'next/navigation';
import { AiOutlineLeft } from 'react-icons/ai';
import { Alert, Button, Card, Form, Input, Space, Row, Col, Select } from 'antd';

const { TextArea } = Input;

const IllnessesForm = ({onSaved}) => {
    const [dataIsLoaded, setDataIsLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [toast, setToast] = useState(false);
    const [action, setAction] = useState('save');
    const [employeeData, setEmplyeeData] = useState({
        id: '',
        name: '',
        prophylaxis: '',
        symptoms: '',
        treatment: '',
        
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
                                {action === 'save' ? 'Adicionar' : 'Editar'} Doença
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
                            <Col span={24}>
                                <Form.Item
                                    label="Causa:"
                                    name="cause"
                                    >
                                    <TextArea value={employeeData?.cause} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label="Profilaxia:"
                                    name="prophylaxis"
                                    >
                                    <TextArea value={employeeData?.prophylaxis} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label="Sintomas:"
                                    name="symptoms"
                                    >
                                    <TextArea value={employeeData?.symptoms} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label="Tratamento:"
                                    name="treatment"
                                    >
                                    <TextArea value={employeeData?.treatment} />
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
export default IllnessesForm