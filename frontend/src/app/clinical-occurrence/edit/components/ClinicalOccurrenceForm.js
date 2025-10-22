"use client";
import { Form, Input, Button, Card, message, Select, DatePicker, Breadcrumb, Row, Col } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ClinicalOccurrenceForm = ({ id }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [illnesses, setIllnesses] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const isEdit = !!id;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      loadOccurrenceData();
    }
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [propertiesData, animalsData, illnessesData] = await Promise.all([
        api.getProperties(),
        api.getAnimals(),
        api.getIllnesses()
      ]);
      setProperties(propertiesData);
      setAnimals(animalsData);
      setIllnesses(illnessesData);
    } catch (error) {
      message.error('Erro ao carregar dados');
      console.error(error);
    }
  };

  const loadOccurrenceData = async () => {
    try {
      const data = await api.getClinicalOccurrence(id);
      setSelectedProperty(data.property_id);
      form.setFieldsValue({
        ...data,
        occurrence_date: dayjs(data.occurrence_date)
      });
    } catch (error) {
      message.error('Erro ao carregar ocorrência');
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
        occurrence_date: values.occurrence_date.format('YYYY-MM-DD')
      };

      if (isEdit) {
        message.warning('Ocorrências não podem ser editadas');
      } else {
        await api.createClinicalOccurrence(formattedData);
        message.success('Ocorrência registrada com sucesso!');
        router.push('/clinical-occurrence');
      }
    } catch (error) {
      message.error('Erro ao salvar ocorrência');
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
          { title: 'Ocorrências Clínicas', href: '/clinical-occurrence' },
          { title: isEdit ? 'Visualizar' : 'Nova Ocorrência' },
        ]}
        style={{ marginBottom: 24 }}
      />
      <Card title={isEdit ? "Visualizar Ocorrência Clínica" : "Nova Ocorrência Clínica"}>
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
            <Col span={12}>
              <Form.Item
                label="Doença"
                name="illness_id"
                rules={[{ required: true, message: 'Selecione a doença' }]}
              >
                <Select 
                  placeholder="Selecione a doença"
                  showSearch
                  optionFilterProp="children"
                >
                  {illnesses.map(illness => (
                    <Option key={illness.id} value={illness.id}>{illness.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Data da Ocorrência"
                name="occurrence_date"
                rules={[{ required: true, message: 'Informe a data' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Selecione a data"
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
              placeholder="Observações sobre a ocorrência clínica (sintomas observados, tratamento aplicado, etc.)"
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
                  Registrar Ocorrência
                </Button>
              </Col>
            )}
          </Row>
        </Form>
      </Card>
    </>
  );
};

export default ClinicalOccurrenceForm;
