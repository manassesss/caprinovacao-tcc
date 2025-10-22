"use client";
import { Space, Tooltip, Button, Table, Card, Input, Row, Breadcrumb, Col, Form, Select, Modal, message, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { MdOutlineOpenInNew } from "react-icons/md";
import React, { useEffect, useState } from 'react';
import { getHerds, deleteHerd, getProperties } from '@/services/api';

const { Search } = Input;
const { Option } = Select;

const HerdsList = ({ onEdit }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [herds, setHerds] = useState([]);
  const [filteredHerds, setFilteredHerds] = useState([]);
  const [properties, setProperties] = useState([]);
  const [details, setDetails] = useState({});

  useEffect(() => {
    loadProperties();
    loadHerds();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      message.error('Erro ao carregar fazendas para filtro');
      console.error(error);
    }
  };

  const loadHerds = async () => {
    try {
      setLoading(true);
      const data = await getHerds();
      setHerds(data);
      setFilteredHerds(data);
    } catch (error) {
      message.error('Erro ao carregar rebanhos');
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
      await deleteHerd(record.id);
      message.success('Rebanho excluído com sucesso!');
      loadHerds();
    } catch (error) {
      message.error('Erro ao excluir rebanho');
      console.error(error);
    }
  };

  const onSearch = (value) => {
    const currentFilters = form.getFieldsValue();
    const filtered = herds.filter(herd =>
      (herd.name.toLowerCase().includes(value.toLowerCase())) &&
      (!currentFilters.property_id || herd.property_id === currentFilters.property_id) &&
      (!currentFilters.species || herd.species === currentFilters.species) &&
      (!currentFilters.feeding_management || herd.feeding_management === currentFilters.feeding_management) &&
      (!currentFilters.production_type || herd.production_type === currentFilters.production_type)
    );
    setFilteredHerds(filtered);
  };

  const onFilterChange = () => {
    const filters = form.getFieldsValue();
    let filtered = herds;

    if (filters.name) {
      filtered = filtered.filter(herd => herd.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.property_id) {
      filtered = filtered.filter(herd => herd.property_id === filters.property_id);
    }
    if (filters.species) {
      filtered = filtered.filter(herd => herd.species === filters.species);
    }
    if (filters.feeding_management) {
      filtered = filtered.filter(herd => herd.feeding_management === filters.feeding_management);
    }
    if (filters.production_type) {
      filtered = filtered.filter(herd => herd.production_type === filters.production_type);
    }

    setFilteredHerds(filtered);
  };

  const getSpeciesLabel = (species) => {
    const map = {
      'caprino': 'Caprino',
      'ovino': 'Ovino',
      'ambos': 'Ambos'
    };
    return map[species] || species;
  };

  const getFeedingLabel = (feeding) => {
    const map = {
      'extensivo': 'Extensivo',
      'semi-intensivo': 'Semi-intensivo',
      'intensivo': 'Intensivo'
    };
    return map[feeding] || feeding;
  };

  const getProductionLabel = (production) => {
    const map = {
      'carne': 'Carne',
      'leite': 'Leite',
      'misto': 'Misto'
    };
    return map[production] || production;
  };

  const getSpeciesColor = (species) => {
    const map = {
      'caprino': 'blue',
      'ovino': 'green',
      'ambos': 'purple'
    };
    return map[species] || 'default';
  };

  const columns = [
    { title: 'Nome', dataIndex: 'name', key: 'name' },
    {
      title: 'Fazenda',
      dataIndex: 'property_id',
      key: 'property_id',
      render: (property_id) => {
        const property = properties.find(p => p.id === property_id);
        return property ? <Tag color="cyan">{property.name}</Tag> : '-';
      }
    },
    {
      title: 'Espécie',
      dataIndex: 'species',
      key: 'species',
      render: (species) => <Tag color={getSpeciesColor(species)}>{getSpeciesLabel(species)}</Tag>
    },
    {
      title: 'Manejo Alimentar',
      dataIndex: 'feeding_management',
      key: 'feeding_management',
      render: (feeding) => getFeedingLabel(feeding)
    },
    {
      title: 'Produção',
      dataIndex: 'production_type',
      key: 'production_type',
      render: (production) => getProductionLabel(production)
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Detalhes">
            <Button shape="circle" type="primary" icon={<MdOutlineOpenInNew />} onClick={() => handleDetails(record)} />
          </Tooltip>
          <Tooltip title="Editar">
            <Button shape="circle" icon={<EditOutlined />} onClick={() => onEdit(record.id)} />
          </Tooltip>
          <Popconfirm
            title="Tem certeza que deseja excluir este rebanho?"
            onConfirm={() => handleDelete(record)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Excluir">
              <Button shape="circle" icon={<DeleteOutlined />} type="primary" danger />
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
              { title: <strong>Rebanhos</strong> },
            ]}
          />
          <Card title="Filtros">
            <Form form={form} layout="vertical" onValuesChange={onFilterChange}>
              <Row gutter={16}>
                <Col xs={24} md={6}>
                  <Form.Item label="Nome" name="name">
                    <Search
                      placeholder="Buscar por nome"
                      onSearch={onSearch}
                      enterButton
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item label="Fazenda" name="property_id">
                    <Select
                      showSearch
                      placeholder="Selecione uma fazenda"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      allowClear
                    >
                      {properties.map(prop => (
                        <Option key={prop.id} value={prop.id}>{prop.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item label="Espécie" name="species">
                    <Select placeholder="Selecione" allowClear>
                      <Option value="caprino">Caprino</Option>
                      <Option value="ovino">Ovino</Option>
                      <Option value="ambos">Ambos</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item label="Manejo Alimentar" name="feeding_management">
                    <Select placeholder="Selecione" allowClear>
                      <Option value="extensivo">Extensivo</Option>
                      <Option value="semi-intensivo">Semi-intensivo</Option>
                      <Option value="intensivo">Intensivo</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item label="Produção" name="production_type">
                    <Select placeholder="Selecione" allowClear>
                      <Option value="carne">Carne</Option>
                      <Option value="leite">Leite</Option>
                      <Option value="misto">Misto</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
          <Card
            title={
              <Row justify="space-between">
                <h1>Rebanhos</h1>
                <Button
                  type="primary"
                  onClick={() => onEdit()}
                  icon={<PlusOutlined />}
                  className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                >
                  Adicionar
                </Button>
              </Row>
            }
          >
            <Table dataSource={filteredHerds} columns={columns} rowKey="id" loading={loading} />
          </Card>
          <Modal
            title={<p>Detalhes de {details?.name}</p>}
            open={open}
            footer={null}
            centered
            onCancel={() => setOpen(false)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <strong>Nome:</strong>
                <div style={{ marginTop: '4px' }}>{details?.name}</div>
              </div>
              {details?.description && (
                <div>
                  <strong>Descrição:</strong>
                  <div style={{ marginTop: '4px' }}>{details?.description}</div>
                </div>
              )}
              <div>
                <strong>Fazenda:</strong>
                <div style={{ marginTop: '4px' }}>
                  {properties.find(p => p.id === details?.property_id)?.name || '-'}
                </div>
              </div>
              <div>
                <strong>Espécie:</strong>
                <div style={{ marginTop: '4px' }}>
                  <Tag color={getSpeciesColor(details?.species)}>
                    {getSpeciesLabel(details?.species)}
                  </Tag>
                </div>
              </div>
              <div>
                <strong>Manejo Alimentar:</strong>
                <div style={{ marginTop: '4px' }}>{getFeedingLabel(details?.feeding_management)}</div>
              </div>
              <div>
                <strong>Tipo de Produção:</strong>
                <div style={{ marginTop: '4px' }}>{getProductionLabel(details?.production_type)}</div>
              </div>
            </Space>
          </Modal>
        </Space>
      </main>
    </>
  );
};

export default HerdsList;

