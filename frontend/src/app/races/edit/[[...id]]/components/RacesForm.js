"use client";
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Breadcrumb, Space } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createRace, updateRace, getRace } from '@/services/api';

const { TextArea } = Input;

const RacesForm = ({ id }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadRaceData();
    }
  }, [id]);

  const loadRaceData = async () => {
    try {
      setLoadingData(true);
      const data = await getRace(id);
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Erro ao carregar dados da raça');
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (isEditing) {
        await updateRace(id, values);
        message.success('Raça atualizada com sucesso!');
      } else {
        await createRace(values);
        message.success('Raça cadastrada com sucesso!');
      }

      router.push('/races');
    } catch (error) {
      message.error(error.message || 'Erro ao salvar raça');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Breadcrumb
          items={[
            { title: 'Cadastros' },
            { title: <a href="/races">Raças</a> },
            { title: <strong>{isEditing ? 'Editar' : 'Nova'} Raça</strong> },
          ]}
        />
        <Card 
          title={isEditing ? "Editar Raça" : "Nova Raça"} 
          loading={loadingData}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Nome da Raça"
                  name="name"
                  rules={[
                    { required: true, message: 'Por favor, insira o nome da raça!' },
                    { min: 2, message: 'O nome deve ter no mínimo 2 caracteres' }
                  ]}
                  tooltip="Nome oficial ou popular da raça"
                >
                  <Input 
                    placeholder="Ex: Anglo-Nubiana, Boer, Saanen..." 
                    size="large" 
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Origem (Opcional)"
                  name="origin"
                  tooltip="País ou região de origem da raça"
                >
                  <Input 
                    placeholder="Ex: Brasil, África do Sul, Suíça..." 
                    size="large" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Aspectos Gerais (Opcional)"
                  name="general_aspects"
                  tooltip="Descrição detalhada sobre características, aptidões e outras informações relevantes"
                >
                  <TextArea
                    placeholder="Descreva as características gerais da raça, aptidões (leite, carne, dupla aptidão), aspectos morfológicos, temperamento, adaptação climática, etc..."
                    rows={6}
                    size="large"
                    maxLength={1000}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row justify="end" style={{ marginTop: '24px' }}>
              <Space size="middle">
                <Button
                  size="large"
                  onClick={() => router.push('/races')}
                  icon={<ArrowLeftOutlined />}
                >
                  Voltar
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  {isEditing ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </Space>
            </Row>
          </Form>
        </Card>
      </Space>
    </main>
  );
};

export default RacesForm;

