"use client";
import { Form, Input, Button, Card, message, Select, DatePicker, InputNumber, Breadcrumb, Row, Col } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const AnimalMovimentationForm = ({ id }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const isEdit = !!id;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      loadMovementData();
    }
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [propertiesData, animalsData] = await Promise.all([
        api.getProperties(),
        api.getAnimals()
      ]);
      setProperties(propertiesData);
      setAnimals(animalsData);
    } catch (error) {
      message.error('Erro ao carregar dados');
      console.error(error);
    }
  };

  const loadMovementData = async () => {
    try {
      const data = await api.getAnimalMovement(id);
      setSelectedProperty(data.property_id);
      form.setFieldsValue({
        ...data,
        movement_date: dayjs(data.movement_date)
      });
    } catch (error) {
      message.error('Erro ao carregar movimentação');
      console.error(error);
    }
  };

  const handlePropertyChange = (value) => {
    setSelectedProperty(value);
    form.setFieldValue('animal_id', undefined);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formattedData = {
        ...values,
        movement_date: values.movement_date.format('YYYY-MM-DD')
      };

      if (isEdit) {
        // Movimentação é imutável, não pode editar
        message.warning('Movimentações não podem ser editadas');
      } else {
        await api.createAnimalMovement(formattedData);
        message.success('Movimentação registrada com sucesso!');
        router.push('/animal-movimentation');
      }
    } catch (error) {
      message.error('Erro ao salvar movimentação');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = selectedProperty 
    ? animals.filter(a => a.property_id === selectedProperty)
    : animals;

  return (
    <>
      <Breadcrumb
        items={[
          { title: 'Controle Animal' },
          { title: 'Movimentação Animal', href: '/animal-movimentation' },
          { title: isEdit ? 'Visualizar' : 'Nova Movimentação' },
        ]}
        style={{ marginBottom: 24 }}
      />
      <Card title={isEdit ? "Visualizar Movimentação" : "Nova Movimentação de Animal"}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={isEdit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Fazenda"
                name="property_id"
                rules={[{ required: true, message: 'Selecione a fazenda' }]}
              >
                <Select 
                  placeholder="Selecione a fazenda"
                  onChange={handlePropertyChange}
                >
                  {properties.map(prop => (
                    <Option key={prop.id} value={prop.id}>{prop.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Animal"
                name="animal_id"
                rules={[{ required: true, message: 'Selecione o animal' }]}
              >
                <Select 
                  placeholder="Selecione o animal"
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedProperty}
                >
                  {filteredAnimals.map(animal => (
                    <Option key={animal.id} value={animal.id}>
                      {animal.earring_identification} - {animal.name || 'Sem nome'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Data da Movimentação"
                name="movement_date"
                rules={[{ required: true, message: 'Informe a data' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Selecione a data"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Motivo da Saída"
                name="exit_reason"
                rules={[{ required: true, message: 'Selecione o motivo' }]}
              >
                <Select placeholder="Selecione o motivo">
                  <Option value="venda">Venda</Option>
                  <Option value="morte">Morte</Option>
                  <Option value="roubo">Roubo</Option>
                  <Option value="alimentacao">Alimentação</Option>
                  <Option value="emprestimo">Empréstimo</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Peso (kg)"
                name="weight"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.1}
                  placeholder="Ex: 45.5"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Observações"
            name="observations"
          >
            <TextArea
              rows={4}
              placeholder="Observações sobre a movimentação"
            />
          </Form.Item>

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={() => router.back()}>
                Voltar
              </Button>
            </Col>
            {!isEdit && (
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Registrar Movimentação
                </Button>
              </Col>
            )}
          </Row>
        </Form>
      </Card>
    </>
  );
};

export default AnimalMovimentationForm;
