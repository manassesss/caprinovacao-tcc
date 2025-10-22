"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { AiOutlineLeft } from 'react-icons/ai';
import { Button, Card, Form, Input, Space, Row, Col, Select, Collapse, DatePicker, InputNumber, message } from 'antd';
import dayjs from 'dayjs';
import api from '@/services/api';

const { Panel } = Collapse;
const { Option } = Select;

const AnimalsForm = ({ id }) => {
    const router = useRouter();
    const [dataIsLoaded, setDataIsLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState('save');
    const [properties, setProperties] = useState([]);
    const [herds, setHerds] = useState([]);
    const [races, setRaces] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [form] = Form.useForm();
    const isEditing = !!id;

    useEffect(() => {
        loadInitialData();
        if (id) {
            setAction('edit');
            loadAnimalData();
        }
    }, [id]);

    const loadInitialData = async () => {
        try {
            const [propertiesData, herdsData, racesData, animalsData] = await Promise.all([
                api.getProperties(),
                api.getHerds(),
                api.getRaces(),
                api.getAnimals()
            ]);
            setProperties(propertiesData);
            setHerds(herdsData);
            setRaces(racesData);
            setAnimals(animalsData);
            setDataIsLoaded(true);
        } catch (error) {
            message.error('Erro ao carregar dados iniciais');
            console.error(error);
        }
    };

    const loadAnimalData = async () => {
        try {
            const data = await api.getAnimal(id);
            
            // Definir a fazenda selecionada
            setSelectedProperty(data.property_id);
            
            // Mapear dados do backend para os campos do formulário
            form.setFieldsValue({
                property_id: data.property_id,
                name: data.earring_identification,
                flock_id: data.herd_id,
                cd_childbirth: data.birth_date ? dayjs(data.birth_date) : null,
                genre: data.gender,
                cd_purpouse: data.objective,
                cd_entry_reason: data.entry_reason,
                cd_type_childbirth: data.childbirth_type,
                dt_weaning: data.weaning_date ? dayjs(data.weaning_date) : null,
                race_id: data.race_id,
                cd_mom: data.mother_id,
                cd_dad: data.father_id,
                cd_genetic_composition: data.genetic_composition,
                cd_category: data.category,
                cd_degree_of_testicular_partition: data.testicular_degree,
                cd_ear_position: data.ear_position,
            });

            // Carregar medições (desenvolvimento ponderal)
            try {
                const weights = await api.getAnimalWeights(id);
                if (weights && weights.length > 0) {
                    const lastWeight = weights[weights.length - 1];
                    form.setFieldsValue({
                        cd_period: lastWeight.measurement_period,
                        weigth: lastWeight.weight,
                        nr_ecc: lastWeight.body_condition_score,  // body_condition_score → ecc
                        nr_c: lastWeight.conformation,
                        nr_p: lastWeight.precocity,
                        nr_m: lastWeight.musculature,
                    });
                }
            } catch (error) {
                console.log('Sem dados de peso');
            }

            // Carregar verminose
            try {
                const parasites = await api.getAnimalParasites(id);
                if (parasites && parasites.length > 0) {
                    const lastParasite = parasites[parasites.length - 1];
                    form.setFieldsValue({
                        nr_opg: lastParasite.opg,
                        farmhouse: lastParasite.famacha,
                    });
                }
            } catch (error) {
                console.log('Sem dados de verminose');
            }

            // Carregar medidas corporais
            try {
                const bodyMeasurements = await api.getAnimalBodyMeasurements(id);
                if (bodyMeasurements && bodyMeasurements.length > 0) {
                    const lastMeasurement = bodyMeasurements[bodyMeasurements.length - 1];
                    form.setFieldsValue({
                        height_ac: lastMeasurement.ac,
                        height_ag: lastMeasurement.ag,
                        height_ap: lastMeasurement.ap,
                        length_cc: lastMeasurement.cc,
                        perimeter_pc: lastMeasurement.pc,
                        perimeter_perpe: lastMeasurement.perpe,
                        length_cpern: lastMeasurement.cpern,
                        length_co: lastMeasurement.co,
                        circumference_ct: lastMeasurement.ct,
                        longitude_lr: lastMeasurement.lr,
                        length_ccab: lastMeasurement.ccab,
                        width_lil: lastMeasurement.lil,
                        width_lis: lastMeasurement.lis,
                        length_ccau: lastMeasurement.ccau,
                        length_cga: lastMeasurement.cga,
                        perimeter_pcau: lastMeasurement.pcau,
                    });
                }
            } catch (error) {
                console.log('Sem dados de medidas corporais');
            }

            // Carregar carcaça
            try {
                const carcassMeasurements = await api.getAnimalCarcassMeasurements(id);
                if (carcassMeasurements && carcassMeasurements.length > 0) {
                    const lastCarcass = carcassMeasurements[carcassMeasurements.length - 1];
                    form.setFieldsValue({
                        nr_aol: lastCarcass.aol,
                        nr_col: lastCarcass.col,
                        nr_pol: lastCarcass.pol,
                        nr_mol: lastCarcass.mol,
                        nr_egs: lastCarcass.egs,
                        nr_egbf: lastCarcass.egbf,
                        nr_ege: lastCarcass.ege,
                    });
                }
            } catch (error) {
                console.log('Sem dados de carcaça');
            }
        } catch (error) {
            message.error('Erro ao carregar dados do animal');
            console.error(error);
        }
    };

    const handlePropertyChange = (propertyId) => {
        setSelectedProperty(propertyId);
        // Limpar o campo de rebanho quando mudar de fazenda
        form.setFieldsValue({ flock_id: undefined });
    };

    const onFinish = async (values) => {
        setLoading(true);
        let hasErrors = false;
        let animalId = id;

        try {
            // Dados básicos do animal
            const animalData = {
                property_id: values.property_id,
                herd_id: values.flock_id,
                race_id: values.race_id,
                earring_identification: values.name,
                name: values.name,
                birth_date: values.cd_childbirth ? values.cd_childbirth.format('YYYY-MM-DD') : null,
                gender: values.genre,
                objective: values.cd_purpouse,
                entry_reason: values.cd_entry_reason,
                category: values.cd_category,
                childbirth_type: values.cd_type_childbirth,
                weaning_date: values.dt_weaning ? values.dt_weaning.format('YYYY-MM-DD') : null,
                father_id: values.cd_dad,
                mother_id: values.cd_mom,
                genetic_composition: values.cd_genetic_composition,
                testicular_degree: values.cd_degree_of_testicular_partition,
                ear_position: values.cd_ear_position,
                status: 'ativo',
            };
            
            // Tenta salvar o animal principal
            if (isEditing) {
                await api.updateAnimal(id, animalData);
                message.success('✅ Animal atualizado com sucesso!');
            } else {
                const newAnimal = await api.createAnimal(animalData);
                animalId = newAnimal.id;
                message.success('✅ Animal cadastrado com sucesso!');
            }

            // Salvar desenvolvimento ponderal (se preenchido)
            if (values.weigth || values.nr_ecc || values.nr_c || values.nr_p || values.nr_m) {
                try {
                    console.log('Salvando desenvolvimento ponderal...', animalId);
                    await api.createAnimalWeight(animalId, {
                        measurement_period: values.cd_period || 'outros',
                        weight: values.weigth || null,
                        body_condition_score: values.nr_ecc || null,  // ECC → body_condition_score
                        conformation: values.nr_c || null,
                        precocity: values.nr_p || null,
                        musculature: values.nr_m || null,
                    });
                    console.log('✅ Desenvolvimento ponderal salvo com sucesso!');
                    message.success('✅ Desenvolvimento ponderal salvo!');
                } catch (error) {
                    hasErrors = true;
                    console.error('❌ Erro ao salvar desenvolvimento ponderal:', error);
                    message.error('❌ ERRO - Desenvolvimento Ponderal: ' + (error.message || 'Erro desconhecido'));
                }
            }

            // Salvar verminose (se preenchido)
            if (values.nr_opg || values.farmhouse) {
                try {
                    console.log('Salvando verminose...', animalId);
                    await api.createAnimalParasite(animalId, {
                        opg: values.nr_opg || null,
                        famacha: values.farmhouse ? parseInt(values.farmhouse) : null,  // Converter para int
                    });
                    console.log('✅ Verminose salva com sucesso!');
                    message.success('✅ Verminose salva!');
                } catch (error) {
                    hasErrors = true;
                    console.error('❌ Erro ao salvar verminose:', error);
                    message.error('❌ ERRO - Verminose: ' + (error.message || 'Erro desconhecido'));
                }
            }

            // Salvar medidas corporais (se preenchido)
            if (values.height_ag || values.height_ac || values.height_ap || values.length_cc) {
                try {
                    console.log('Salvando medidas corporais...', animalId);
                    await api.createAnimalBodyMeasurement(animalId, {
                        ag: values.height_ag || null,
                        ac: values.height_ac || null,
                        ap: values.height_ap || null,
                        cc: values.length_cc || null,
                        pc: values.perimeter_pc || null,
                        perpe: values.perimeter_perpe || null,
                        cpern: values.length_cpern || null,
                        co: values.length_co || null,
                        ct: values.circumference_ct || null,
                        lr: values.longitude_lr || null,
                        ccab: values.length_ccab || null,
                        lil: values.width_lil || null,
                        lis: values.width_lis || null,
                        ccau: values.length_ccau || null,
                        cga: values.length_cga || null,
                        pcau: values.perimeter_pcau || null,
                    });
                    console.log('✅ Medidas corporais salvas com sucesso!');
                    message.success('✅ Medidas corporais salvas!');
                } catch (error) {
                    hasErrors = true;
                    console.error('❌ Erro ao salvar medidas corporais:', error);
                    message.error('❌ ERRO - Medidas Corporais: ' + (error.message || 'Erro desconhecido'));
                }
            }

            // Salvar carcaça (se preenchido)
            if (values.nr_aol || values.nr_col || values.nr_pol || values.nr_mol) {
                try {
                    console.log('Salvando carcaça...', animalId);
                    await api.createAnimalCarcassMeasurement(animalId, {
                        aol: values.nr_aol || null,
                        col: values.nr_col || null,
                        pol: values.nr_pol || null,
                        mol: values.nr_mol || null,
                        egs: values.nr_egs || null,
                        egbf: values.nr_egbf || null,
                        ege: values.nr_ege || null,
                    });
                    console.log('✅ Carcaça salva com sucesso!');
                    message.success('✅ Carcaça salva!');
                } catch (error) {
                    hasErrors = true;
                    console.error('❌ Erro ao salvar carcaça:', error);
                    message.error('❌ ERRO - Carcaça: ' + (error.message || 'Erro desconhecido'));
                }
            }
            
            // Só redireciona se NÃO houver erros
            if (!hasErrors) {
                message.success('🎉 Todos os dados salvos com sucesso!');
                router.push('/animals');
            } else {
                message.warning('⚠️ Animal salvo, mas algumas medições falharam. Revise os erros acima.');
                console.warn('⚠️ Salvamento concluído com erros. Animal ID:', animalId);
            }
        } catch (error) {
            hasErrors = true;
            message.error('❌ ERRO AO SALVAR ANIMAL: ' + (error.message || 'Erro desconhecido'));
            console.error('❌ Erro ao salvar animal:', error);
            // NÃO redireciona - permanece no formulário
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <main style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                <Space direction="vertical" style={{width: '100%'}}>
                    <Card
                    title={
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <div style={{cursor: 'pointer'}}>
                                <AiOutlineLeft onClick={() => router.push('/animals')} />
                            </div>
                            <div>
                                {action === 'save' ? 'Adicionar' : 'Editar'} Animal
                            </div>
                        <div></div>
                        </div>
                    }
                    >
                    <Form form={form} onFinish={onFinish} layout="vertical">
                        <Row gutter={16}>
                            <Col span={6}>
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
                            <Col span={6}>
                                <Form.Item
                                    label="Nome / Número:"
                                    name="name"
                                    rules={[{ required: true, message: 'Insira o nome ou número' }]}
                                >
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Rebanho:"
                                    name="flock_id"
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
                            <Col span={6}>
                                <Form.Item
                                    label="Data de nascimento:"
                                    name="cd_childbirth"
                                    rules={[{ required: true, message: 'Insira a data de nascimento' }]}
                                >
                                    <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Sexo:"
                                    name="genre"
                                    rules={[{ required: true, message: 'Selecione o sexo' }]}
                                >
                                    <Select size="large">
                                        <Option value="M">Macho</Option>
                                        <Option value="F">Fêmea</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Finalidade:"
                                    name="cd_purpouse"
                                    rules={[{ required: true, message: 'Insira a finalidade' }]}
                                >
                                    <Select size="large">
                                        <Option value="producao">Produção</Option>
                                        <Option value="reproducao">Reprodução</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Motivo de Entrada:"
                                    name="cd_entry_reason"
                                    rules={[{ required: true, message: 'Insira o motivo de entrada' }]}
                                >
                                    <Select size="large">
                                        <Option value="compra">Compra</Option>
                                        <Option value="nascimento">Nascimento</Option>
                                        <Option value="emprestimo">Empréstimo</Option>
                                        <Option value="outros">Outros</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Tipo de Parto:"
                                    name="cd_type_childbirth"
                                    rules={[{ required: true, message: 'Insira o tipo de parto' }]}
                                >
                                    <Select size="large">
                                        <Option value="simples">Simples</Option>
                                        <Option value="duplo">Duplo</Option>
                                        <Option value="triplo">Triplo</Option>
                                        <Option value="quadruplo">Quádruplo</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Data de desmame:"
                                    name="dt_weaning"
                                >
                                    <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Raça:"
                                    name="race_id"
                                    rules={[{ required: true, message: 'Selecione a raça' }]}
                                >
                                    <Select placeholder="Selecione a raça" size="large" showSearch optionFilterProp="children">
                                        {races.map(race => (
                                            <Option key={race.id} value={race.id}>{race.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Mãe:"
                                    name="cd_mom"
                                >
                                    <Select placeholder="Selecione a mãe" size="large" showSearch optionFilterProp="children">
                                        {animals.filter(a => a.gender === 'F').map(animal => (
                                            <Option key={animal.id} value={animal.id}>
                                                {animal.earring_identification} - {animal.name || 'Sem nome'}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Pai:"
                                    name="cd_dad"
                                >
                                    <Select placeholder="Selecione o pai" size="large" showSearch optionFilterProp="children">
                                        {animals.filter(a => a.gender === 'M').map(animal => (
                                            <Option key={animal.id} value={animal.id}>
                                                {animal.earring_identification} - {animal.name || 'Sem nome'}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Composição genética:"
                                    name="cd_genetic_composition"
                                    rules={[{ required: true, message: 'Insira a composição genética' }]}
                                >
                                    <Select size="large">
                                        <Option value="PO">Puro de Origem (PO)</Option>
                                        <Option value="PC">Puro por Cruza (PC)</Option>
                                        <Option value="mestiço">Mestiço</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Categoria:"
                                    name="cd_category"
                                    rules={[{ required: true, message: 'Insira a categoria' }]}
                                >
                                    <Select size="large">
                                        <Option value="cabrito">Cabrito</Option>
                                        <Option value="borrego">Borrego</Option>
                                        <Option value="marrao">Marrão</Option>
                                        <Option value="matriz">Matriz</Option>
                                        <Option value="reprodutor">Reprodutor</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Grau de partição testicular:"
                                    name="cd_degree_of_testicular_partition"
                                >
                                    <Select size="large">
                                        <Option value="normal">Normal</Option>
                                        <Option value="criptorquidia">Criptorquidia</Option>
                                        <Option value="monorquidia">Monorquidia</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Posição da Orelha:"
                                    name="cd_ear_position"
                                >
                                    <Select size="large">
                                        <Option value="ereta">Ereta</Option>
                                        <Option value="semi-pendente">Semi-pendente</Option>
                                        <Option value="pendente">Pendente</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16} >
                            <Col span={24}>
                                <Collapse defaultActiveKey={['1', '2', '3', '4']} style={{marginBottom: '15px'}}>
                                    <Panel header='Desenvolvimento Ponderal' key='1'>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Data de mensuração:"
                                                    name="dt_measurement"
                                                >
                                                    <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Período:"
                                                    name="cd_period"
                                                >
                                                    <Select>
                                                        <Option value="ao_nascer">Ao Nascer</Option>
                                                        <Option value="desmame">Desmame</Option>
                                                        <Option value="outros">Outros</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Peso:"
                                                    name="weigth"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Escore de condição corporal (ECC):"
                                                    name="nr_ecc"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Conformação (C):"
                                                    name="nr_c"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Precocidade (P):"
                                                    name="nr_p"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Muscolosidade (M):"
                                                    name="nr_m"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Panel>
                                    <Panel header='Verminose' key='2'>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Data de mensuração:"
                                                    name="dt_measurement_verminose"
                                                >
                                                    <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Ovos por grama de fezes (OPG):"
                                                    name="nr_opg"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="FAMACHA:"
                                                    name="farmhouse"
                                                >
                                                    <Select>
                                                        <Option value="1">1</Option>
                                                        <Option value="2">2</Option>
                                                        <Option value="3">3</Option>
                                                        <Option value="4">4</Option>
                                                        <Option value="5">5</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Panel>
                                    <Panel header='Tamanho Corporal' key='3'>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Data de mensuração:"
                                                    name="dt_measurement_body"
                                                >
                                                    <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Altura de cernelha (AC):"
                                                    name="height_ac"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Altura da garupa (AG):"
                                                    name="height_ag"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento corporal (CC):"
                                                    name="length_cc"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Altura da perna (AP):"
                                                    name="height_ap"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Perímetro da canela (PC):"
                                                    name="perimeter_pc"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento da perna (Cpern):"
                                                    name="length_cpern"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Perímetro da perna (Perpe):"
                                                    name="perimeter_perpe"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Circunferência torácica (CT):"
                                                    name="circumference_ct"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento da orelha (CO):"
                                                    name="length_co"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento da cabeça (CCAB):"
                                                    name="length_ccab"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Longitude de rosto (LR):"
                                                    name="longitude_lr"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Largura entre Íleos (LIL):"
                                                    name="width_lil"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Largura entre Ísquios (LIS):"
                                                    name="width_lis"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento da garupa (Cga):"
                                                    name="length_cga"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento da cauda (Ccau):"
                                                    name="length_ccau"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Perímetro da cauda (Pcau):"
                                                    name="perimeter_pcau"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Panel>
                                    <Panel header='Carcaça (in vivo)' key='4'>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Data de mensuração:"
                                                    name="dt_measurement_carcass"
                                                >
                                                    <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Área de Olho de Lombo (AOL):"
                                                    name="nr_aol"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento de Olho de Lombo (COL):"
                                                    name="nr_col"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Profundidade de Olho de Lombo (POL):"
                                                    name="nr_pol"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Marmoreiro de Olho de Lombo (MOL):"
                                                    name="nr_mol"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Espessura de Gordura Subcutânea (EGS):"
                                                    name="nr_egs"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Espessura de Gordura do Bíceps (EGBF):"
                                                    name="nr_egbf"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Espessura de Gordura Esternal (EGE):"
                                                    name="nr_ege"
                                                >
                                                    <InputNumber style={{width: '100%'}} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Panel>
                                </Collapse>
                            </Col>
                        </Row>
                        <Form.Item>
                            <Space>
                                <Button onClick={() => router.push('/animals')}>
                                    Cancelar
                                </Button>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loading}
                                    className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                                >
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
export default AnimalsForm;
