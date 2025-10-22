"use client";
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Select, Breadcrumb, Space, Divider } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createHerd, updateHerd, getHerd, getProperties } from '@/services/api';

const { Option } = Select;
const { TextArea } = Input;

const HerdsForm = ({ id }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadProperties();
    if (isEditing) {
      loadHerdData();
    }
  }, [id]);

  const loadProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      message.error('Erro ao carregar fazendas');
      console.error(error);
    }
  };

  const loadHerdData = async () => {
    try {
      setLoadingData(true);
      const data = await getHerd(id);
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Erro ao carregar dados do rebanho');
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (isEditing) {
        await updateHerd(id, values);
        message.success('Rebanho atualizado com sucesso!');
      } else {
        await createHerd(values);
        message.success('Rebanho cadastrado com sucesso!');
      }

      router.push('/herds');
    } catch (error) {
      message.error(error.message || 'Erro ao salvar rebanho');
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
            { title: <a href="/herds">Rebanhos</a> },
            { title: <strong>{isEditing ? 'Editar' : 'Novo'} Rebanho</strong> },
          ]}
        />
        <Card title={isEditing ? "Editar Rebanho" : "Novo Rebanho"} loading={loadingData}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Divider orientation="left">Dados da Fazenda</Divider>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Fazenda"
                  name="property_id"
                  rules={[{ required: true, message: 'Por favor, selecione a fazenda!' }]}
                >
                  <Select
                    showSearch
                    placeholder="Selecione uma fazenda"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    size="large"
                    prefix={<HomeOutlined />}
                  >
                    {properties.map(prop => (
                      <Option key={prop.id} value={prop.id}>{prop.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Dados do Rebanho</Divider>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Nome do Rebanho"
                  name="name"
                  rules={[{ required: true, message: 'Por favor, insira o nome do rebanho!' }]}
                >
                  <Input placeholder="Ex: Rebanho Principal" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Espécie"
                  name="species"
                  rules={[{ required: true, message: 'Por favor, selecione a espécie!' }]}
                >
                  <Select
                    placeholder="Selecione a espécie"
                    size="large"
                  >
                    <Option value="caprino">Caprino</Option>
                    <Option value="ovino">Ovino</Option>
                    <Option value="ambos">Ambos</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tipo de Manejo Alimentar"
                  name="feeding_management"
                  rules={[{ required: true, message: 'Por favor, selecione o tipo de manejo!' }]}
                  tooltip="Forma como o rebanho é alimentado"
                >
                  <Select
                    placeholder="Selecione o tipo de manejo"
                    size="large"
                  >
                    <Option value="extensivo">Extensivo</Option>
                    <Option value="semi-intensivo">Semi-intensivo</Option>
                    <Option value="intensivo">Intensivo</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tipo de Produção"
                  name="production_type"
                  rules={[{ required: true, message: 'Por favor, selecione o tipo de produção!' }]}
                  tooltip="Finalidade principal do rebanho"
                >
                  <Select
                    placeholder="Selecione o tipo de produção"
                    size="large"
                  >
                    <Option value="carne">Carne</Option>
                    <Option value="leite">Leite</Option>
                    <Option value="misto">Misto (Carne e Leite)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  label="Descrição (Opcional)"
                  name="description"
                  tooltip="Informações adicionais sobre o rebanho"
                >
                  <TextArea
                    placeholder="Ex: Rebanho voltado para produção de leite de alta qualidade..."
                    rows={4}
                    size="large"
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row justify="end" style={{ marginTop: '24px' }}>
              <Space>
                <Button
                  size="large"
                  onClick={() => router.push('/herds')}
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
                  Salvar
                </Button>
              </Space>
            </Row>
          </Form>
        </Card>
      </Space>
    </main>
  );
};

export default HerdsForm;

