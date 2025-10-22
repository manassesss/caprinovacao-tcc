'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Table, Tag, Statistic, DatePicker } from 'antd';
import { FaBug, FaChartLine, FaEye, FaTint } from 'react-icons/fa';
import { getParasiteControls, getAnimals, getMedicines, getProperties, getHerds } from '@/services/api';
import { Line, Bar } from 'react-chartjs-2';
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
const { RangePicker } = DatePicker;

export default function ParasiteControlReportComponent() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [dateRange, setDateRange] = useState(null);
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
  }, [selectedProperty, selectedHerd, dateRange]);

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

      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        controls = controls.filter(c => c.deworming_date >= startDate && c.deworming_date <= endDate);
      }

      const avgOPGPre = controls.filter(c => c.opg_pre).reduce((sum, c) => sum + c.opg_pre, 0) / controls.filter(c => c.opg_pre).length || 0;
      const avgOPGPost = controls.filter(c => c.opg_post).reduce((sum, c) => sum + c.opg_post, 0) / controls.filter(c => c.opg_post).length || 0;
      const avgFAMACHA = controls.filter(c => c.famacha).reduce((sum, c) => sum + c.famacha, 0) / controls.filter(c => c.famacha).length || 0;
      const avgECC = controls.filter(c => c.body_condition_score).reduce((sum, c) => sum + c.body_condition_score, 0) / controls.filter(c => c.body_condition_score).length || 0;

      const detailedData = controls.map(c => {
        const animal = animals.find(a => a.id === c.animal_id);
        const medicine = medicines.find(m => m.id === c.medicine_id);
        return {
          ...c,
          animal_name: animal ? (animal.name || animal.earring_identification || 'N/A') : 'N/A',
          medicine_name: medicine ? medicine.name : 'N/A',
        };
      });

      setReportData({ controls: detailedData, avgOPGPre, avgOPGPost, avgFAMACHA, avgECC, total: controls.length });
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Animal', dataIndex: 'animal_name' },
    { title: 'Medicamento', dataIndex: 'medicine_name', render: (text) => <Tag color="green">{text}</Tag> },
    { title: 'Data', dataIndex: 'deworming_date', render: (date) => dayjs(date).format('DD/MM/YYYY'), sorter: (a, b) => new Date(b.deworming_date) - new Date(a.deworming_date) },
    { title: 'OPG Pré', dataIndex: 'opg_pre', align: 'center', render: (v) => v || '-' },
    { title: 'OPG Pós', dataIndex: 'opg_post', align: 'center', render: (v) => v || '-' },
    { title: 'FAMACHA', dataIndex: 'famacha', align: 'center', render: (v) => v ? <Tag color={v <= 2 ? 'green' : v <= 3 ? 'orange' : 'red'}>{v}</Tag> : '-' },
    { title: 'ECC', dataIndex: 'body_condition_score', align: 'center', render: (v) => v || '-' },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <Card title="Filtros" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Fazenda</label>
            <Select showSearch placeholder="Selecione" style={{ width: '100%' }} value={selectedProperty} onChange={setSelectedProperty}>{properties.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}</Select>
          </Col>
          <Col xs={24} md={8}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Rebanho</label>
            <Select showSearch placeholder="Todos" style={{ width: '100%' }} value={selectedHerd} onChange={setSelectedHerd} allowClear disabled={!selectedProperty}>{herds.map(h => <Option key={h.id} value={h.id}>{h.name}</Option>)}</Select>
          </Col>
          <Col xs={24} md={8}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Período</label>
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" value={dateRange} onChange={setDateRange} disabled={!selectedProperty} />
          </Col>
        </Row>
      </Card>

      {loading ? <Spin /> : !selectedProperty ? <Card><Empty description="Selecione uma fazenda" /></Card> : reportData ? (
        <>
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} sm={12} md={6}><Card><Statistic title="Total de Controles" value={reportData.total} prefix={<FaBug style={{ color: '#16a34a' }} />} valueStyle={{ color: '#16a34a' }} /></Card></Col>
            <Col xs={24} sm={12} md={6}><Card><Statistic title="OPG Pré Médio" value={reportData.avgOPGPre.toFixed(0)} prefix={<FaTint style={{ color: '#ef4444' }} />} valueStyle={{ color: '#ef4444' }} /></Card></Col>
            <Col xs={24} sm={12} md={6}><Card><Statistic title="OPG Pós Médio" value={reportData.avgOPGPost.toFixed(0)} prefix={<FaTint style={{ color: '#10b981' }} />} valueStyle={{ color: '#10b981' }} /></Card></Col>
            <Col xs={24} sm={12} md={6}><Card><Statistic title="FAMACHA Médio" value={reportData.avgFAMACHA.toFixed(1)} prefix={<FaEye style={{ color: '#f59e0b' }} />} valueStyle={{ color: '#f59e0b' }} /></Card></Col>
          </Row>

          <Card title="Listagem de Controles Parasitários">
            <Table dataSource={reportData.controls} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
          </Card>
        </>
      ) : null}
    </div>
  );
}

