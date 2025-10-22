"use client";
import { Space, Tooltip, Button, Table, Card, Input, Row, Tag, Breadcrumb, Col, Form, DatePicker, message, Popconfirm, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined }  from '@ant-design/icons';
import { FiFilter } from "react-icons/fi";
import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const ReproductiveManagementList = ({onEdit}) => {
    const [managements, setManagements] = useState([]);
    const [filteredManagements, setFilteredManagements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [herds, setHerds] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [managementsData, propertiesData, herdsData, animalsData] = await Promise.all([
                api.getReproductiveManagements(),
                api.getProperties(),
                api.getHerds(),
                api.getAnimals()
            ]);
            setManagements(managementsData);
            setFilteredManagements(managementsData);
            setProperties(propertiesData);
            setHerds(herdsData);
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
            await api.deleteReproductiveManagement(record.id);
            message.success('Manejo reprodutivo excluído com sucesso!');
            loadData();
        } catch (error) {
            message.error('Erro ao excluir manejo reprodutivo');
            console.error(error);
        }
    };

    const applyFilters = (values) => {
        setFilters(values);
        let filtered = [...managements];

        if (values.property_id) {
            filtered = filtered.filter(m => m.property_id === values.property_id);
        }
        if (values.herd_id) {
            filtered = filtered.filter(m => m.herd_id === values.herd_id);
        }
        if (values.dam_id) {
            filtered = filtered.filter(m => m.dam_id === values.dam_id);
        }
        if (values.sire_id) {
            filtered = filtered.filter(m => m.sire_id === values.sire_id);
        }
        if (values.parturition_status) {
            filtered = filtered.filter(m => m.parturition_status === values.parturition_status);
        }

        setFilteredManagements(filtered);
    };

    const getAnimalName = (id) => {
        const animal = animals.find(a => a.id === id);
        return animal ? `${animal.earring_identification} - ${animal.name || 'Sem nome'}` : id;
    };

    const getHerdName = (id) => {
        const herd = herds.find(h => h.id === id);
        return herd ? herd.name : '-';
    };

    const getParturitionStatusTag = (status) => {
        const statusMap = {
            'sim': { color: 'green', text: 'Sim' },
            'não': { color: 'red', text: 'Não' },
            'em_andamento': { color: 'orange', text: 'Em Andamento' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Rebanho',
            dataIndex: 'herd_id',
            key: 'herd_id',
            render: (id) => getHerdName(id),
        },
        {
            title: 'Matriz',
            dataIndex: 'dam_id',
            key: 'dam_id',
            render: (id) => getAnimalName(id),
        },
        {
            title: 'Reprodutor',
            dataIndex: 'sire_id',
            key: 'sire_id',
            render: (id) => getAnimalName(id),
        },
        {
            title: 'Data da Cobertura',
            dataIndex: 'coverage_date',
            key: 'coverage_date',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Parição',
            dataIndex: 'parturition_status',
            key: 'parturition_status',
            render: (status) => getParturitionStatusTag(status),
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
                        <Popconfirm
                            title="Tem certeza que deseja excluir este manejo reprodutivo?"
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
                                title: <strong>Manejo Reprodutivo</strong>,
                            },
                        ]}
                    />
                    <Card title="Filtros">
                        <Form layout="vertical" onFinish={applyFilters}>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item label="Fazenda" name="property_id">
                                        <Select placeholder="Selecione a fazenda">
                                            {properties.map(prop => (
                                                <Option key={prop.id} value={prop.id}>{prop.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Rebanho" name="herd_id">
                                        <Select placeholder="Selecione o rebanho">
                                            {herds.map(herd => (
                                                <Option key={herd.id} value={herd.id}>{herd.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Matriz" name="dam_id">
                                        <Select placeholder="Selecione a matriz" showSearch optionFilterProp="children">
                                            {animals.filter(a => a.gender === 'F').map(animal => (
                                                <Option key={animal.id} value={animal.id}>
                                                    {animal.earring_identification} - {animal.name || 'Sem nome'}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Reprodutor" name="sire_id">
                                        <Select placeholder="Selecione o reprodutor" showSearch optionFilterProp="children">
                                            {animals.filter(a => a.gender === 'M').map(animal => (
                                                <Option key={animal.id} value={animal.id}>
                                                    {animal.earring_identification} - {animal.name || 'Sem nome'}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Status de Parição" name="parturition_status">
                                        <Select placeholder="Selecione o status">
                                            <Option value="sim">Sim</Option>
                                            <Option value="não">Não</Option>
                                            <Option value="em_andamento">Em Andamento</Option>
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
                                <h1>Manejos Reprodutivos</h1>
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
                            dataSource={filteredManagements} 
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

export default ReproductiveManagementList;
