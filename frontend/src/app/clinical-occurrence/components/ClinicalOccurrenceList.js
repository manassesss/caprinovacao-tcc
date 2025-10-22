"use client";
import { Space, Tooltip, Button, Table, Card, Row, Tag, Breadcrumb, Col, Form, message, Popconfirm, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined }  from '@ant-design/icons';
import { FiFilter } from "react-icons/fi";
import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const ClinicalOccurrenceList = ({onEdit}) => {
    const [occurrences, setOccurrences] = useState([]);
    const [filteredOccurrences, setFilteredOccurrences] = useState([]);
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [illnesses, setIllnesses] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [occurrencesData, propertiesData, animalsData, illnessesData] = await Promise.all([
                api.getClinicalOccurrences(),
                api.getProperties(),
                api.getAnimals(),
                api.getIllnesses()
            ]);
            setOccurrences(occurrencesData);
            setFilteredOccurrences(occurrencesData);
            setProperties(propertiesData);
            setAnimals(animalsData);
            setIllnesses(illnessesData);
        } catch (error) {
            message.error('Erro ao carregar dados');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            await api.deleteClinicalOccurrence(record.id);
            message.success('Ocorrência clínica excluída com sucesso!');
            loadData();
        } catch (error) {
            message.error('Erro ao excluir ocorrência');
            console.error(error);
        }
    };

    const applyFilters = (values) => {
        let filtered = [...occurrences];

        if (values.property_id) {
            filtered = filtered.filter(o => o.property_id === values.property_id);
        }
        if (values.animal_id) {
            filtered = filtered.filter(o => o.animal_id === values.animal_id);
        }
        if (values.illness_id) {
            filtered = filtered.filter(o => o.illness_id === values.illness_id);
        }

        setFilteredOccurrences(filtered);
    };

    const getAnimalName = (id) => {
        const animal = animals.find(a => a.id === id);
        return animal ? `${animal.earring_identification} - ${animal.name || 'Sem nome'}` : id;
    };

    const getIllnessName = (id) => {
        const illness = illnesses.find(i => i.id === id);
        return illness ? illness.name : id;
    };

    const columns = [
        {
            title: 'Animal',
            dataIndex: 'animal_id',
            key: 'animal_id',
            render: (id) => getAnimalName(id),
        },
        {
            title: 'Doença',
            dataIndex: 'illness_id',
            key: 'illness_id',
            render: (id) => <Tag color="red">{getIllnessName(id)}</Tag>,
        },
        {
            title: 'Data da Ocorrência',
            dataIndex: 'occurrence_date',
            key: 'occurrence_date',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
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
                            title="Tem certeza que deseja excluir esta ocorrência?"
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
                                title: <strong>Ocorrências Clínicas</strong>,
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
                                    <Form.Item label="Doença" name="illness_id">
                                        <Select placeholder="Selecione a doença" showSearch optionFilterProp="children">
                                            {illnesses.map(illness => (
                                                <Option key={illness.id} value={illness.id}>{illness.name}</Option>
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
                                <h1>Ocorrências Clínicas</h1>
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
                            dataSource={filteredOccurrences} 
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

export default ClinicalOccurrenceList;
