"use client";
import { Form, Input, Button, Card, message, Select, DatePicker, InputNumber, Breadcrumb, Row, Col } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ParasiteControlForm = ({ id }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const isEdit = !!id;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      loadControlData();
    }
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [propertiesData, animalsData, medicinesData] = await Promise.all([
        api.getProperties(),
        api.getAnimals(),
        api.getMedicines()
      ]);
      setProperties(propertiesData);
      setAnimals(animalsData);
      setMedicines(medicinesData);
    } catch (error) {
      message.error('Erro ao carregar dados');
      console.error(error);
    }
  };

  const loadControlData = async () => {
    try {
      const data = await api.getParasiteControl(id);
      setSelectedProperty(data.property_id);
      form.setFieldsValue({
        ...data,
        application_date: dayjs(data.application_date)
      });
    } catch (error) {
      message.error('Erro ao carregar controle');
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
        application_date: values.application_date.format('YYYY-MM-DD'),
        // Converter para inteiros
        opg_pre: values.opg_pre ? parseInt(values.opg_pre) : null,
        opg_post: values.opg_post ? parseInt(values.opg_post) : null,
        ecc: values.ecc ? parseInt(values.ecc) : null,
        famacha: values.famacha ? parseInt(values.famacha) : null,
      };

      if (isEdit) {
        message.warning('Controles não podem ser editados');
      } else {
        await api.createParasiteControl(formattedData);
        message.success('Controle registrado com sucesso!');
        router.push('/parasite-control');
      }
    } catch (error) {
      message.error('Erro ao salvar controle');
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
          { title: 'Controle Parasitário', href: '/parasite-control' },
          { title: isEdit ? 'Visualizar' : 'Novo Controle' },
        ]}
        style={{ marginBottom: 24 }}
      />
      <Card title={isEdit ? "Visualizar Controle Parasitário" : "Novo Controle Parasitário"}>
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
                label="Medicamento (Anti-helmíntico)"
                name="medicine_id"
                rules={[{ required: true, message: 'Selecione o medicamento' }]}
              >
                <Select 
                  placeholder="Selecione o medicamento"
                  showSearch
                  optionFilterProp="children"
                >
                  {medicines.map(medicine => (
                    <Option key={medicine.id} value={medicine.id}>{medicine.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Data da Vermifugação"
                name="application_date"
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

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="OPG Pré-tratamento"
                name="opg_pre"
                help="Ovos por grama de fezes (antes do tratamento)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Ex: 500"
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="OPG Pós-tratamento"
                name="opg_post"
                help="Medido 14-21 dias após o tratamento"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Ex: 100"
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="ECC (Escore de Condição Corporal)"
                name="ecc"
                help="Escala de 1 a 5"
              >
                <Select placeholder="Selecione">
                  <Option value={1}>1 - Muito magro</Option>
                  <Option value={2}>2 - Magro</Option>
                  <Option value={3}>3 - Ideal</Option>
                  <Option value={4}>4 - Gordo</Option>
                  <Option value={5}>5 - Obeso</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="FAMACHA"
                name="famacha"
                help="Cor da mucosa ocular (1-5)"
              >
                <Select placeholder="Selecione">
                  <Option value={1}>1 - Vermelho vivo</Option>
                  <Option value={2}>2 - Vermelho rosado</Option>
                  <Option value={3}>3 - Rosado</Option>
                  <Option value={4}>4 - Rosado pálido</Option>
                  <Option value={5}>5 - Branco</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Observações"
            name="observations"
          >
            <TextArea
              rows={4}
              placeholder="Observações sobre o controle parasitário (eficácia do tratamento, reações adversas, etc.)"
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
                  Registrar Controle
                </Button>
              </Col>
            )}
          </Row>
        </Form>
      </Card>
    </>
  );
};

export default ParasiteControlForm;
