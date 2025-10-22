'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Table, Tag, Statistic, DatePicker } from 'antd';
import { FaStethoscope, FaVirus, FaChartPie, FaCalendar } from 'react-icons/fa';
import { getClinicalOccurrences, getAnimals, getIllnesses, getProperties, getHerds } from '@/services/api';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ClinicalOccurrencesReport() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [illnesses, setIllnesses] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [selectedIllness, setSelectedIllness] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadProperties();
    loadAnimals();
    loadIllnesses();
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
  }, [selectedProperty, selectedHerd, selectedIllness, dateRange]);

  const loadProperties = async () => {
    try {
      const response = await getProperties();
      setProperties(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Erro ao carregar fazendas:', error);
    }
  };

  const loadHerds = async (propertyId) => {
    try {
      const response = await getHerds();
      const allHerds = Array.isArray(response) ? response : response.data || [];
      setHerds(allHerds.filter(herd => herd.property_id === propertyId) || []);
    } catch (error) {
      console.error('Erro ao carregar rebanhos:', error);
    }
  };

  const loadAnimals = async () => {
    try {
      const response = await getAnimals();
      setAnimals(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    }
  };

  const loadIllnesses = async () => {
    try {
      const response = await getIllnesses();
      setIllnesses(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Erro ao carregar doenças:', error);
    }
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      const occurrencesResponse = await getClinicalOccurrences();
      let occurrences = Array.isArray(occurrencesResponse) ? occurrencesResponse : occurrencesResponse.data || [];

      if (selectedProperty) {
        const propertyAnimalIds = animals.filter(a => a.property_id === selectedProperty).map(a => a.id);
        occurrences = occurrences.filter(o => propertyAnimalIds.includes(o.animal_id));
      }

      if (selectedHerd) {
        const herdAnimalIds = animals.filter(a => a.herd_id === selectedHerd).map(a => a.id);
        occurrences = occurrences.filter(o => herdAnimalIds.includes(o.animal_id));
      }

      if (selectedIllness) {
        occurrences = occurrences.filter(o => o.illness_id === selectedIllness);
      }

      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        occurrences = occurrences.filter(o => o.occurrence_date >= startDate && o.occurrence_date <= endDate);
      }

      const illnessCounts = {};
      occurrences.forEach(o => {
        const illness = illnesses.find(i => i.id === o.illness_id);
        const illnessName = illness ? illness.name : 'Desconhecida';
        illnessCounts[illnessName] = (illnessCounts[illnessName] || 0) + 1;
      });

      const detailedData = occurrences.map(o => {
        const animal = animals.find(a => a.id === o.animal_id);
        const illness = illnesses.find(i => i.id === o.illness_id);
        return {
          ...o,
          animal_name: animal ? (animal.name || animal.earring_identification || 'N/A') : 'N/A',
          illness_name: illness ? illness.name : 'Desconhecida',
        };
      });

      setReportData({ occurrences: detailedData, illnessCounts, total: occurrences.length });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = reportData ? {
    labels: Object.keys(reportData.illnessCounts),
    datasets: [{
      data: Object.values(reportData.illnessCounts),
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
      borderWidth: 2,
    }],
  } : null;

  const columns = [
    { title: 'Animal', dataIndex: 'animal_name', key: 'animal_name' },
    { title: 'Doença', dataIndex: 'illness_name', key: 'illness_name', render: (text) => <Tag color="red">{text}</Tag> },
    { title: 'Data', dataIndex: 'occurrence_date', key: 'occurrence_date', render: (date) => dayjs(date).format('DD/MM/YYYY'), sorter: (a, b) => new Date(b.occurrence_date) - new Date(a.occurrence_date), defaultSortOrder: 'descend' },
    { title: 'Observações', dataIndex: 'observations', key: 'observations', render: (text) => text || '-', ellipsis: true },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <Card title="Filtros" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Fazenda</label>
            <Select showSearch placeholder="Selecione" style={{ width: '100%' }} value={selectedProperty} onChange={setSelectedProperty}>
              {properties.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Rebanho</label>
            <Select showSearch placeholder="Todos" style={{ width: '100%' }} value={selectedHerd} onChange={setSelectedHerd} allowClear disabled={!selectedProperty}>
              {herds.map(h => <Option key={h.id} value={h.id}>{h.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Doença</label>
            <Select showSearch placeholder="Todas" style={{ width: '100%' }} value={selectedIllness} onChange={setSelectedIllness} allowClear disabled={!selectedProperty}>
              {illnesses.map(i => <Option key={i.id} value={i.id}>{i.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Período</label>
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" value={dateRange} onChange={setDateRange} disabled={!selectedProperty} />
          </Col>
        </Row>
      </Card>

      {loading ? <Spin /> : !selectedProperty ? <Card><Empty description="Selecione uma fazenda" /></Card> : reportData ? (
        <>
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} sm={8}><Card><Statistic title="Total de Ocorrências" value={reportData.total} prefix={<FaStethoscope style={{ color: '#ef4444' }} />} valueStyle={{ color: '#ef4444' }} /></Card></Col>
            <Col xs={24} sm={8}><Card><Statistic title="Doenças Diferentes" value={Object.keys(reportData.illnessCounts).length} prefix={<FaVirus style={{ color: '#f59e0b' }} />} valueStyle={{ color: '#f59e0b' }} /></Card></Col>
            <Col xs={24} sm={8}><Card><Statistic title="Animais Afetados" value={new Set(reportData.occurrences.map(o => o.animal_id)).size} prefix={<FaChartPie style={{ color: '#16a34a' }} />} valueStyle={{ color: '#16a34a' }} /></Card></Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} md={12}>
              <Card title="Distribuição por Doença" style={{ height: '400px' }}>
                {pieData && reportData.total > 0 ? <div style={{ height: '300px' }}><Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} /></div> : <Empty />}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Resumo por Doença" style={{ height: '400px' }}>
                <Table dataSource={Object.keys(reportData.illnessCounts).map((illness, i) => ({ key: i, illness, count: reportData.illnessCounts[illness], percentage: `${((reportData.illnessCounts[illness] / reportData.total) * 100).toFixed(1)}%` }))} columns={[{ title: 'Doença', dataIndex: 'illness' }, { title: 'Ocorrências', dataIndex: 'count', align: 'center' }, { title: '%', dataIndex: 'percentage', align: 'center' }]} pagination={false} size="small" />
              </Card>
            </Col>
          </Row>

          <Card title="Listagem Detalhada de Ocorrências">
            <Table dataSource={reportData.occurrences} columns={columns} rowKey="id" pagination={{ pageSize: 10, showTotal: (total) => `${total} ocorrências` }} />
          </Card>
        </>
      ) : null}
    </div>
  );
}

