"use client";
import { Space, Tooltip, Button, Table, Card, Row, Tag, Breadcrumb, Col, Form, message, Popconfirm, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined }  from '@ant-design/icons';
import { FiFilter } from "react-icons/fi";
import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const AnimalMovimentationList = ({onEdit}) => {
    const [movements, setMovements] = useState([]);
    const [filteredMovements, setFilteredMovements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [animals, setAnimals] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [movementsData, propertiesData, animalsData] = await Promise.all([
                api.getAnimalMovements(),
                api.getProperties(),
                api.getAnimals()
            ]);
            setMovements(movementsData);
            setFilteredMovements(movementsData);
            setProperties(propertiesData);
            setAnimals(animalsData);
        } catch (error) {
            message.error('Erro ao carregar dados');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            await api.deleteAnimalMovement(record.id);
            message.success('Movimentação excluída com sucesso!');
            loadData();
        } catch (error) {
            message.error('Erro ao excluir movimentação');
            console.error(error);
        }
    };

    const applyFilters = (values) => {
        let filtered = [...movements];

        if (values.property_id) {
            filtered = filtered.filter(m => m.property_id === values.property_id);
        }
        if (values.animal_id) {
            filtered = filtered.filter(m => m.animal_id === values.animal_id);
        }
        if (values.exit_reason) {
            filtered = filtered.filter(m => m.exit_reason === values.exit_reason);
        }

        setFilteredMovements(filtered);
    };

    const getAnimalName = (id) => {
        const animal = animals.find(a => a.id === id);
        return animal ? `${animal.earring_identification} - ${animal.name || 'Sem nome'}` : id;
    };

    const getExitReasonTag = (reason) => {
        const reasonMap = {
            'venda': { color: 'blue', text: 'Venda' },
            'morte': { color: 'red', text: 'Morte' },
            'roubo': { color: 'volcano', text: 'Roubo' },
            'alimentacao': { color: 'orange', text: 'Alimentação' },
            'emprestimo': { color: 'cyan', text: 'Empréstimo' },
        };
        const config = reasonMap[reason] || { color: 'default', text: reason };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Animal',
            dataIndex: 'animal_id',
            key: 'animal_id',
            render: (id) => getAnimalName(id),
        },
        {
            title: 'Data',
            dataIndex: 'movement_date',
            key: 'movement_date',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Peso (kg)',
            dataIndex: 'weight',
            key: 'weight',
            render: (weight) => weight ? weight.toFixed(2) : '-',
        },
        {
            title: 'Motivo da Saída',
            dataIndex: 'exit_reason',
            key: 'exit_reason',
            render: (reason) => getExitReasonTag(reason),
        },
        {
            title: 'Observações',
            dataIndex: 'observations',
            key: 'observations',
            render: (obs) => obs || '-',
            ellipsis: true,
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Visualizar">
                        <Button
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <Popconfirm
                            title="Tem certeza que deseja excluir esta movimentação?"
                            onConfirm={() => handleDelete(record)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button
                                shape="circle"
                                icon={<DeleteOutlined />}
                                type="primary"
                                danger
                                className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            <main style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                <Space direction="vertical" style={{width: '100%'}}>
                    <Breadcrumb
                        items={[
                            {
                                title: 'Controle Animal',
                            },
                            {
                                title: <strong>Movimentação Animal</strong>,
                            },
                        ]}
                    />
                    <Card title="Filtros">
                        <Form layout="vertical" onFinish={applyFilters}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item label="Fazenda" name="property_id">
                                        <Select placeholder="Selecione a fazenda">
                                            {properties.map(prop => (
                                                <Option key={prop.id} value={prop.id}>{prop.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Animal" name="animal_id">
                                        <Select placeholder="Selecione o animal" showSearch optionFilterProp="children">
                                            {animals.map(animal => (
                                                <Option key={animal.id} value={animal.id}>
                                                    {animal.earring_identification} - {animal.name || 'Sem nome'}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Motivo da Saída" name="exit_reason">
                                        <Select placeholder="Selecione o motivo">
                                            <Option value="venda">Venda</Option>
                                            <Option value="morte">Morte</Option>
                                            <Option value="roubo">Roubo</Option>
                                            <Option value="alimentacao">Alimentação</Option>
                                            <Option value="emprestimo">Empréstimo</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify="end">
                                <Button
                                    type="primary"
                                    htmlType="submit"
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
                                <h1>Movimentações de Animais</h1>
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
                            dataSource={filteredMovements} 
                            columns={columns} 
                            rowKey="id" 
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total de ${total} registros`,
                            }}
                        />
                    </Card>
                </Space>
            </main>
        </>
    );
}

export default AnimalMovimentationList;
