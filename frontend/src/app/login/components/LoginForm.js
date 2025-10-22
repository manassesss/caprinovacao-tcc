'use client';

import { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        router.push('/');
      }
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo de volta!
        </h2>
        <p className="text-gray-600">
          Entre com suas credenciais para continuar
        </p>
      </div>

      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        requiredMark={false}
        className="space-y-4"
      >
        <Form.Item
          label={<span className="text-gray-700 font-medium">Email</span>}
          name="email"
          rules={[
            { required: true, message: 'Por favor, insira seu email!' },
            { type: 'email', message: 'Email inválido!' }
          ]}
        >
          <Input 
            prefix={<FaUser className="text-gray-400" />} 
            placeholder="seu@email.com"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-700 font-medium">Senha</span>}
          name="password"
          rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
        >
          <Input.Password
            prefix={<FaLock className="text-gray-400" />}
            placeholder="Sua senha"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-between items-center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Lembrar-me</Checkbox>
            </Form.Item>
            <Link href="/forgot-password" className="text-green-600 hover:text-green-700">
              Esqueceu a senha?
            </Link>
          </div>
        </Form.Item>

        <Form.Item className="mb-0">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
              className="h-12 text-base font-medium rounded-lg"
            >
            Entrar
          </Button>
        </Form.Item>

        <div className="text-center mt-6">
          <span className="text-gray-600">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
              Cadastre-se
            </Link>
          </span>
        </div>
      </Form>
    </div>
  );
}

