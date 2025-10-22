'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Checkbox, Row, Col, message, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // Prepara dados do usuário
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        cpf: values.cpf,
        phone: values.phone,
        is_admin: false,
        is_producer: values.user_type === 'producer',
        is_coop_manager: values.user_type === 'coop_manager',
        is_technical: values.user_type === 'technical',
        is_gov: values.user_type === 'gov',
        council_number: values.council_number || null,
      };

      const result = await register(userData);
      
      if (result.success) {
        // Redireciona para a página inicial
        router.push('/');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '650px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ marginBottom: '8px', color: '#667eea' }}>
            Criar Conta
          </Title>
          <Text type="secondary">
            Preencha os dados abaixo para se cadastrar
          </Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label="Nome Completo"
                name="name"
                rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Seu nome completo"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Por favor, insira seu email!' },
                  { type: 'email', message: 'Email inválido!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="seu@email.com"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Telefone"
                name="phone"
                rules={[{ required: true, message: 'Por favor, insira seu telefone!' }]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="(11) 99999-9999"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="CPF"
                name="cpf"
                rules={[
                  { required: true, message: 'Por favor, insira seu CPF!' },
                  { 
                    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                    message: 'CPF inválido! Use o formato: 123.456.789-00'
                  }
                ]}
              >
                <Input 
                  prefix={<IdcardOutlined />} 
                  placeholder="123.456.789-00"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Tipo de Usuário"
                name="user_type"
                rules={[{ required: true, message: 'Por favor, selecione o tipo de usuário!' }]}
              >
                <Select placeholder="Selecione o tipo" size="large">
                  <Option value="producer">Produtor</Option>
                  <Option value="technical">Técnico</Option>
                  <Option value="coop_manager">Gerente de Cooperativa</Option>
                  <Option value="gov">Governo</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => 
                  prevValues.user_type !== currentValues.user_type
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue('user_type') === 'technical' ? (
                    <Form.Item
                      label="Número do Conselho"
                      name="council_number"
                      rules={[{ required: true, message: 'Por favor, insira o número do conselho!' }]}
                    >
                      <Input 
                        placeholder="Ex: CRMV-SP 12345"
                        size="large"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Senha"
                name="password"
                rules={[
                  { required: true, message: 'Por favor, insira sua senha!' },
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

            <Col xs={24} md={12}>
              <Form.Item
                label="Confirmar Senha"
                name="confirm_password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Por favor, confirme sua senha!' },
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
                  placeholder="Confirme sua senha"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="terms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('Você deve aceitar os termos!')),
              },
            ]}
          >
            <Checkbox>
              Eu concordo com os{' '}
              <Link href="/terms" style={{ color: '#667eea' }}>
                Termos de Uso
              </Link>
              {' '}e{' '}
              <Link href="/privacy" style={{ color: '#667eea' }}>
                Política de Privacidade
              </Link>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: '45px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Cadastrar
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text type="secondary">
              Já tem uma conta?{' '}
              <Link href="/login" style={{ color: '#667eea', fontWeight: '500' }}>
                Faça login
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}

