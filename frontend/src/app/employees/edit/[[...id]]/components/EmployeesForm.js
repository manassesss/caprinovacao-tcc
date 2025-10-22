"use client";
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Select, Breadcrumb, Space, Divider } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createEmployee, updateEmployee, getEmployee, getProperties } from '@/services/api';

const { Option } = Select;

// Lista de estados brasileiros
const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const EmployeesForm = ({ id }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [properties, setProperties] = useState([]);
  const router = useRouter();
  const isEditing = !!id;

  useEffect(() => {
    loadProperties();
    if (isEditing) {
      loadEmployeeData();
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

  const loadEmployeeData = async () => {
    try {
      setLoadingData(true);
      const data = await getEmployee(id);
      // Remove senha ao carregar para edição
      const { password, ...employeeData } = data;
      form.setFieldsValue(employeeData);
    } catch (error) {
      message.error('Erro ao carregar dados do funcionário');
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatCPF = (value) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatPhone = (value) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const generateEmployeeId = () => {
    return `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (isEditing) {
        // Atualizar funcionário (sem senha)
        const { password, confirm_password, login, cpf, property_id, ...updateData } = values;
        await updateEmployee(id, updateData);
        message.success('Funcionário atualizado com sucesso!');
      } else {
        // Criar novo funcionário
        const { confirm_password, ...employeeData } = values;
        const newEmployee = {
          ...employeeData,
          id: generateEmployeeId(),
        };
        await createEmployee(newEmployee);
        message.success('Funcionário cadastrado com sucesso!');
      }

      router.push('/employees');
    } catch (error) {
      message.error(error.message || 'Erro ao salvar funcionário');
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
              title: <a href="/employees">Funcionários</a>,
            },
            {
              title: <strong>{isEditing ? 'Editar' : 'Novo Funcionário'}</strong>,
            },
          ]}
        />

        <Card
          title={
            <Row justify="space-between" align="middle">
              <h2>{isEditing ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}</h2>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/employees')}
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
            {/* Seção de Fazenda */}
            <Divider orientation="left">Fazenda</Divider>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Fazenda"
                  name="property_id"
                  rules={[{ required: true, message: 'Por favor, selecione a fazenda!' }]}
                >
                  <Select
                    placeholder="Selecione a fazenda"
                    size="large"
                    disabled={isEditing}
                    showSearch
                    optionFilterProp="children"
                  >
                    {properties.map(prop => (
                      <Option key={prop.id} value={prop.id}>
                        {prop.name} - {prop.city}/{prop.state}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Seção de Dados Pessoais */}
            <Divider orientation="left">Dados Pessoais</Divider>
            <Row gutter={16}>
              {/* Nome */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Nome Completo"
                  name="name"
                  rules={[
                    { required: true, message: 'Por favor, informe o nome!' },
                    { min: 3, message: 'O nome deve ter no mínimo 3 caracteres!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nome completo do funcionário"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* CPF */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="CPF"
                  name="cpf"
                  rules={[
                    { required: true, message: 'Por favor, informe o CPF!' },
                    {
                      pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                      message: 'CPF inválido! Use o formato: 000.000.000-00'
                    }
                  ]}
                >
                  <Input
                    placeholder="000.000.000-00"
                    size="large"
                    maxLength={14}
                    disabled={isEditing}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      form.setFieldValue('cpf', formatted);
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Telefone */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Telefone"
                  name="phone"
                  rules={[{ required: true, message: 'Por favor, informe o telefone!' }]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
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

              {/* Email */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email (Opcional)"
                  name="email"
                  rules={[
                    { type: 'email', message: 'Email inválido!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="email@exemplo.com"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* Endereço */}
              <Col xs={24}>
                <Form.Item
                  label="Endereço (Opcional)"
                  name="address"
                >
                  <Input
                    placeholder="Rua, número, bairro"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* Município */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Município (Opcional)"
                  name="city"
                >
                  <Input
                    placeholder="Ex: Teresina"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* Estado */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Estado (Opcional)"
                  name="state"
                >
                  <Select
                    placeholder="Selecione o estado"
                    size="large"
                    showSearch
                    allowClear
                  >
                    {ESTADOS.map(estado => (
                      <Option key={estado} value={estado}>
                        {estado}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Seção de Dados da Conta */}
            {!isEditing && (
              <>
                <Divider orientation="left">Dados da Conta</Divider>
                <Row gutter={16}>
                  {/* Login */}
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Login"
                      name="login"
                      rules={[
                        { required: true, message: 'Por favor, informe o login!' },
                        { min: 4, message: 'O login deve ter no mínimo 4 caracteres!' }
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Login para acesso"
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  {/* Senha */}
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Senha"
                      name="password"
                      rules={[
                        { required: true, message: 'Por favor, informe a senha!' },
                        { min: 6, message: 'A senha deve ter no mínimo 6 caracteres!' }
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Mínimo 6 caracteres"
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  {/* Confirmar Senha */}
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Confirmar Senha"
                      name="confirm_password"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Por favor, confirme a senha!' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('As senhas não coincidem!'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Confirme a senha"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            <Row justify="end" style={{ marginTop: '24px' }}>
              <Space>
                <Button
                  size="large"
                  onClick={() => router.push('/employees')}
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

export default EmployeesForm;

