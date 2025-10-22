"use client";
import { Space, Tooltip, Button, Table, Card, Input, Row, Breadcrumb, Col, Form, Select, Modal, message, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { MdOutlineOpenInNew } from "react-icons/md";
import React, { useEffect, useState } from 'react';
import { getAnimals, deleteAnimal, getProperties, getHerds } from '@/services/api';

const { Search } = Input;
const { Option } = Select;

const AnimalsList = ({ onEdit }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [details, setDetails] = useState({});

  useEffect(() => {
    loadProperties();
    loadHerds();
    loadAnimals();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadHerds = async () => {
    try {
      const data = await getHerds();
      setHerds(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const data = await getAnimals();
      setAnimals(data);
      setFilteredAnimals(data);
    } catch (error) {
      message.error('Erro ao carregar animais');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetails = (record) => {
    setDetails(record);
    setOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      await deleteAnimal(record.id);
      message.success('Animal excluído com sucesso!');
      loadAnimals();
    } catch (error) {
      message.error('Erro ao excluir animal');
      console.error(error);
    }
  };

  const onSearch = (value) => {
    const currentFilters = form.getFieldsValue();
    const filtered = animals.filter(animal =>
      (animal.earring_identification.toLowerCase().includes(value.toLowerCase()) ||
       (animal.name && animal.name.toLowerCase().includes(value.toLowerCase()))) &&
      (!currentFilters.property_id || animal.property_id === currentFilters.property_id) &&
      (!currentFilters.herd_id || animal.herd_id === currentFilters.herd_id)
    );
    setFilteredAnimals(filtered);
  };

  const onFilterChange = () => {
    const filters = form.getFieldsValue();
    let filtered = animals;

    if (filters.property_id) {
      filtered = filtered.filter(animal => animal.property_id === filters.property_id);
    }
    if (filters.herd_id) {
      filtered = filtered.filter(animal => animal.herd_id === filters.herd_id);
    }

    setFilteredAnimals(filtered);
  };

  const getGenderLabel = (gender) => gender === 'M' ? 'Macho' : 'Fêmea';
  const getCategoryLabel = (category) => {
    const map = {
      'cabrito': 'Cabrito',
      'borrego': 'Borrego',
      'marrão': 'Marrão',
      'matriz': 'Matriz',
      'reprodutor': 'Reprodutor'
    };
    return map[category] || category;
  };

  const columns = [
    { title: 'Identificação', dataIndex: 'earring_identification', key: 'earring_identification', width: 120 },
    { title: 'Nome', dataIndex: 'name', key: 'name', render: (text) => text || '-' },
    {
      title: 'Sexo',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender) => (
        <Tag color={gender === 'M' ? 'blue' : 'pink'}>{getGenderLabel(gender)}</Tag>
      )
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (category) => getCategoryLabel(category)
    },
    {
      title: 'Rebanho',
      dataIndex: 'herd_id',
      key: 'herd_id',
      render: (herd_id) => {
        const herd = herds.find(h => h.id === herd_id);
        return herd ? <Tag color="purple">{herd.name}</Tag> : '-';
      }
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detalhes">
            <Button shape="circle" type="primary" icon={<MdOutlineOpenInNew />} onClick={() => handleDetails(record)} />
          </Tooltip>
          <Tooltip title="Editar">
            <Button shape="circle" icon={<EditOutlined />} onClick={() => onEdit(record.id)} />
          </Tooltip>
          <Popconfirm
            title="Tem certeza que deseja excluir este animal?"
            onConfirm={() => handleDelete(record)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Excluir">
              <Button 
                shape="circle" 
                icon={<DeleteOutlined />} 
                type="primary" 
                danger 
                className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <main style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Breadcrumb
            items={[
              { title: 'Cadastros' },
              { title: <strong>Animais</strong> },
            ]}
          />
          <Card title="Filtros">
            <Form form={form} layout="vertical" onValuesChange={onFilterChange}>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label="Buscar" name="search">
                    <Search
                      placeholder="Buscar por identificação ou nome"
                      onSearch={onSearch}
                      enterButton
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Fazenda" name="property_id">
                    <Select
                      showSearch
                      placeholder="Selecione uma fazenda"
                      optionFilterProp="children"
                      allowClear
                    >
                      {properties.map(prop => (
                        <Option key={prop.id} value={prop.id}>{prop.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Rebanho" name="herd_id">
                    <Select
                      showSearch
                      placeholder="Selecione um rebanho"
                      optionFilterProp="children"
                      allowClear
                    >
                      {herds.map(herd => (
                        <Option key={herd.id} value={herd.id}>{herd.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
          <Card
            title={
              <Row justify="space-between">
                <h1>Animais</h1>
                <Button
                  type="primary"
                  onClick={() => onEdit()}
                  icon={<PlusOutlined />}
                  size="large"
                  className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                >
                  Adicionar
                </Button>
              </Row>
            }
          >
            <Table 
              dataSource={filteredAnimals} 
              columns={columns} 
              rowKey="id" 
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} animais`,
              }}
            />
          </Card>
          
          <Modal
            title={`Animal: ${details?.earring_identification}`}
            open={open}
            footer={null}
            centered
            onCancel={() => setOpen(false)}
            width={700}
          >
            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size="middle">
              <Row gutter={16}>
                <Col span={12}>
                  <strong>Identificação:</strong>
                  <div>{details?.earring_identification}</div>
                </Col>
                <Col span={12}>
                  <strong>Nome:</strong>
                  <div>{details?.name || '-'}</div>
                </Col>
                <Col span={12}>
                  <strong>Sexo:</strong>
                  <div><Tag color={details?.gender === 'M' ? 'blue' : 'pink'}>{getGenderLabel(details?.gender)}</Tag></div>
                </Col>
                <Col span={12}>
                  <strong>Categoria:</strong>
                  <div>{getCategoryLabel(details?.category)}</div>
                </Col>
                <Col span={12}>
                  <strong>Data de Nascimento:</strong>
                  <div>{details?.birth_date}</div>
                </Col>
                <Col span={12}>
                  <strong>Composição Genética:</strong>
                  <div>{details?.genetic_composition}</div>
                </Col>
              </Row>
            </Space>
          </Modal>
        </Space>
      </main>
    </>
  );
};

export default AnimalsList;
