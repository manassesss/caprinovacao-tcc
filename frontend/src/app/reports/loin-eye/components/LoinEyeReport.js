'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Table, Tag, Statistic } from 'antd';
import { FaEye, FaRulerCombined, FaRulerVertical, FaArrowsAlt } from 'react-icons/fa';
import { getAnimals, getAnimalCarcassMeasurements, getProperties, getHerds } from '@/services/api';
import { Radar, Bar } from 'react-chartjs-2';
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
  RadialLinearScale,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
);

const { Option } = Select;

export default function LoinEyeReport() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadProperties();
    loadAnimals();
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
  }, [selectedProperty, selectedHerd, selectedAnimal]);

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
      const filteredHerds = allHerds.filter(herd => herd.property_id === propertyId);
      setHerds(filteredHerds || []);
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

  const loadReportData = async () => {
    setLoading(true);
    try {
      let filteredAnimals = animals.filter(a => a.property_id === selectedProperty);
      
      if (selectedHerd) {
        filteredAnimals = filteredAnimals.filter(a => a.herd_id === selectedHerd);
      }

      if (selectedAnimal) {
        filteredAnimals = filteredAnimals.filter(a => a.id === selectedAnimal);
      }

      const animalsLoinData = [];
      
      for (const animal of filteredAnimals) {
        try {
          const measurementsResponse = await getAnimalCarcassMeasurements(animal.id);
          const measurements = Array.isArray(measurementsResponse) ? measurementsResponse : measurementsResponse.data || [];
          
          const loinMeasurements = measurements.filter(m => 
            m.aol !== null || m.col !== null || m.pol !== null || m.mol !== null
          );

          if (loinMeasurements.length > 0) {
            const avgAOL = loinMeasurements.filter(m => m.aol !== null).reduce((sum, m) => sum + m.aol, 0) / loinMeasurements.filter(m => m.aol !== null).length || 0;
            const avgCOL = loinMeasurements.filter(m => m.col !== null).reduce((sum, m) => sum + m.col, 0) / loinMeasurements.filter(m => m.col !== null).length || 0;
            const avgPOL = loinMeasurements.filter(m => m.pol !== null).reduce((sum, m) => sum + m.pol, 0) / loinMeasurements.filter(m => m.pol !== null).length || 0;
            const avgMOL = loinMeasurements.filter(m => m.mol !== null).reduce((sum, m) => sum + m.mol, 0) / loinMeasurements.filter(m => m.mol !== null).length || 0;

            animalsLoinData.push({
              animal,
              measurements: loinMeasurements,
              avgAOL,
              avgCOL,
              avgPOL,
              avgMOL,
              totalRecords: loinMeasurements.length,
            });
          }
        } catch (error) {
          console.error(`Erro ao carregar medidas do animal ${animal.id}:`, error);
        }
      }

      let totalAOL = 0, totalCOL = 0, totalPOL = 0, totalMOL = 0;
      let count = animalsLoinData.length;

      animalsLoinData.forEach(data => {
        totalAOL += data.avgAOL || 0;
        totalCOL += data.avgCOL || 0;
        totalPOL += data.avgPOL || 0;
        totalMOL += data.avgMOL || 0;
      });

      const overallStats = {
        avgAOL: count > 0 ? totalAOL / count : 0,
        avgCOL: count > 0 ? totalCOL / count : 0,
        avgPOL: count > 0 ? totalPOL / count : 0,
        avgMOL: count > 0 ? totalMOL / count : 0,
      };

      const sortedByAOL = [...animalsLoinData].sort((a, b) => (b.avgAOL || 0) - (a.avgAOL || 0));

      setReportData({
        animalsLoinData,
        overallStats,
        totalAnimals: count,
        sortedByAOL,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const radarData = reportData ? {
    labels: ['AOL (cm²)', 'COL (cm)', 'POL (cm)', 'MOL (cm)'],
    datasets: [{
      label: 'Médias Gerais',
      data: [
        reportData.overallStats.avgAOL,
        reportData.overallStats.avgCOL,
        reportData.overallStats.avgPOL,
        reportData.overallStats.avgMOL,
      ],
      backgroundColor: 'rgba(22, 163, 74, 0.2)',
      borderColor: '#16a34a',
      borderWidth: 2,
    }],
  } : null;

  const barData = reportData && reportData.sortedByAOL.length > 0 ? {
    labels: reportData.sortedByAOL.slice(0, 10).map(d => 
      d.animal.name || d.animal.earring_identification || d.animal.id
    ),
    datasets: [
      { label: 'AOL (cm²)', data: reportData.sortedByAOL.slice(0, 10).map(d => d.avgAOL || 0), backgroundColor: '#3b82f6' },
      { label: 'COL (cm)', data: reportData.sortedByAOL.slice(0, 10).map(d => d.avgCOL || 0), backgroundColor: '#8b5cf6' },
      { label: 'POL (cm)', data: reportData.sortedByAOL.slice(0, 10).map(d => d.avgPOL || 0), backgroundColor: '#ec4899' },
      { label: 'MOL (cm)', data: reportData.sortedByAOL.slice(0, 10).map(d => d.avgMOL || 0), backgroundColor: '#f59e0b' },
    ],
  } : null;

  const columns = [
    { title: '#', key: 'ranking', render: (_, __, index) => <span style={{ fontWeight: 'bold' }}>{index + 1}º</span>, width: 60 },
    { title: 'Animal', render: (record) => record.animal.name || record.animal.earring_identification || 'N/A', width: 150 },
    { title: 'Identificação', dataIndex: ['animal', 'earring_identification'], render: (text) => text || 'N/A' },
    { title: 'AOL (cm²)', dataIndex: 'avgAOL', align: 'center', render: (v) => v ? <strong>{v.toFixed(2)}</strong> : '-', sorter: (a, b) => (b.avgAOL || 0) - (a.avgAOL || 0) },
    { title: 'COL (cm)', dataIndex: 'avgCOL', align: 'center', render: (v) => v ? v.toFixed(2) : '-' },
    { title: 'POL (cm)', dataIndex: 'avgPOL', align: 'center', render: (v) => v ? v.toFixed(2) : '-' },
    { title: 'MOL (cm)', dataIndex: 'avgMOL', align: 'center', render: (v) => v ? v.toFixed(2) : '-' },
    { title: 'Registros', dataIndex: 'totalRecords', align: 'center', render: (count) => <Tag color="blue">{count}</Tag> },
  ];

  const filteredAnimalsForSelect = animals.filter(a => {
    if (selectedProperty && a.property_id !== selectedProperty) return false;
    if (selectedHerd && a.herd_id !== selectedHerd) return false;
    return true;
  });

  return (
    <div style={{ marginTop: '20px' }}>
      <Card title="Filtros" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fazenda</label>
            <Select showSearch placeholder="Selecione uma fazenda" style={{ width: '100%' }} value={selectedProperty} onChange={setSelectedProperty} optionFilterProp="children">
              {properties.map(property => <Option key={property.id} value={property.id}>{property.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rebanho (opcional)</label>
            <Select showSearch placeholder="Selecione um rebanho" style={{ width: '100%' }} value={selectedHerd} onChange={setSelectedHerd} allowClear disabled={!selectedProperty}>
              {herds.map(herd => <Option key={herd.id} value={herd.id}>{herd.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Animal (opcional)</label>
            <Select showSearch placeholder="Todos os animais" style={{ width: '100%' }} value={selectedAnimal} onChange={setSelectedAnimal} allowClear disabled={!selectedProperty}>
              {filteredAnimalsForSelect.map(animal => <Option key={animal.id} value={animal.id}>{animal.name || animal.earring_identification || animal.id}</Option>)}
            </Select>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
      ) : !selectedProperty ? (
        <Card><Empty description="Selecione uma fazenda para visualizar o relatório" /></Card>
      ) : reportData && reportData.totalAnimals > 0 ? (
        <>
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} sm={12} md={6}><Card><Statistic title="Animais Avaliados" value={reportData.totalAnimals} prefix={<FaEye style={{ color: '#16a34a' }} />} valueStyle={{ color: '#16a34a' }} /></Card></Col>
            <Col xs={24} sm={12} md={6}><Card><Statistic title="AOL Média" value={reportData.overallStats.avgAOL.toFixed(2)} prefix={<FaArrowsAlt style={{ color: '#3b82f6' }} />} valueStyle={{ color: '#3b82f6' }} suffix="cm²" /></Card></Col>
            <Col xs={24} sm={12} md={6}><Card><Statistic title="COL Média" value={reportData.overallStats.avgCOL.toFixed(2)} prefix={<FaRulerCombined style={{ color: '#8b5cf6' }} />} valueStyle={{ color: '#8b5cf6' }} suffix="cm" /></Card></Col>
            <Col xs={24} sm={12} md={6}><Card><Statistic title="POL Média" value={reportData.overallStats.avgPOL.toFixed(2)} prefix={<FaRulerVertical style={{ color: '#ec4899' }} />} valueStyle={{ color: '#ec4899' }} suffix="cm" /></Card></Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} md={12}>
              <Card title="Médias Gerais - Olho de Lombo" style={{ height: '450px' }}>
                {radarData ? <div style={{ height: '350px' }}><Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true } } }} /></div> : <Empty />}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Top 10 - Métricas de Olho de Lombo" style={{ height: '450px' }}>
                {barData ? <div style={{ height: '350px' }}><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} /></div> : <Empty />}
              </Card>
            </Col>
          </Row>

          <Card title="🏆 Classificação Geral - Olho de Lombo">
            <Table dataSource={reportData.sortedByAOL} columns={columns} rowKey={(record) => record.animal.id} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total de ${total} animais` }} scroll={{ x: 1000 }} />
          </Card>
        </>
      ) : reportData ? (
        <Card><Empty description="Nenhum animal com registros de olho de lombo encontrado." /></Card>
      ) : null}
    </div>
  );
}

