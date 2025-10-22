"use client";
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Select, InputNumber, Breadcrumb, Space } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createProperty, updateProperty, getProperty } from '@/services/api';

const { Option } = Select;

// Lista de estados brasileiros
const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const FarmsForm = ({ id }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const router = useRouter();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      loadFarmData();
    }
  }, [id]);

  const loadFarmData = async () => {
    try {
      setLoadingData(true);
      const data = await getProperty(id);
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Erro ao carregar dados da fazenda');
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatCNPJ = (value) => {
    if (!value) return '';
    
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara 00.000.000/0000-00
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const formatPhone = (value) => {
    if (!value) return '';
    
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (00) 00000-0000 ou (00) 0000-0000
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const generateFarmId = () => {
    return `farm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const formatCEP = (value) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (isEditing) {
        // Atualizar fazenda existente
        await updateProperty(id, values);
        message.success('Fazenda atualizada com sucesso!');
      } else {
        // Criar nova fazenda
        const farmData = {
          ...values,
          id: generateFarmId(),
        };
        await createProperty(farmData);
        message.success('Fazenda cadastrada com sucesso!');
      }

      router.push('/fazendas');
    } catch (error) {
      message.error(error.message || 'Erro ao salvar fazenda');
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
            {
              title: 'Cadastros',
            },
            {
              title: <a href="/fazendas">Fazendas</a>,
            },
            {
              title: <strong>{isEditing ? 'Editar' : 'Nova Fazenda'}</strong>,
            },
          ]}
        />

        <Card
          title={
            <Row justify="space-between" align="middle">
              <h2>{isEditing ? 'Editar Fazenda' : 'Cadastrar Nova Fazenda'}</h2>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/fazendas')}
              >
                Voltar
              </Button>
            </Row>
          }
          loading={loadingData}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark="optional"
          >
            <Row gutter={16}>
              {/* Nome da Fazenda */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Nome da Fazenda"
                  name="name"
                  rules={[
                    { required: true, message: 'Por favor, informe o nome da fazenda!' },
                    { min: 3, message: 'O nome deve ter no mínimo 3 caracteres!' }
                  ]}
                >
                  <Input
                    placeholder="Ex: Fazenda São João"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* Telefone */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Telefone"
                  name="phone"
                >
                  <Input
                    placeholder="(00) 00000-0000"
                    size="large"
                    maxLength={15}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      form.setFieldValue('phone', formatted);
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Município */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Município"
                  name="city"
                  rules={[
                    { required: true, message: 'Por favor, informe o município!' }
                  ]}
                >
                  <Input
                    placeholder="Ex: Campinas"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* Estado */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Estado"
                  name="state"
                  rules={[
                    { required: true, message: 'Por favor, selecione o estado!' }
                  ]}
                >
                  <Select
                    placeholder="Selecione o estado"
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {ESTADOS.map(estado => (
                      <Option key={estado} value={estado} label={estado}>
                        {estado}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* CNPJ */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="CNPJ (Opcional)"
                  name="cpf_cnpj"
                  rules={[
                    {
                      pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                      message: 'CNPJ inválido! Use o formato: 00.000.000/0000-00'
                    }
                  ]}
                >
                  <Input
                    placeholder="00.000.000/0000-00"
                    size="large"
                    maxLength={18}
                    onChange={(e) => {
                      const formatted = formatCNPJ(e.target.value);
                      form.setFieldValue('cpf_cnpj', formatted);
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Inscrição Estadual */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Inscrição Estadual (Opcional)"
                  name="state_registration"
                >
                  <Input
                    placeholder="Ex: 123.456.789.000"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* Endereço */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Endereço (Opcional)"
                  name="address"
                >
                  <Input
                    placeholder="Ex: Rodovia BR-101, Km 25"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* CEP */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="CEP (Opcional)"
                  name="cep"
                  rules={[
                    {
                      pattern: /^\d{5}-\d{3}$/,
                      message: 'CEP inválido! Use o formato: 00000-000'
                    }
                  ]}
                >
                  <Input
                    placeholder="00000-000"
                    size="large"
                    maxLength={9}
                    onChange={(e) => {
                      const formatted = formatCEP(e.target.value);
                      form.setFieldValue('cep', formatted);
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Área */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Dimensão/Área (Opcional)"
                  name="area"
                  tooltip="Informe a área em hectares"
                >
                  <InputNumber
                    placeholder="Ex: 150.5"
                    size="large"
                    style={{ width: '100%' }}
                    min={0}
                    step={0.1}
                    precision={2}
                    addonAfter="hectares"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row justify="end" style={{ marginTop: '24px' }}>
              <Space>
                <Button
                  size="large"
                  onClick={() => router.push('/fazendas')}
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={loading}
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

export default FarmsForm;

