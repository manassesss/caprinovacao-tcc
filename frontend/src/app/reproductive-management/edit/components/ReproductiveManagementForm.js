"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { AiOutlineLeft } from 'react-icons/ai';
import { Button, Card, Form, Input, Space, Row, Col, Select, DatePicker, InputNumber, message, Transfer, Tag } from 'antd';
import dayjs from 'dayjs';
import api from '@/services/api';

const { TextArea } = Input;
const { Option } = Select;

const ReproductiveManagementForm = ({ id }) => {
    const router = useRouter();
    const [form] = Form.useForm();
    const isEditing = !!id;
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState('save');
    
    // Dados
    const [properties, setProperties] = useState([]);
    const [herds, setHerds] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [offspring, setOffspring] = useState([]);
    const [selectedOffspring, setSelectedOffspring] = useState([]);
    
    // Controle de fazenda e parição
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [parturitionStatus, setParturitionStatus] = useState(null);

    useEffect(() => {
        loadInitialData();
        if (id) {
            setAction('edit');
            loadManagementData();
        }
    }, [id]);

    const loadInitialData = async () => {
        try {
            const [propsData, herdsData, animalsData] = await Promise.all([
                api.getProperties(),
                api.getHerds(),
                api.getAnimals()
            ]);
            setProperties(propsData);
            setHerds(herdsData);
            setAnimals(animalsData);
        } catch (error) {
            message.error('Erro ao carregar dados iniciais');
            console.error(error);
        }
    };

    const loadManagementData = async () => {
        try {
            const data = await api.getReproductiveManagement(id);
            
            // Definir a fazenda selecionada
            setSelectedProperty(data.property_id);
            setParturitionStatus(data.parturition_status);
            
            // Mapear dados
            form.setFieldsValue({
                property_id: data.property_id,
                herd_id: data.herd_id,
                dam_id: data.dam_id,
                coverage_date: data.coverage_date ? dayjs(data.coverage_date) : null,
                dam_weight: data.dam_weight,
                dam_body_condition_score: data.dam_body_condition_score,
                sire_id: data.sire_id,
                sire_scrotal_perimeter: data.sire_scrotal_perimeter,
                parturition_status: data.parturition_status,
                birth_date: data.birth_date ? dayjs(data.birth_date) : null,
                childbirth_type: data.childbirth_type,
                weaning_date: data.weaning_date ? dayjs(data.weaning_date) : null,
                observations: data.observations,
            });

            // Carregar filhos
            try {
                const offspringData = await api.getOffspring(id);
                setSelectedOffspring(offspringData.map(o => o.offspring_id));
            } catch (error) {
                console.log('Sem filhos cadastrados');
            }
        } catch (error) {
            message.error('Erro ao carregar dados do manejo reprodutivo');
            console.error(error);
        }
    };

    const handlePropertyChange = (propertyId) => {
        setSelectedProperty(propertyId);
        form.setFieldsValue({ herd_id: undefined });
    };

    const handleParturitionStatusChange = (value) => {
        setParturitionStatus(value);
        // Limpa campos de parto se mudar para não/em_andamento
        if (value === 'não' || value === 'em_andamento') {
            form.setFieldsValue({
                birth_date: undefined,
                childbirth_type: undefined,
                weaning_date: undefined,
            });
            setSelectedOffspring([]);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        let hasErrors = false;

        try {
            const managementData = {
                property_id: values.property_id,
                herd_id: values.herd_id,
                dam_id: values.dam_id,
                coverage_date: values.coverage_date ? values.coverage_date.format('YYYY-MM-DD') : null,
                dam_weight: values.dam_weight,
                dam_body_condition_score: values.dam_body_condition_score,
                sire_id: values.sire_id,
                sire_scrotal_perimeter: values.sire_scrotal_perimeter,
                parturition_status: values.parturition_status,
                birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
                childbirth_type: values.childbirth_type,
                weaning_date: values.weaning_date ? values.weaning_date.format('YYYY-MM-DD') : null,
                observations: values.observations,
            };

            let managementId = id;

            if (isEditing) {
                await api.updateReproductiveManagement(id, managementData);
                message.success('✅ Manejo reprodutivo atualizado com sucesso!');
            } else {
                const newManagement = await api.createReproductiveManagement(managementData);
                managementId = newManagement.id;
                message.success('✅ Manejo reprodutivo cadastrado com sucesso!');
            }

            // Salvar filhos (se parição = sim)
            if (values.parturition_status === 'sim' && selectedOffspring.length > 0) {
                try {
                    // Remover filhos anteriores e adicionar novos
                    for (const offspringId of selectedOffspring) {
                        await api.addOffspring(managementId, { offspring_id: offspringId });
                    }
                    message.success('✅ Filhos vinculados com sucesso!');
                } catch (error) {
                    hasErrors = true;
                    console.error('❌ Erro ao vincular filhos:', error);
                    message.error('❌ ERRO ao vincular filhos: ' + (error.message || 'Erro desconhecido'));
                }
            }

            // Redirecionar apenas se não houver erros
            if (!hasErrors) {
                message.success('🎉 Todos os dados salvos com sucesso!');
                router.push('/reproductive-management');
            } else {
                message.warning('⚠️ Manejo salvo, mas houve erro ao vincular filhos');
            }
        } catch (error) {
            message.error('❌ ERRO: ' + (error.message || 'Erro ao salvar'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Preparar lista de animais para Transfer (filhos)
    const animalsList = animals.map(animal => ({
        key: animal.id,
        title: `${animal.earring_identification} - ${animal.name || 'Sem nome'}`,
        description: `${animal.gender === 'M' ? 'Macho' : 'Fêmea'} - ${animal.category}`,
    }));

    const isParturitionBlocked = parturitionStatus === 'não' || parturitionStatus === 'em_andamento';

    return (
        <>
            <main style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                <Space direction="vertical" style={{width: '100%'}}>
                    <Card
                        title={
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <div style={{cursor: 'pointer'}}>
                                    <AiOutlineLeft onClick={() => router.push('/reproductive-management')} />
                                </div>
                                <div>
                                    {action === 'save' ? 'Adicionar' : 'Editar'} Manejo Reprodutivo
                                </div>
                                <div></div>
                            </div>
                        }
                    >
                        <Form form={form} onFinish={onFinish} layout="vertical">
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Fazenda:"
                                        name="property_id"
                                        rules={[{ required: true, message: 'Selecione a fazenda' }]}
                                    >
                                        <Select 
                                            placeholder="Selecione a fazenda" 
                                            size="large"
                                            onChange={handlePropertyChange}
                                        >
                                            {properties.map(prop => (
                                                <Option key={prop.id} value={prop.id}>{prop.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Rebanho (Opcional):"
                                        name="herd_id"
                                    >
                                        <Select 
                                            placeholder={selectedProperty ? "Selecione o rebanho" : "Selecione a fazenda primeiro"}
                                            size="large"
                                            disabled={!selectedProperty}
                                        >
                                            {herds
                                                .filter(herd => !selectedProperty || herd.property_id === selectedProperty)
                                                .map(herd => (
                                                    <Option key={herd.id} value={herd.id}>{herd.name}</Option>
                                                ))
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Matriz (Fêmea):"
                                        name="dam_id"
                                        rules={[{ required: true, message: 'Selecione a matriz' }]}
                                    >
                                        <Select placeholder="Selecione a matriz" size="large" showSearch optionFilterProp="children">
                                            {animals.filter(a => a.gender === 'F').map(animal => (
                                                <Option key={animal.id} value={animal.id}>
                                                    {animal.earring_identification} - {animal.name || 'Sem nome'}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Data da Cobertura:"
                                        name="coverage_date"
                                        rules={[{ required: true, message: 'Informe a data da cobertura' }]}
                                    >
                                        <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Peso da Matriz (kg):"
                                        name="dam_weight"
                                        rules={[{ required: true, message: 'Informe o peso da matriz' }]}
                                    >
                                        <InputNumber style={{width: '100%'}} min={0} step={0.1} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="ECC da Matriz (1-5):"
                                        name="dam_body_condition_score"
                                        rules={[{ required: true, message: 'Informe o ECC da matriz' }]}
                                    >
                                        <InputNumber style={{width: '100%'}} min={1} max={5} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Reprodutor (Macho):"
                                        name="sire_id"
                                        rules={[{ required: true, message: 'Selecione o reprodutor' }]}
                                    >
                                        <Select placeholder="Selecione o reprodutor" size="large" showSearch optionFilterProp="children">
                                            {animals.filter(a => a.gender === 'M').map(animal => (
                                                <Option key={animal.id} value={animal.id}>
                                                    {animal.earring_identification} - {animal.name || 'Sem nome'}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Perímetro Escrotal (cm):"
                                        name="sire_scrotal_perimeter"
                                    >
                                        <InputNumber style={{width: '100%'}} min={0} step={0.1} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Parição:"
                                        name="parturition_status"
                                        rules={[{ required: true, message: 'Selecione o status de parição' }]}
                                    >
                                        <Select 
                                            placeholder="Selecione o status" 
                                            size="large"
                                            onChange={handleParturitionStatusChange}
                                        >
                                            <Option value="sim">Sim</Option>
                                            <Option value="não">Não</Option>
                                            <Option value="em_andamento">Em Andamento</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Campos de Parto - Bloqueados se parição = não/em_andamento */}
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Data do Parto:"
                                        name="birth_date"
                                        tooltip={isParturitionBlocked ? "Disponível apenas se Parição = Sim" : ""}
                                    >
                                        <DatePicker 
                                            style={{width: '100%'}} 
                                            format="DD/MM/YYYY" 
                                            size="large"
                                            disabled={isParturitionBlocked}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Tipo de Parto:"
                                        name="childbirth_type"
                                        tooltip={isParturitionBlocked ? "Disponível apenas se Parição = Sim" : ""}
                                    >
                                        <Select 
                                            placeholder="Selecione o tipo" 
                                            size="large"
                                            disabled={isParturitionBlocked}
                                        >
                                            <Option value="simples">Simples</Option>
                                            <Option value="duplo">Duplo</Option>
                                            <Option value="triplo">Triplo</Option>
                                            <Option value="quadruplo">Quádruplo</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Data do Desmame:"
                                        name="weaning_date"
                                        tooltip={isParturitionBlocked ? "Disponível apenas se Parição = Sim" : ""}
                                    >
                                        <DatePicker 
                                            style={{width: '100%'}} 
                                            format="DD/MM/YYYY" 
                                            size="large"
                                            disabled={isParturitionBlocked}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Filhos - Bloqueados se parição = não/em_andamento */}
                            {parturitionStatus === 'sim' && (
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item
                                            label="Filhos (Selecione os filhotes gerados):"
                                            tooltip="Selecione os animais que nasceram desta cobertura"
                                        >
                                            <Transfer
                                                dataSource={animalsList}
                                                titles={['Disponíveis', 'Filhos desta cobertura']}
                                                targetKeys={selectedOffspring}
                                                onChange={setSelectedOffspring}
                                                render={item => item.title}
                                                listStyle={{
                                                    width: '45%',
                                                    height: 300,
                                                }}
                                                showSearch
                                                filterOption={(inputValue, item) =>
                                                    item.title.toLowerCase().includes(inputValue.toLowerCase())
                                                }
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )}

                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        label="Observações:"
                                        name="observations"
                                    >
                                        <TextArea rows={4} placeholder="Observações sobre o manejo reprodutivo" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Space>
                                    <Button onClick={() => router.push('/reproductive-management')}>
                                        Cancelar
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Salvar
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </Space>
            </main>
        </>
    );
}

export default ReproductiveManagementForm;
