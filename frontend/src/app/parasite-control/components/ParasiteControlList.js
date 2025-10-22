"use client";
import { Space, Tooltip, Button, Table, Card, Row, Tag, Breadcrumb, Col, Form, message, Popconfirm, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined }  from '@ant-design/icons';
import { FiFilter } from "react-icons/fi";
import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const ParasiteControlList = ({onEdit}) => {
    const [controls, setControls] = useState([]);
    const [filteredControls, setFilteredControls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [medicines, setMedicines] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [controlsData, propertiesData, animalsData, medicinesData] = await Promise.all([
                api.getParasiteControls(),
                api.getProperties(),
                api.getAnimals(),
                api.getMedicines()
            ]);
            setControls(controlsData);
            setFilteredControls(controlsData);
            setProperties(propertiesData);
            setAnimals(animalsData);
            setMedicines(medicinesData);
        } catch (error) {
            message.error('Erro ao carregar dados');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            await api.deleteParasiteControl(record.id);
            message.success('Controle parasitário excluído com sucesso!');
            loadData();
        } catch (error) {
            message.error('Erro ao excluir controle');
            console.error(error);
        }
    };

    const applyFilters = (values) => {
        let filtered = [...controls];

        if (values.property_id) {
            filtered = filtered.filter(c => c.property_id === values.property_id);
        }
        if (values.animal_id) {
            filtered = filtered.filter(c => c.animal_id === values.animal_id);
        }
        if (values.medicine_id) {
            filtered = filtered.filter(c => c.medicine_id === values.medicine_id);
        }

        setFilteredControls(filtered);
    };

    const getAnimalName = (id) => {
        const animal = animals.find(a => a.id === id);
        return animal ? `${animal.earring_identification} - ${animal.name || 'Sem nome'}` : id;
    };

    const getMedicineName = (id) => {
        const medicine = medicines.find(m => m.id === id);
        return medicine ? medicine.name : id;
    };

    const getFamachaColor = (value) => {
        if (!value) return 'default';
        if (value <= 2) return 'green';
        if (value === 3) return 'yellow';
        return 'red';
    };

    const columns = [
        {
            title: 'Animal',
            dataIndex: 'animal_id',
            key: 'animal_id',
            render: (id) => getAnimalName(id),
        },
        {
            title: 'Medicamento',
            dataIndex: 'medicine_id',
            key: 'medicine_id',
            render: (id) => getMedicineName(id),
        },
        {
            title: 'Data',
            dataIndex: 'application_date',
            key: 'application_date',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'OPG Pré',
            dataIndex: 'opg_pre',
            key: 'opg_pre',
            render: (value) => value || '-',
        },
        {
            title: 'OPG Pós',
            dataIndex: 'opg_post',
            key: 'opg_post',
            render: (value) => value || '-',
        },
        {
            title: 'FAMACHA',
            dataIndex: 'famacha',
            key: 'famacha',
            render: (value) => value ? <Tag color={getFamachaColor(value)}>{value}</Tag> : '-',
        },
        {
            title: 'ECC',
            dataIndex: 'ecc',
            key: 'ecc',
            render: (value) => value || '-',
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
                            title="Tem certeza que deseja excluir este controle?"
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
                                title: <strong>Controle Parasitário</strong>,
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
                                    <Form.Item label="Medicamento" name="medicine_id">
                                        <Select placeholder="Selecione o medicamento" showSearch optionFilterProp="children">
                                            {medicines.map(medicine => (
                                                <Option key={medicine.id} value={medicine.id}>{medicine.name}</Option>
                                            ))}
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
                                <h1>Controles Parasitários</h1>
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
                            dataSource={filteredControls} 
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

export default ParasiteControlList;
