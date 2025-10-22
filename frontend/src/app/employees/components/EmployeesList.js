"use client";
import { Space, Tooltip, Button, Table, Card, Input, Row, Breadcrumb, Modal, message, Popconfirm, Select, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { getEmployees, deleteEmployee, getProperties } from '@/services/api';

const { Search } = Input;
const { Option } = Select;

const EmployeesList = ({ onEdit }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    loadProperties();
    loadEmployees();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Erro ao carregar fazendas:', error);
    }
  };

  const loadEmployees = async (propertyId = null) => {
    try {
      setLoading(true);
      const data = await getEmployees(propertyId);
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      message.error('Erro ao carregar funcionários');
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
      await deleteEmployee(record.id);
      message.success('Funcionário excluído com sucesso!');
      loadEmployees(selectedProperty);
    } catch (error) {
      message.error('Erro ao excluir funcionário');
      console.error(error);
    }
  };

  const onSearch = (value) => {
    if (value.length > 0) {
      const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(value.toLowerCase()) ||
        emp.cpf.toLowerCase().includes(value.toLowerCase()) ||
        (emp.email && emp.email.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  };

  const handlePropertyFilter = (propertyId) => {
    setSelectedProperty(propertyId);
    loadEmployees(propertyId);
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : propertyId;
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'CPF',
      dataIndex: 'cpf',
      key: 'cpf',
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text || '-',
    },
    {
      title: 'Fazenda',
      dataIndex: 'property_id',
      key: 'property_id',
      render: (propertyId) => (
        <Tag color="blue">{getPropertyName(propertyId)}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => onEdit(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir funcionário"
            description="Tem certeza que deseja excluir este funcionário?"
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
              {
                title: 'Cadastros',
              },
              {
                title: <strong>Funcionários</strong>,
              },
            ]}
          />
          <Card title="Filtros">
            <Row gutter={16}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Fazenda:</label>
                <Select
                  placeholder="Todas as fazendas"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={handlePropertyFilter}
                  value={selectedProperty}
                >
                  {properties.map(prop => (
                    <Option key={prop.id} value={prop.id}>
                      {prop.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Buscar:</label>
                <Search
                  placeholder="Buscar por nome, CPF ou email"
                  onSearch={onSearch}
                  onChange={(e) => onSearch(e.target.value)}
                  enterButton
                  allowClear
                />
              </div>
            </Row>
          </Card>
          <Card
            title={
              <Row justify="space-between">
                <h1>Funcionários</h1>
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
            <Table
              dataSource={filteredEmployees}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} funcionários`,
              }}
            />
          </Card>

          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined style={{ color: '#667eea' }} />
                <span>Detalhes do Funcionário: {details?.name}</span>
              </div>
            }
            open={open}
            footer={null}
            centered
            onCancel={() => setOpen(false)}
            width={600}
          >
            <div style={{ padding: '16px 0' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <strong><UserOutlined /> Nome:</strong>
                  <div style={{ marginTop: '4px', fontSize: '16px' }}>{details?.name}</div>
                </div>

                <Row gutter={16}>
                  <div style={{ flex: 1 }}>
                    <strong><IdcardOutlined /> CPF:</strong>
                    <div style={{ marginTop: '4px' }}>{details?.cpf}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong><PhoneOutlined /> Telefone:</strong>
                    <div style={{ marginTop: '4px' }}>{details?.phone}</div>
                  </div>
                </Row>

                {details?.email && (
                  <div>
                    <strong><MailOutlined /> Email:</strong>
                    <div style={{ marginTop: '4px' }}>{details?.email}</div>
                  </div>
                )}

                {details?.address && (
                  <div>
                    <strong>Endereço:</strong>
                    <div style={{ marginTop: '4px' }}>{details?.address}</div>
                  </div>
                )}

                {(details?.city || details?.state) && (
                  <div>
                    <strong>Localização:</strong>
                    <div style={{ marginTop: '4px' }}>
                      {details?.city}{details?.city && details?.state ? ' - ' : ''}{details?.state}
                    </div>
                  </div>
                )}

                <div>
                  <strong>Fazenda:</strong>
                  <div style={{ marginTop: '4px' }}>
                    <Tag color="blue">{getPropertyName(details?.property_id)}</Tag>
                  </div>
                </div>

                <div>
                  <strong>Login:</strong>
                  <div style={{ marginTop: '4px' }}>{details?.login}</div>
                </div>

                <div>
                  <strong>Status:</strong>
                  <div style={{ marginTop: '4px' }}>
                    <Tag color={details?.is_active ? 'green' : 'red'}>
                      {details?.is_active ? 'Ativo' : 'Inativo'}
                    </Tag>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginTop: '8px' }}>
                  <small style={{ color: '#999' }}>
                    Cadastrado em: {details?.created_at ? new Date(details.created_at).toLocaleDateString('pt-BR') : '-'}
                  </small>
                </div>
              </Space>
            </div>
          </Modal>
        </Space>
      </main>
    </>
  );
};

export default EmployeesList;
