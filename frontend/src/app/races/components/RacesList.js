"use client";
import { Space, Tooltip, Button, Table, Card, Input, Row, Breadcrumb, Modal, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { MdOutlineOpenInNew } from "react-icons/md";
import React, { useEffect, useState } from 'react';
import { getRaces, deleteRace } from '@/services/api';

const { Search } = Input;

const RacesList = ({ onEdit }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [races, setRaces] = useState([]);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [details, setDetails] = useState({});

  useEffect(() => {
    loadRaces();
  }, []);

  const loadRaces = async () => {
    try {
      setLoading(true);
      const data = await getRaces();
      setRaces(data);
      setFilteredRaces(data);
    } catch (error) {
      message.error('Erro ao carregar raças');
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
      await deleteRace(record.id);
      message.success('Raça excluída com sucesso!');
      loadRaces();
    } catch (error) {
      message.error('Erro ao excluir raça');
      console.error(error);
    }
  };

  const onSearch = (value) => {
    if (value.length > 0) {
      const filtered = races.filter(race =>
        race.name.toLowerCase().includes(value.toLowerCase()) ||
        (race.origin && race.origin.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredRaces(filtered);
    } else {
      setFilteredRaces(races);
    }
  };

  const columns = [
    { 
      title: 'Nome da Raça', 
      dataIndex: 'name', 
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    { 
      title: 'Origem', 
      dataIndex: 'origin', 
      key: 'origin',
      render: (text) => text || '-',
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
            title="Tem certeza que deseja excluir esta raça?"
            description="Esta ação não pode ser desfeita."
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
              { title: 'Cadastros' },
              { title: <strong>Raças</strong> },
            ]}
          />
          <Card title="Filtros">
            <Search
              placeholder="Buscar por nome ou origem"
              onSearch={onSearch}
              onChange={(e) => onSearch(e.target.value)}
              enterButton
              size="large"
            />
          </Card>
          <Card
            title={
              <Row justify="space-between">
                <h1>Raças</h1>
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
              dataSource={filteredRaces} 
              columns={columns} 
              rowKey="id" 
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} raças`,
              }}
            />
          </Card>
          
          <Modal
            title={
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                Detalhes de {details?.name}
              </Space>
            }
            open={open}
            footer={null}
            centered
            onCancel={() => setOpen(false)}
            width={600}
          >
            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size="middle">
              <div>
                <strong style={{ fontSize: '14px', color: '#666' }}>Nome da Raça:</strong>
                <div style={{ marginTop: '4px', fontSize: '16px' }}>{details?.name}</div>
              </div>
              
              {details?.origin && (
                <div>
                  <strong style={{ fontSize: '14px', color: '#666' }}>Origem:</strong>
                  <div style={{ marginTop: '4px', fontSize: '16px' }}>{details?.origin}</div>
                </div>
              )}
              
              {details?.general_aspects && (
                <div>
                  <strong style={{ fontSize: '14px', color: '#666' }}>Aspectos Gerais:</strong>
                  <div 
                    style={{ 
                      marginTop: '8px', 
                      fontSize: '14px', 
                      lineHeight: '1.6',
                      padding: '12px',
                      background: '#f5f5f5',
                      borderRadius: '4px',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {details?.general_aspects}
                  </div>
                </div>
              )}
              
              {!details?.origin && !details?.general_aspects && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  <InfoCircleOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <div>Nenhuma informação adicional cadastrada</div>
                </div>
              )}
            </Space>
          </Modal>
        </Space>
      </main>
    </>
  );
};

export default RacesList;
