"use client";
import { Form, Input, Button, Card, message, Select, DatePicker, Breadcrumb, Row, Col, Radio, Transfer, Space, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const VaccinationForm = ({ id }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [isBatch, setIsBatch] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [vaccinatedAnimals, setVaccinatedAnimals] = useState([]);
  const isEdit = !!id;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      loadVaccinationData();
    }
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [propertiesData, herdsData, animalsData, medicinesData] = await Promise.all([
        api.getProperties(),
        api.getHerds(),
        api.getAnimals(),
        api.getMedicines()
      ]);
      setProperties(propertiesData);
      setHerds(herdsData);
      setAnimals(animalsData);
      setMedicines(medicinesData);
    } catch (error) {
      message.error('Erro ao carregar dados');
      console.error(error);
    }
  };

  const loadVaccinationData = async () => {
    try {
      const data = await api.getVaccination(id);
      setSelectedProperty(data.property_id);
      setSelectedHerd(data.herd_id);
      setIsBatch(data.is_batch);
      
      // Buscar animais vacinados
      const animalsData = await api.getVaccinationAnimals(id);
      setVaccinatedAnimals(animalsData);
      setSelectedAnimals(animalsData.map(va => va.animal_id));
      
      form.setFieldsValue({
        ...data,
        vaccination_date: dayjs(data.vaccination_date)
      });
    } catch (error) {
      message.error('Erro ao carregar vacinação');
      console.error(error);
    }
  };

  const handlePropertyChange = (value) => {
    setSelectedProperty(value);
    setSelectedHerd(null);
    setSelectedAnimals([]);
    form.setFieldsValue({ herd_id: undefined });
  };

  const handleHerdChange = (value) => {
    setSelectedHerd(value);
    setSelectedAnimals([]);
  };

  const handleBatchChange = (e) => {
    const batch = e.target.value;
    setIsBatch(batch);
    setSelectedAnimals([]);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formattedData = {
        property_id: values.property_id,
        herd_id: isBatch ? values.herd_id : null,
        medicine_id: values.medicine_id,
        vaccination_date: values.vaccination_date.format('YYYY-MM-DD'),
        observations: values.observations || null,
        is_batch: isBatch,
        animal_ids: isBatch ? [] : selectedAnimals
      };

      if (isEdit) {
        message.warning('Vacinações não podem ser editadas');
      } else {
        if (!isBatch && selectedAnimals.length === 0) {
          message.warning('Selecione pelo menos um animal');
          setLoading(false);
          return;
        }
        await api.createVaccination(formattedData);
        message.success('Vacinação registrada com sucesso!');
        router.push('/vaccination');
      }
    } catch (error) {
      message.error('Erro ao salvar vacinação');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHerds = selectedProperty 
    ? herds.filter(h => h.property_id === selectedProperty)
    : herds;

  const filteredAnimals = selectedProperty 
    ? (selectedHerd 
        ? animals.filter(a => a.property_id === selectedProperty && a.herd_id === selectedHerd)
        : animals.filter(a => a.property_id === selectedProperty))
    : animals;

  // Preparar dados para o Transfer
  const transferDataSource = filteredAnimals.map(animal => ({
    key: animal.id.toString(),
    title: `${animal.earring_identification} - ${animal.name || 'Sem nome'}`,
    description: `${animal.gender === 'M' ? 'Macho' : 'Fêmea'} - ${animal.category || ''}`,
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { title: 'Controle Animal' },
          { title: 'Vacinação', href: '/vaccination' },
          { title: isEdit ? 'Visualizar' : 'Nova Vacinação' },
        ]}
        style={{ marginBottom: 24 }}
      />
      <Card title={isEdit ? "Visualizar Vacinação" : "Nova Vacinação"}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={isEdit}
        >
          <Row gutter={16}>
            <Col span={8}>
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

            <Col span={8}>
              <Form.Item
                label="Medicamento (Vacina)"
                name="medicine_id"
                rules={[{ required: true, message: 'Selecione o medicamento' }]}
              >
                <Select 
                  placeholder="Selecione a vacina"
                  showSearch
                  optionFilterProp="children"
                >
                  {medicines.map(medicine => (
                    <Option key={medicine.id} value={medicine.id}>{medicine.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Data da Vacinação"
                name="vaccination_date"
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

          {!isEdit && (
            <>
              <Form.Item label="Tipo de Aplicação">
                <Radio.Group value={isBatch} onChange={handleBatchChange}>
                  <Space direction="vertical">
                    <Radio value={false}>
                      <strong>Individual</strong> - Selecionar animais específicos
                    </Radio>
                    <Radio value={true}>
                      <strong>Em Lote</strong> - Aplicar em todo o rebanho
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              {isBatch && (
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Rebanho"
                      name="herd_id"
                      rules={[{ required: isBatch, message: 'Selecione o rebanho' }]}
                    >
                      <Select 
                        placeholder="Selecione o rebanho para vacinação em lote"
                        onChange={handleHerdChange}
                        disabled={!selectedProperty}
                      >
                        {filteredHerds.map(herd => (
                          <Option key={herd.id} value={herd.id}>{herd.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {!isBatch && selectedProperty && (
                <Form.Item label="Animais a Vacinar">
                  <Transfer
                    dataSource={transferDataSource}
                    titles={['Disponíveis', 'Selecionados']}
                    targetKeys={selectedAnimals.map(id => id.toString())}
                    onChange={(targetKeys) => setSelectedAnimals(targetKeys.map(k => parseInt(k)))}
                    render={item => item.title}
                    listStyle={{
                      width: '45%',
                      height: 400,
                    }}
                    showSearch
                    filterOption={(inputValue, item) =>
                      item.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                    }
                  />
                  {selectedAnimals.length > 0 && (
                    <Tag color="blue" style={{ marginTop: 8 }}>
                      {selectedAnimals.length} animal(is) selecionado(s)
                    </Tag>
                  )}
                </Form.Item>
              )}
            </>
          )}

          {isEdit && vaccinatedAnimals.length > 0 && (
            <Form.Item label="Animais Vacinados">
              <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: 4, padding: 8 }}>
                {vaccinatedAnimals.map((va, index) => {
                  const animal = animals.find(a => a.id === va.animal_id);
                  return animal ? (
                    <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                      {animal.earring_identification} - {animal.name || 'Sem nome'}
                    </Tag>
                  ) : null;
                })}
              </div>
            </Form.Item>
          )}

          <Form.Item
            label="Observações"
            name="observations"
          >
            <TextArea
              rows={4}
              placeholder="Observações sobre a vacinação (lote da vacina, reações adversas, etc.)"
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
                  Registrar Vacinação
                </Button>
              </Col>
            )}
          </Row>
        </Form>
      </Card>
    </>
  );
};

export default VaccinationForm;

