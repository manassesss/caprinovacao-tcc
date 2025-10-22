"use client";
import { Space, Tooltip, Button, Table, Card, Input, Row, Breadcrumb, Col, Form, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined }  from '@ant-design/icons';
import { FiFilter } from "react-icons/fi";

import React from 'react';

const { Search } = Input;


const  EmployeesList = ({onEdit}) => {
    const dataSource = [
        { id: '1', nome: 'Rebanho Santa Clara', especie: 'Caprino', manejo: 'Extensivo', producao: 'Leite' },
        { id: '2', nome: 'Fazenda Boa Vista', especie: 'Ovino', manejo: 'Semi-intensivo', producao: 'Carne' },
        { id: '3', nome: 'Sítio Esperança', especie: 'Ambos', manejo: 'Intensivo', producao: 'Misto' },
        { id: '4', nome: 'Rebanho Vale Verde', especie: 'Caprino', manejo: 'Extensivo', producao: 'Carne' },
        { id: '5', nome: 'Fazenda Harmonia', especie: 'Ovino', manejo: 'Semi-intensivo', producao: 'Leite' },
        { id: '6', nome: 'Rebanho Estrela', especie: 'Caprino', manejo: 'Intensivo', producao: 'Misto' },
        { id: '7', nome: 'Sítio Aurora', especie: 'Ovino', manejo: 'Extensivo', producao: 'Carne' },
        { id: '8', nome: 'Fazenda Bela Vista', especie: 'Ambos', manejo: 'Semi-intensivo', producao: 'Leite' },
        { id: '9', nome: 'Rebanho Sol Nascente', especie: 'Caprino', manejo: 'Intensivo', producao: 'Misto' },
        { id: '10', nome: 'Sítio Campo Alegre', especie: 'Ovino', manejo: 'Extensivo', producao: 'Carne' },
        { id: '11', nome: 'Rebanho Nova Aliança', especie: 'Ambos', manejo: 'Semi-intensivo', producao: 'Leite' },
        { id: '12', nome: 'Fazenda Primavera', especie: 'Caprino', manejo: 'Extensivo', producao: 'Carne' },
        { id: '13', nome: 'Rebanho Raio de Sol', especie: 'Ovino', manejo: 'Intensivo', producao: 'Misto' },
        { id: '14', nome: 'Sítio Encantado', especie: 'Caprino', manejo: 'Semi-intensivo', producao: 'Leite' },
        { id: '15', nome: 'Rebanho Campo Verde', especie: 'Ambos', manejo: 'Extensivo', producao: 'Carne' },
        { id: '16', nome: 'Fazenda Horizonte', especie: 'Ovino', manejo: 'Intensivo', producao: 'Misto' },
        { id: '17', nome: 'Rebanho Recanto Feliz', especie: 'Caprino', manejo: 'Semi-intensivo', producao: 'Leite' },
        { id: '18', nome: 'Sítio Flor do Campo', especie: 'Ambos', manejo: 'Extensivo', producao: 'Carne' },
        { id: '19', nome: 'Rebanho Estrela do Norte', especie: 'Ovino', manejo: 'Intensivo', producao: 'Misto' },
        { id: '20', nome: 'Fazenda Lagoa Azul', especie: 'Caprino', manejo: 'Extensivo', producao: 'Carne' },
        { id: '21', nome: 'Rebanho Montes Claros', especie: 'Ambos', manejo: 'Semi-intensivo', producao: 'Leite' },
        { id: '22', nome: 'Sítio Vida Nova', especie: 'Caprino', manejo: 'Intensivo', producao: 'Misto' },
        { id: '23', nome: 'Fazenda Terra Fértil', especie: 'Ovino', manejo: 'Extensivo', producao: 'Carne' },
        { id: '24', nome: 'Rebanho Sol Poente', especie: 'Caprino', manejo: 'Semi-intensivo', producao: 'Leite' },
        { id: '25', nome: 'Sítio Verdejante', especie: 'Ambos', manejo: 'Intensivo', producao: 'Misto' },
      ];
      
  
  const columns = [
    {
      title: 'Cod.',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'Espécie',
      dataIndex: 'especie',
      key: 'especie',
    },
    {
      title: 'Manejo Alimentar',
      dataIndex: 'manejo',
      key: 'manejo',
    },
    {
        title: 'Produção',
        dataIndex: 'producao',
        key: 'producao',
      },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => onEdit(record.id)}
            />
          </Tooltip>
          <Tooltip title="Excluir">
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              type="primary"
              danger
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    console.log('Edit:', record);
    // Adicione sua lógica de edição aqui
  };

  const handleDelete = (record) => {
    console.log('Delete:', record);
    // Adicione sua lógica de exclusão aqui
  };

  const onSearch = async (value) => {
    if (value.length > 0) {
      console.log(value)
    } else {
      console.log('nada')
    }
  };

  return (
    <>
      <main style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
        <Space direction="vertical">
          <Breadcrumb
              items={[
                {
                  title: 'Cadastros',
                },
                {
                  title: <strong>Rebanhos</strong>,
                },
              ]}
            />
          <Card title="Filtros">
            <Form layout="vertical">
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item label="Nome" name="name">
                      <Search
                          placeholder="Digite para buscar"
                          onSearch={onSearch}
                          enterButton
                        />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Espécie" name="especie">
                    <Select />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Manejo Alimentar	" name="manejo">
                      <Select />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Produção" name="producao">
                      <Select />
                  </Form.Item>
                  </Col>
                </Row>
                <Row  justify="end">
                  <Button
                    type="primary"
                    onClick={() => {
                      onEdit();
                    }}
                    icon={<FiFilter />}
                  >
                    Aplicar Filtros
                  </Button>
              </Row>
            </Form>
          </Card>
          <Card
            title={
              <Row justify="space-between">
                <h1>Rebanhos</h1>
                <Button
                  type="primary"
                  onClick={() => {
                    onEdit();
                  }}
                  icon={<PlusOutlined />}
                >
                  Adicionar
                </Button>
              </Row>
            }
          >
            <Table dataSource={dataSource} columns={columns}  rowKey="id"/>
          </Card>
        </Space>
      </main>
    </>
  );
}

export default EmployeesList;