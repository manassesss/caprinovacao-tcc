"use client";
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Breadcrumb, Space, Divider } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createIllness, updateIllness, getIllness } from '@/services/api';

const { TextArea } = Input;

const IllnessesForm = ({ id }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadIllnessData();
    }
  }, [id]);

  const loadIllnessData = async () => {
    try {
      setLoadingData(true);
      const data = await getIllness(id);
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Erro ao carregar dados da doença');
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (isEditing) {
        await updateIllness(id, values);
        message.success('Doença atualizada com sucesso!');
      } else {
        await createIllness(values);
        message.success('Doença cadastrada com sucesso!');
      }

      router.push('/illnesses');
    } catch (error) {
      message.error(error.message || 'Erro ao salvar doença');
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
            { title: <a href="/illnesses">Doenças</a> },
            { title: <strong>{isEditing ? 'Editar' : 'Nova'} Doença</strong> },
          ]}
        />
        <Card 
          title={
            <Space>
              <MedicineBoxOutlined />
              {isEditing ? "Editar Doença" : "Nova Doença"}
            </Space>
          }
          loading={loadingData}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Divider orientation="left">Identificação</Divider>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Nome da Doença"
                  name="name"
                  rules={[
                    { required: true, message: 'Por favor, insira o nome da doença!' },
                    { min: 2, message: 'O nome deve ter no mínimo 2 caracteres' }
                  ]}
                  tooltip="Nome científico ou popular da doença"
                >
                  <Input 
                    placeholder="Ex: Pneumonia Enzoótica, Linfadenite Caseosa..." 
                    size="large" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Causa</Divider>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Causa da Doença (Opcional)"
                  name="cause"
                  tooltip="Agente causador (vírus, bactéria, parasita, etc.) e fatores predisponentes"
                >
                  <TextArea
                    placeholder="Descreva o agente etiológico, fatores predisponentes, condições que favorecem o aparecimento da doença..."
                    rows={4}
                    size="large"
                    maxLength={1000}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Sintomas</Divider>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Sintomas (Opcional)"
                  name="symptoms"
                  tooltip="Sinais clínicos observados nos animais doentes"
                >
                  <TextArea
                    placeholder="Descreva os principais sintomas e sinais clínicos: febre, tosse, secreção nasal, diarreia, perda de peso, lesões cutâneas, etc..."
                    rows={5}
                    size="large"
                    maxLength={2000}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Profilaxia (Prevenção)</Divider>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Profilaxia (Opcional)"
                  name="prophylaxis"
                  tooltip="Medidas preventivas e de controle"
                >
                  <TextArea
                    placeholder="Descreva as medidas preventivas: vacinação, manejo sanitário, quarentena, biossegurança, nutrição adequada, controle de vetores, etc..."
                    rows={5}
                    size="large"
                    maxLength={2000}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Tratamento</Divider>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Tratamento (Opcional)"
                  name="treatment"
                  tooltip="Protocolo terapêutico e cuidados com animais doentes"
                >
                  <TextArea
                    placeholder="Descreva o tratamento: medicamentos indicados, dosagem, duração, cuidados de suporte, isolamento, alimentação especial, etc..."
                    rows={5}
                    size="large"
                    maxLength={2000}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row justify="end" style={{ marginTop: '24px' }}>
              <Space size="middle">
                <Button
                  size="large"
                  onClick={() => router.push('/illnesses')}
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

export default IllnessesForm;

