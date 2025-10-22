'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Table, Tag, Statistic, Alert } from 'antd';
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import { getParasiteControls, getAnimals, getMedicines, getProperties, getHerds } from '@/services/api';
import { Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const { Option } = Select;

export default function DewormingReport() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadProperties();
    loadAnimals();
    loadMedicines();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadHerds(selectedProperty);
    } else {
      setHerds([]);
      setSelectedHerd(null);
    }
  }, [selectedProperty]);

  useEffect(() => {
    if (selectedProperty) {
      loadReportData();
    }
  }, [selectedProperty, selectedHerd]);

  const loadProperties = async () => {
    try {
      const response = await getProperties();
      setProperties(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadHerds = async (propertyId) => {
    try {
      const response = await getHerds();
      const allHerds = Array.isArray(response) ? response : response.data || [];
      setHerds(allHerds.filter(h => h.property_id === propertyId) || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadAnimals = async () => {
    try {
      const response = await getAnimals();
      setAnimals(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadMedicines = async () => {
    try {
      const response = await getMedicines();
      setMedicines(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      const controlsResponse = await getParasiteControls();
      let controls = Array.isArray(controlsResponse) ? controlsResponse : controlsResponse.data || [];

      if (selectedProperty) {
        const propertyAnimalIds = animals.filter(a => a.property_id === selectedProperty).map(a => a.id);
        controls = controls.filter(c => propertyAnimalIds.includes(c.animal_id));
      }

      if (selectedHerd) {
        const herdAnimalIds = animals.filter(a => a.herd_id === selectedHerd).map(a => a.id);
        controls = controls.filter(c => herdAnimalIds.includes(c.animal_id));
      }

      // Analisar necessidade de vermifugação e resistência
      const treatmentNeeded = [];
      const possibleResistant = [];
      const healthy = [];

      // Agrupar controles por animal
      const controlsByAnimal = {};
      controls.forEach(c => {
        if (!controlsByAnimal[c.animal_id]) {
          controlsByAnimal[c.animal_id] = [];
        }
        controlsByAnimal[c.animal_id].push(c);
      });

      // Analisar cada animal
      Object.keys(controlsByAnimal).forEach(animalId => {
        const animalControls = controlsByAnimal[animalId].sort((a, b) => new Date(b.deworming_date) - new Date(a.deworming_date));
        const lastControl = animalControls[0];
        const animal = animals.find(a => a.id === parseInt(animalId));

        if (!animal) return;

        const animalData = {
          animal,
          lastControl,
          totalControls: animalControls.length,
        };

        // Critérios para indicar tratamento
        // OPG > 500, FAMACHA >= 4, ou ECC < 2
        const needsTreatment = 
          (lastControl.opg_pre && lastControl.opg_pre > 500) ||
          (lastControl.famacha && lastControl.famacha >= 4) ||
          (lastControl.body_condition_score && lastControl.body_condition_score < 2);

        // Critérios para resistência
        // OPG pós ainda alto (> 200) ou sem redução significativa (< 80% de redução)
        const isResistant = lastControl.opg_pre && lastControl.opg_post && 
          (lastControl.opg_post > 200 || (lastControl.opg_post / lastControl.opg_pre) > 0.2);

        if (isResistant) {
          possibleResistant.push(animalData);
        } else if (needsTreatment) {
          treatmentNeeded.push(animalData);
        } else {
          healthy.push(animalData);
        }
      });

      const detailedData = controls.map(c => {
        const animal = animals.find(a => a.id === c.animal_id);
        const medicine = medicines.find(m => m.id === c.medicine_id);
        const reduction = c.opg_pre && c.opg_post ? ((c.opg_pre - c.opg_post) / c.opg_pre * 100).toFixed(1) : null;
        
        return {
          ...c,
          animal_name: animal ? (animal.name || animal.earring_identification || 'N/A') : 'N/A',
          medicine_name: medicine ? medicine.name : 'N/A',
          opg_reduction: reduction,
        };
      });

      setReportData({
        controls: detailedData,
        treatmentNeeded,
        possibleResistant,
        healthy,
        total: controls.length,
      });
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Animal', dataIndex: 'animal_name' },
    { title: 'Medicamento', dataIndex: 'medicine_name', render: (text) => <Tag color="green">{text}</Tag> },
    { title: 'Data', dataIndex: 'deworming_date', render: (date) => dayjs(date).format('DD/MM/YYYY') },
    { title: 'OPG Pré', dataIndex: 'opg_pre', align: 'center', render: (v) => v || '-' },
    { title: 'OPG Pós', dataIndex: 'opg_post', align: 'center', render: (v) => v || '-' },
    { title: 'Redução', dataIndex: 'opg_reduction', align: 'center', render: (v) => v ? <Tag color={parseFloat(v) >= 80 ? 'green' : parseFloat(v) >= 50 ? 'orange' : 'red'}>{v}%</Tag> : '-' },
    { title: 'FAMACHA', dataIndex: 'famacha', align: 'center', render: (v) => v ? <Tag color={v <= 2 ? 'green' : v <= 3 ? 'orange' : 'red'}>{v}</Tag> : '-' },
    { title: 'ECC', dataIndex: 'body_condition_score', align: 'center', render: (v) => v || '-' },
  ];

  const resistantColumns = [
    { title: 'Animal', render: (record) => record.animal.name || record.animal.earring_identification || 'N/A' },
    { title: 'Último Controle', dataIndex: ['lastControl', 'deworming_date'], render: (date) => dayjs(date).format('DD/MM/YYYY') },
    { title: 'OPG Pré', dataIndex: ['lastControl', 'opg_pre'], align: 'center' },
    { title: 'OPG Pós', dataIndex: ['lastControl', 'opg_post'], align: 'center', render: (v) => <Tag color="red">{v}</Tag> },
    { title: 'Redução', render: (record) => {
      const reduction = ((record.lastControl.opg_pre - record.lastControl.opg_post) / record.lastControl.opg_pre * 100).toFixed(1);
      return <Tag color="red">{reduction}%</Tag>;
    }, align: 'center' },
    { title: 'Total Controles', dataIndex: 'totalControls', align: 'center' },
  ];

  const treatmentColumns = [
    { title: 'Animal', render: (record) => record.animal.name || record.animal.earring_identification || 'N/A' },
    { title: 'Motivo', render: (record) => {
      const reasons = [];
      if (record.lastControl.opg_pre > 500) reasons.push('OPG Alto');
      if (record.lastControl.famacha >= 4) reasons.push('FAMACHA Alto');
      if (record.lastControl.body_condition_score < 2) reasons.push('ECC Baixo');
      return reasons.map((r, i) => <Tag key={i} color="orange">{r}</Tag>);
    } },
    { title: 'OPG', dataIndex: ['lastControl', 'opg_pre'], align: 'center' },
    { title: 'FAMACHA', dataIndex: ['lastControl', 'famacha'], align: 'center', render: (v) => v ? <Tag color="orange">{v}</Tag> : '-' },
    { title: 'ECC', dataIndex: ['lastControl', 'body_condition_score'], align: 'center' },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <Card title="Filtros" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Fazenda</label>
            <Select showSearch placeholder="Selecione" style={{ width: '100%' }} value={selectedProperty} onChange={setSelectedProperty}>{properties.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}</Select>
          </Col>
          <Col xs={24} md={12}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Rebanho</label>
            <Select showSearch placeholder="Todos" style={{ width: '100%' }} value={selectedHerd} onChange={setSelectedHerd} allowClear disabled={!selectedProperty}>{herds.map(h => <Option key={h.id} value={h.id}>{h.name}</Option>)}</Select>
          </Col>
        </Row>
      </Card>

      {loading ? <Spin /> : !selectedProperty ? <Card><Empty description="Selecione uma fazenda" /></Card> : reportData ? (
        <>
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} sm={8}><Card><Statistic title="Total Analisados" value={reportData.treatmentNeeded.length + reportData.possibleResistant.length + reportData.healthy.length} prefix={<FaShieldAlt style={{ color: '#16a34a' }} />} valueStyle={{ color: '#16a34a' }} /></Card></Col>
            <Col xs={24} sm={8}><Card><Statistic title="⚠️ Necessitam Tratamento" value={reportData.treatmentNeeded.length} prefix={<FaExclamationTriangle style={{ color: '#f59e0b' }} />} valueStyle={{ color: '#f59e0b' }} /></Card></Col>
            <Col xs={24} sm={8}><Card><Statistic title="🛡️ Saudáveis" value={reportData.healthy.length} prefix={<FaCheckCircle style={{ color: '#10b981' }} />} valueStyle={{ color: '#10b981' }} /></Card></Col>
          </Row>

          {reportData.possibleResistant.length > 0 && (
            <Alert
              message="⚠️ ALERTA: Animais Possivelmente Resistentes a Endoparasitas"
              description={`Foram identificados ${reportData.possibleResistant.length} animais com possível resistência. Estes animais apresentam OPG pós-tratamento ainda elevado ou redução insuficiente. Avalie troca de princípio ativo ou protocolo de tratamento.`}
              type="error"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          )}

          {reportData.possibleResistant.length > 0 && (
            <Card title="🚨 Animais Possivelmente Resistentes" style={{ marginBottom: '20px', borderColor: '#ef4444' }}>
              <Table dataSource={reportData.possibleResistant} columns={resistantColumns} rowKey={(record) => record.animal.id} pagination={false} size="small" />
            </Card>
          )}

          {reportData.treatmentNeeded.length > 0 && (
            <Card title="⚠️ Animais que Necessitam Tratamento" style={{ marginBottom: '20px', borderColor: '#f59e0b' }}>
              <Table dataSource={reportData.treatmentNeeded} columns={treatmentColumns} rowKey={(record) => record.animal.id} pagination={false} size="small" />
            </Card>
          )}

          <Card title="📊 Histórico Completo de Vermifugações">
            <Table dataSource={reportData.controls} columns={columns} rowKey="id" pagination={{ pageSize: 10, showTotal: (total) => `${total} tratamentos` }} scroll={{ x: 1200 }} />
          </Card>
        </>
      ) : null}
    </div>
  );
}

