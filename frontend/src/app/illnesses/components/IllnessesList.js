"use client";
import { Space, Tooltip, Button, Table, Card, Input, Row, Breadcrumb, Modal, message, Popconfirm, Tabs } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { MdOutlineOpenInNew } from "react-icons/md";
import React, { useEffect, useState } from 'react';
import { getIllnesses, deleteIllness } from '@/services/api';

const { Search } = Input;

const IllnessesList = ({ onEdit }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [illnesses, setIllnesses] = useState([]);
  const [filteredIllnesses, setFilteredIllnesses] = useState([]);
  const [details, setDetails] = useState({});

  useEffect(() => {
    loadIllnesses();
  }, []);

  const loadIllnesses = async () => {
    try {
      setLoading(true);
      const data = await getIllnesses();
      setIllnesses(data);
      setFilteredIllnesses(data);
    } catch (error) {
      message.error('Erro ao carregar doenças');
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
      await deleteIllness(record.id);
      message.success('Doença excluída com sucesso!');
      loadIllnesses();
    } catch (error) {
      message.error('Erro ao excluir doença');
      console.error(error);
    }
  };

  const onSearch = (value) => {
    if (value.length > 0) {
      const filtered = illnesses.filter(illness =>
        illness.name.toLowerCase().includes(value.toLowerCase()) ||
        (illness.cause && illness.cause.toLowerCase().includes(value.toLowerCase())) ||
        (illness.symptoms && illness.symptoms.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredIllnesses(filtered);
    } else {
      setFilteredIllnesses(illnesses);
    }
  };

  const columns = [
    { 
      title: 'Nome da Doença', 
      dataIndex: 'name', 
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '30%',
    },
    { 
      title: 'Causa', 
      dataIndex: 'cause', 
      key: 'cause',
      render: (text) => text ? (text.length > 60 ? `${text.substring(0, 60)}...` : text) : '-',
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
            title="Tem certeza que deseja excluir esta doença?"
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

  const tabItems = [
    {
      key: 'info',
      label: 'Informações Gerais',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <strong style={{ fontSize: '14px', color: '#666' }}>Nome da Doença:</strong>
            <div style={{ marginTop: '4px', fontSize: '16px', fontWeight: 500 }}>{details?.name}</div>
          </div>
          
          {details?.cause && (
            <div>
              <strong style={{ fontSize: '14px', color: '#666' }}>Causa:</strong>
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
                {details?.cause}
              </div>
            </div>
          )}
        </Space>
      ),
    },
    {
      key: 'symptoms',
      label: 'Sintomas',
      children: details?.symptoms ? (
        <div 
          style={{ 
            fontSize: '14px', 
            lineHeight: '1.8',
            padding: '16px',
            background: '#fff7e6',
            borderLeft: '4px solid #fa8c16',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap'
          }}
        >
          {details?.symptoms}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <InfoCircleOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
          <div>Nenhum sintoma cadastrado</div>
        </div>
      ),
    },
    {
      key: 'prophylaxis',
      label: 'Profilaxia',
      children: details?.prophylaxis ? (
        <div 
          style={{ 
            fontSize: '14px', 
            lineHeight: '1.8',
            padding: '16px',
            background: '#e6f7ff',
            borderLeft: '4px solid #1890ff',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap'
          }}
        >
          {details?.prophylaxis}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <InfoCircleOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
          <div>Nenhuma profilaxia cadastrada</div>
        </div>
      ),
    },
    {
      key: 'treatment',
      label: 'Tratamento',
      children: details?.treatment ? (
        <div 
          style={{ 
            fontSize: '14px', 
            lineHeight: '1.8',
            padding: '16px',
            background: '#f6ffed',
            borderLeft: '4px solid #52c41a',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap'
          }}
        >
          {details?.treatment}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <MedicineBoxOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
          <div>Nenhum tratamento cadastrado</div>
        </div>
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
              { title: <strong>Doenças</strong> },
            ]}
          />
          <Card title="Filtros">
            <Search
              placeholder="Buscar por nome, causa ou sintomas"
              onSearch={onSearch}
              onChange={(e) => onSearch(e.target.value)}
              enterButton
              size="large"
            />
          </Card>
          <Card
            title={
              <Row justify="space-between">
                <h1>Doenças</h1>
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
              dataSource={filteredIllnesses} 
              columns={columns} 
              rowKey="id" 
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} doenças`,
              }}
            />
          </Card>
          
          <Modal
            title={
              <Space>
                <MedicineBoxOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                {details?.name}
              </Space>
            }
            open={open}
            footer={null}
            centered
            onCancel={() => setOpen(false)}
            width={800}
          >
            <Tabs items={tabItems} style={{ marginTop: 16 }} />
          </Modal>
        </Space>
      </main>
    </>
  );
};

export default IllnessesList;
