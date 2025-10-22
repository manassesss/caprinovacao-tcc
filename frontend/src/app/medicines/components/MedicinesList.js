"use client";
import { Space, Tooltip, Button, Table, Card, Input, Row, Breadcrumb, Modal, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { MdOutlineOpenInNew } from "react-icons/md";
import React, { useEffect, useState } from 'react';
import { getMedicines, deleteMedicine } from '@/services/api';

const { Search } = Input;

const MedicinesList = ({ onEdit }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [details, setDetails] = useState({});

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await getMedicines();
      setMedicines(data);
      setFilteredMedicines(data);
    } catch (error) {
      message.error('Erro ao carregar medicamentos');
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
      await deleteMedicine(record.id);
      message.success('Medicamento excluído com sucesso!');
      loadMedicines();
    } catch (error) {
      message.error('Erro ao excluir medicamento');
      console.error(error);
    }
  };

  const onSearch = (value) => {
    if (value.length > 0) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(value.toLowerCase()) ||
        (medicine.description && medicine.description.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  };

  const columns = [
    { 
      title: 'Nome do Medicamento', 
      dataIndex: 'name', 
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '40%',
    },
    { 
      title: 'Descrição', 
      dataIndex: 'description', 
      key: 'description',
      render: (text) => text ? (text.length > 100 ? `${text.substring(0, 100)}...` : text) : '-',
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
            title="Tem certeza que deseja excluir este medicamento?"
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
              { title: <strong>Medicamentos</strong> },
            ]}
          />
          <Card title="Filtros">
            <Search
              placeholder="Buscar por nome ou descrição"
              onSearch={onSearch}
              onChange={(e) => onSearch(e.target.value)}
              enterButton
              size="large"
            />
          </Card>
          <Card
            title={
              <Row justify="space-between">
                <h1>Medicamentos</h1>
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
              dataSource={filteredMedicines} 
              columns={columns} 
              rowKey="id" 
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} medicamentos`,
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
            width={600}
          >
            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size="middle">
              <div>
                <strong style={{ fontSize: '14px', color: '#666' }}>Nome do Medicamento:</strong>
                <div style={{ marginTop: '4px', fontSize: '16px', fontWeight: 500 }}>{details?.name}</div>
              </div>
              
              {details?.description ? (
                <div>
                  <strong style={{ fontSize: '14px', color: '#666' }}>Descrição:</strong>
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
                    {details?.description}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  <MedicineBoxOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <div>Nenhuma descrição cadastrada</div>
                </div>
              )}
            </Space>
          </Modal>
        </Space>
      </main>
    </>
  );
};

export default MedicinesList;
