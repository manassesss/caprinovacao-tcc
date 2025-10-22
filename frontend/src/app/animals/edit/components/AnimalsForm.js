import React, { useEffect, useState } from "react";
import { useParams  } from 'next/navigation';
import { AiOutlineLeft } from 'react-icons/ai';
import { Alert, Button, Card, Form, Input, Space, Row, Col, Select, Collapse, DatePicker, InputNumber} from 'antd';


const { Panel } = Collapse;

const AnimalsForm = ({onSaved}) => {
    const [dataIsLoaded, setDataIsLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [toast, setToast] = useState(false);
    const [action, setAction] = useState('save');
    const [employeeData, setEmplyeeData] = useState({
        id: '',
        name: '',
        flock_id: '',
        cd_childbirth: '',
        cd_dad: '',
        cd_mom: '',
        cd_category: '',
        cd_ear_position: '',
        genre: '',
        cd_type_childbirth: '',
        cd_purpouse: '',
        cd_entry_reason: '',
        dt_weaning: '',
        race_id: '',
        cd_genetic_composition: '',
        cd_degree_of_testicular_partition: '',
        ds_observation: '',
        dt_measurement: '',
        cd_period: '',
        weigth: '',
        nr_ecc: '',
        nr_c: '',
        nr_p: '',
        nr_m: '',
        dt_measurement_verminose: '',
        nr_opg: '',
        farmhouse : '',
        dt_measurement_body: '',
        height_ag: '',
        height_ap: '',
        height_ac: '',
        length_cc: '',
        length_cpern: '',
        length_co: '',
        length_ccab: '',
        length_cga: '',
        length_ccau: '',
        perimeter_pc: '',
        perimeter_perpe: '',
        perimeter_pcau: '',
        circumference_ct: '',
        longitude_lr: '',
        width_lil: '',
        width_lis: '',
        dt_measurement_carcass: '',
        nr_aol: '',
        nr_col: '',
        nr_pol: '',
        nr_mol: '',
        nr_egs: '',
        nr_egbf: '',
        nr_ege: '',

    });
    const [form] = Form.useForm();
    const params = useParams();
    const id = params?.id?.[0];

    const onFinish = async (data) => {
        setErrorMessage('Salvo com sucesso');
        setToast(true);
        onSaved();
    }
    useEffect(() => {
        if(id) {
            setAction('edit')
        }
    }, [id])

    return (
        <>
            <main style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                <Space direction="vertical">
                    <Card
                    title={
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <div style={{cursor: 'pointer'}}>
                                <AiOutlineLeft onClick={() => onSaved()} />
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
                                    label="Nome / Número:"
                                    name="name"
                                    rules={[{ required: true, message: 'Insira o nome ou número ' }]}
                                    >
                                    <Input value={employeeData?.name} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Rebanho:"
                                    name="flock_id"
                                    rules={[{ required: true, message: 'Insira o rebanho ' }]}
                                    >
                                    <Select value={employeeData?.flock_id} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Data de nascimento:"
                                    name="cd_childbirth"
                                    rules={[{ required: true, message: 'Insira a data de nascimento ' }]}
                                    >
                                    <DatePicker style={{width: '100%'}} value={employeeData?.cd_especies} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Sexo:"
                                    name="genre"
                                    rules={[{ required: true, message: 'Insira o sexo ' }]}
                                    >
                                    <Select value={employeeData?.genre} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Finalidade:"
                                    name="cd_purpouse"
                                    rules={[{ required: true, message: 'Insira a finalidade' }]}
                                    >
                                    <Select value={employeeData?.cd_purpouse} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Motivo de Entrada:"
                                    name="cd_entry_reason"
                                    rules={[{ required: true, message: 'Insira o motivo de entrada ' }]}
                                    >
                                    <Select value={employeeData?.cd_entry_reason} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Tipo de Parto:"
                                    name="cd_typ_childbirth"
                                    rules={[{ required: true, message: 'Insira o tipo de parto' }]}
                                    >
                                    <Select value={employeeData?.cd_typ_childbirth} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Data de desmame:"
                                    name="dt_weaning"
                                    rules={[{ required: true, message: 'Insira a data de desmame' }]}
                                    >
                                    <DatePicker style={{width: '100%'}} value={employeeData?.dt_weaning} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Mãe:"
                                    name="cd_mom"
                                    rules={[{ required: true, message: 'Insira a mãe' }]}
                                    >
                                    <Select value={employeeData?.cd_mom} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Pai:"
                                    name="cd_dad"
                                    rules={[{ required: true, message: 'Insira a papai' }]}
                                    >
                                    <Select value={employeeData?.cd_dad} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Composição genética:"
                                    name="cd_genetic_composition"
                                    rules={[{ required: true, message: 'Insira a composição genética' }]}
                                    >
                                    <Select value={employeeData?.cd_genetic_composition} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Categoria:"
                                    name="cd_category"
                                    rules={[{ required: true, message: 'Insira a categoria' }]}
                                    >
                                    <Select value={employeeData?.cd_category} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Grau de partição:"
                                    name="cd_"
                                    rules={[{ required: true, message: 'Insira a grau de partição' }]}
                                    >
                                    <Select value={employeeData?.cd_degree_of_testicular_partition} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Posição da Orelha:"
                                    name="cd_ear_position"
                                    rules={[{ required: true, message: 'Insira a posição da orelha' }]}
                                    >
                                    <Select value={employeeData?.cd_ear_position} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16} >
                            <Col span={24}>
                                <Collapse defaultActiveKey={['1', '2', '3']} style={{marginBottom: '15px'}}>
                                    <Panel header='Desenvolvimento Ponderal' key='1'>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Data de mensuração:"
                                                    name="dt_measurement"
                                                    rules={[{ required: true, message: 'Insira a data de mensuração ' }]}
                                                    >
                                                    <DatePicker style={{width: '100%'}} value={employeeData?.dt_measurement_body} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Período:"
                                                    name="cd_period"
                                                    >
                                                    <Select value={employeeData?.cd_period} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Peso:"
                                                    name="weigth"
                                                    >
                                                    <Input value={employeeData?.weigth} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Escore de condição corporal (ECC):"
                                                    name="nr_ecc"
                                                    >
                                                    <InputNumber style={{width: '100%'}} value={employeeData?.nr_ecc} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Conformação (C):"
                                                    name="nr_c"
                                                    >
                                                    <InputNumber style={{width: '100%'}} value={employeeData?.nr_c} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Precocidade (P):"
                                                    name="nr_p"
                                                    >
                                                    <InputNumber style={{width: '100%'}} value={employeeData?.nr_p} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Muscolosidade (M):"
                                                    name="nr_ecc"
                                                    >
                                                    <InputNumber style={{width: '100%'}} value={employeeData?.nr_m} />
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
                                                    rules={[{ required: true, message: 'Insira a data de mensuração ' }]}
                                                    >
                                                    <DatePicker style={{width: '100%'}} value={employeeData?.dt_measurement_body} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Ovos por grama de fezes (OPG):"
                                                    name="nr_opg"
                                                    >
                                                    <InputNumber style={{width: '100%'}} value={employeeData?.nr_opg} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Farmancha:"
                                                    name="farmhouse"
                                                    >
                                                    <InputNumber style={{width: '100%'}} value={employeeData?.farmhouse} />
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
                                                    rules={[{ required: true, message: 'Insira a data de mensuração ' }]}
                                                    >
                                                    <DatePicker style={{width: '100%'}} value={employeeData?.dt_measurement_body} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Altura de cernelha (AC):"
                                                    name="height_ac"
                                                    >
                                                    <Input value={employeeData?.height_ac} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Altura da garupa (AG):"
                                                    name="height_ag"
                                                    >
                                                    <Input value={employeeData?.height_ag} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento corporal (CC):"
                                                    name="height_ac"
                                                    >
                                                    <Input value={employeeData?.length_cc} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Altura da perna (AP):"
                                                    name="height_ap"
                                                    >
                                                    <Input value={employeeData?.height_ap} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Perímetro da canela (PC):"
                                                    name="perimeter_pc"
                                                    >
                                                    <Input value={employeeData?.perimeter_pc} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento da perna (Cpern):"
                                                    name="length_cpern"
                                                    >
                                                    <Input value={employeeData?.length_cpern} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Perímetro da perna (Perpe):"
                                                    name="perimeter_perpe"
                                                    >
                                                    <Input value={employeeData?.perimeter_perpe} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Circunferência torácica (CT):"
                                                    name="circumference_ct"
                                                    >
                                                    <Input value={employeeData?.circumference_ct} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento da orelha (CO):"
                                                    name="length_co"
                                                    >
                                                    <Input value={employeeData?.length_co} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento da cabeça (CCAB):"
                                                    name="length_ccab"
                                                    >
                                                    <Input value={employeeData?.length_ccab} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Longitude de rosto (LR):"
                                                    name="longitude_lr"
                                                    >
                                                    <Input value={employeeData?.longitude_lr} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Largura entre Íleos (LIL):"
                                                    name="width_lil"
                                                    >
                                                    <Input value={employeeData?.width_lil} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Largura entre Ísquios (LIS):"
                                                    name="width_lis"
                                                    >
                                                    <Input value={employeeData?.width_lis} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento da garupa (Cga):"
                                                    name="length_cga"
                                                    >
                                                    <Input value={employeeData?.length_cga} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento da cauda (Ccau):"
                                                    name="length_ccau"
                                                    >
                                                    <Input value={employeeData?.length_ccau} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Perímetro da cauda (Pcau):"
                                                    name="perimeter_pcau"
                                                    >
                                                    <Input value={employeeData?.perimeter_pcau} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Panel>
                                    <Panel header='Carcaça' key='4'>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Data de mensuração:"
                                                    name="dt_measurement_carcass"
                                                    rules={[{ required: true, message: 'Insira a data de mensuração ' }]}
                                                    >
                                                    <DatePicker style={{width: '100%'}} value={employeeData?.dt_measurement_body} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Área de Olho de Lombo (AOL):"
                                                    name="nr_aol"
                                                    >
                                                    <Input value={employeeData?.nr_aol} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Comprimento de Olho de Lombo (COL):"
                                                    name="nr_col"
                                                    >
                                                    <Input value={employeeData?.nr_col} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Profundidade de Olho de Lombo (POL):"
                                                    name="nr_pol"
                                                    >
                                                    <Input value={employeeData?.nr_pol} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Marmoreiro de Olho de Lombo (MOL):"
                                                    name="nr_mol"
                                                    >
                                                    <Input value={employeeData?.nr_mol} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Espessura de Gordura Subcutânea (EGS):"
                                                    name="nr_egs"
                                                    >
                                                    <Input value={employeeData?.nr_egs} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Espessura de Gordura do Bíceps (EGBF):"
                                                    name="nr_egbf"
                                                    >
                                                    <Input value={employeeData?.nr_egbf} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Espessura de Gordura Esternal (EGE):"
                                                    name="nr_ege"
                                                    >
                                                    <Input value={employeeData?.nr_ege} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Panel>
                                </Collapse>
                            </Col>
                        </Row>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Salvar
                            </Button>
                        </Form.Item>
                    </Form>
                    </Card>
                </Space>
            </main>
        </>
    );
}
export default AnimalsForm