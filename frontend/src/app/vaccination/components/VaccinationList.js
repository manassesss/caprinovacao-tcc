"use client";
import { Space, Tooltip, Button, Table, Card, Row, Tag, Breadcrumb, Col, Form, message, Popconfirm, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined }  from '@ant-design/icons';
import { FiFilter } from "react-icons/fi";
import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const VaccinationList = ({onEdit}) => {
    const [vaccinations, setVaccinations] = useState([]);
    const [filteredVaccinations, setFilteredVaccinations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [herds, setHerds] = useState([]);
    const [medicines, setMedicines] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vaccinationsData, propertiesData, herdsData, medicinesData] = await Promise.all([
                api.getVaccinations(),
                api.getProperties(),
                api.getHerds(),
                api.getMedicines()
            ]);
            setVaccinations(vaccinationsData);
            setFilteredVaccinations(vaccinationsData);
            setProperties(propertiesData);
            setHerds(herdsData);
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
            await api.deleteVaccination(record.id);
            message.success('Vacinação excluída com sucesso!');
            loadData();
        } catch (error) {
            message.error('Erro ao excluir vacinação');
            console.error(error);
        }
    };

    const applyFilters = (values) => {
        let filtered = [...vaccinations];

        if (values.property_id) {
            filtered = filtered.filter(v => v.property_id === values.property_id);
        }
        if (values.herd_id) {
            filtered = filtered.filter(v => v.herd_id === values.herd_id);
        }
        if (values.medicine_id) {
            filtered = filtered.filter(v => v.medicine_id === values.medicine_id);
        }
        if (values.is_batch !== undefined) {
            filtered = filtered.filter(v => v.is_batch === (values.is_batch === 'true'));
        }

        setFilteredVaccinations(filtered);
    };

    const getMedicineName = (id) => {
        const medicine = medicines.find(m => m.id === id);
        return medicine ? medicine.name : id;
    };

    const getHerdName = (id) => {
        if (!id) return '-';
        const herd = herds.find(h => h.id === id);
        return herd ? herd.name : id;
    };

    const columns = [
        {
            title: 'Data',
            dataIndex: 'vaccination_date',
            key: 'vaccination_date',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Medicamento (Vacina)',
            dataIndex: 'medicine_id',
            key: 'medicine_id',
            render: (id) => <Tag color="blue">{getMedicineName(id)}</Tag>,
        },
        {
            title: 'Rebanho',
            dataIndex: 'herd_id',
            key: 'herd_id',
            render: (id) => getHerdName(id),
        },
        {
            title: 'Tipo',
            dataIndex: 'is_batch',
            key: 'is_batch',
            render: (isBatch) => isBatch ? 
                <Tag color="green">Em Lote</Tag> : 
                <Tag color="orange">Individual</Tag>,
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
                            title="Tem certeza que deseja excluir esta vacinação?"
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
                                title: <strong>Vacinação</strong>,
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
                                    <Form.Item label="Vacina" name="medicine_id">
                                        <Select placeholder="Selecione a vacina" showSearch optionFilterProp="children">
                                            {medicines.map(medicine => (
                                                <Option key={medicine.id} value={medicine.id}>{medicine.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Tipo" name="is_batch">
                                        <Select placeholder="Selecione o tipo">
                                            <Option value="true">Em Lote</Option>
                                            <Option value="false">Individual</Option>
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
                                <h1>Vacinações</h1>
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
                            dataSource={filteredVaccinations} 
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

export default VaccinationList;

