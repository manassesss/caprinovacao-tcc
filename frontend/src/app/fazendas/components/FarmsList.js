"use client";
import { Space, Tooltip, Button, Table, Card, Input, Row, Breadcrumb, Modal, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EnvironmentOutlined, PhoneOutlined, BankOutlined } from '@ant-design/icons';
import { MdOutlineOpenInNew } from "react-icons/md";
import React, { useEffect, useState } from 'react';
import { getProperties, deleteProperty } from '@/services/api';

const { Search } = Input;

const FarmsList = ({ onEdit }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const data = await getProperties();
      setFarms(data);
      setFilteredFarms(data);
    } catch (error) {
      message.error('Erro ao carregar fazendas');
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
      await deleteProperty(record.id);
      message.success('Fazenda excluída com sucesso!');
      loadFarms();
    } catch (error) {
      message.error('Erro ao excluir fazenda');
      console.error(error);
    }
  };

  const onSearch = (value) => {
    if (value.length > 0) {
      const filtered = farms.filter(farm =>
        farm.name.toLowerCase().includes(value.toLowerCase()) ||
        farm.city.toLowerCase().includes(value.toLowerCase()) ||
        farm.state.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredFarms(filtered);
    } else {
      setFilteredFarms(farms);
    }
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Município',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      key: 'state',
      width: 80,
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || '-',
    },
    {
      title: 'CNPJ',
      dataIndex: 'cpf_cnpj',
      key: 'cpf_cnpj',
      render: (text) => text || '-',
    },
    {
      title: 'Área (ha)',
      dataIndex: 'area',
      key: 'area',
      render: (text) => text ? `${text} ha` : '-',
      align: 'right',
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detalhes">
            <Button
              shape="circle"
              type="primary"
              icon={<MdOutlineOpenInNew />}
              onClick={() => handleDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => onEdit(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir fazenda"
            description="Tem certeza que deseja excluir esta fazenda?"
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
                title: <strong>Fazendas</strong>,
              },
            ]}
          />
          <Card title="Filtros">
            <Search
              placeholder="Buscar por nome, município ou estado"
              onSearch={onSearch}
              onChange={(e) => onSearch(e.target.value)}
              enterButton
              allowClear
            />
          </Card>
          <Card
            title={
              <Row justify="space-between">
                <h1>Fazendas</h1>
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
              dataSource={filteredFarms} 
              columns={columns} 
              rowKey="id" 
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} fazendas`,
              }}
            />
          </Card>

          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EnvironmentOutlined style={{ color: '#667eea' }} />
                <span>Detalhes da Fazenda: {details?.name}</span>
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
                  <strong>Nome:</strong>
                  <div style={{ marginTop: '4px', fontSize: '16px' }}>{details?.name}</div>
                </div>
                
                <Row gutter={16}>
                  <div style={{ flex: 1 }}>
                    <strong>Município:</strong>
                    <div style={{ marginTop: '4px' }}>{details?.city}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>Estado:</strong>
                    <div style={{ marginTop: '4px' }}>{details?.state}</div>
                  </div>
                </Row>

                {details?.phone && (
                  <div>
                    <strong>
                      <PhoneOutlined /> Telefone:
                    </strong>
                    <div style={{ marginTop: '4px' }}>{details?.phone}</div>
                  </div>
                )}

                {details?.cpf_cnpj && (
                  <div>
                    <strong>
                      <BankOutlined /> CNPJ:
                    </strong>
                    <div style={{ marginTop: '4px' }}>{details?.cpf_cnpj}</div>
                  </div>
                )}

                {details?.address && (
                  <div>
                    <strong>
                      <EnvironmentOutlined /> Endereço:
                    </strong>
                    <div style={{ marginTop: '4px' }}>{details?.address}</div>
                  </div>
                )}

                {details?.cep && (
                  <div>
                    <strong>CEP:</strong>
                    <div style={{ marginTop: '4px' }}>{details?.cep}</div>
                  </div>
                )}

                {details?.area && (
                  <div>
                    <strong>Área:</strong>
                    <div style={{ marginTop: '4px' }}>{details?.area} hectares</div>
                  </div>
                )}

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

export default FarmsList;

