"use client";
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Breadcrumb, Space } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createMedicine, updateMedicine, getMedicine } from '@/services/api';

const { TextArea } = Input;

const MedicinesForm = ({ id }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadMedicineData();
    }
  }, [id]);

  const loadMedicineData = async () => {
    try {
      setLoadingData(true);
      const data = await getMedicine(id);
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Erro ao carregar dados do medicamento');
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (isEditing) {
        await updateMedicine(id, values);
        message.success('Medicamento atualizado com sucesso!');
      } else {
        await createMedicine(values);
        message.success('Medicamento cadastrado com sucesso!');
      }

      router.push('/medicines');
    } catch (error) {
      message.error(error.message || 'Erro ao salvar medicamento');
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
            { title: <a href="/medicines">Medicamentos</a> },
            { title: <strong>{isEditing ? 'Editar' : 'Novo'} Medicamento</strong> },
          ]}
        />
        <Card 
          title={
            <Space>
              <MedicineBoxOutlined />
              {isEditing ? "Editar Medicamento" : "Novo Medicamento"}
            </Space>
          }
          loading={loadingData}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Nome do Medicamento"
                  name="name"
                  rules={[
                    { required: true, message: 'Por favor, insira o nome do medicamento!' },
                    { min: 2, message: 'O nome deve ter no mínimo 2 caracteres' }
                  ]}
                  tooltip="Nome comercial ou princípio ativo do medicamento"
                >
                  <Input 
                    placeholder="Ex: Ivermectina, Albendazol, Oxitetraciclina..." 
                    size="large" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Descrição (Opcional)"
                  name="description"
                  tooltip="Informações sobre indicação, dosagem, período de carência, etc."
                >
                  <TextArea
                    placeholder="Descreva as características do medicamento, indicações de uso, dosagem recomendada, período de carência, contra-indicações, etc..."
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
                  onClick={() => router.push('/medicines')}
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

export default MedicinesForm;

