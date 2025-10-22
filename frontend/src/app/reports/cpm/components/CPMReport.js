'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Table, Tag, Statistic, Progress } from 'antd';
import { FaChartArea, FaStar, FaTrophy, FaAward } from 'react-icons/fa';
import { getAnimals, getAnimalWeights, getProperties, getHerds } from '@/services/api';
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
import dayjs from 'dayjs';

// Registrar componentes do Chart.js
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

export default function CPMReport() {
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
      // Filtrar animais
      let filteredAnimals = animals.filter(a => a.property_id === selectedProperty);
      
      if (selectedHerd) {
        filteredAnimals = filteredAnimals.filter(a => a.herd_id === selectedHerd);
      }

      if (selectedAnimal) {
        filteredAnimals = filteredAnimals.filter(a => a.id === selectedAnimal);
      }

      // Buscar registros de peso com CPM para cada animal
      const animalsCPMData = [];
      
      for (const animal of filteredAnimals) {
        try {
          const weightsResponse = await getAnimalWeights(animal.id);
          const weights = Array.isArray(weightsResponse) ? weightsResponse : weightsResponse.data || [];
          
          // Filtrar apenas registros com dados CPM
          const cpmWeights = weights.filter(w => 
            w.conformation !== null && 
            w.precocity !== null && 
            w.musculature !== null
          );

          if (cpmWeights.length > 0) {
            // Calcular médias de CPM para o animal
            const avgConformation = cpmWeights.reduce((sum, w) => sum + (w.conformation || 0), 0) / cpmWeights.length;
            const avgPrecocity = cpmWeights.reduce((sum, w) => sum + (w.precocity || 0), 0) / cpmWeights.length;
            const avgMusculature = cpmWeights.reduce((sum, w) => sum + (w.musculature || 0), 0) / cpmWeights.length;
            const avgCPM = (avgConformation + avgPrecocity + avgMusculature) / 3;

            animalsCPMData.push({
              animal,
              weights: cpmWeights,
              avgConformation,
              avgPrecocity,
              avgMusculature,
              avgCPM,
              totalRecords: cpmWeights.length,
            });
          }
        } catch (error) {
          console.error(`Erro ao carregar pesos do animal ${animal.id}:`, error);
        }
      }

      // Calcular médias gerais
      let totalConformation = 0;
      let totalPrecocity = 0;
      let totalMusculature = 0;
      let totalCPM = 0;
      let count = animalsCPMData.length;

      animalsCPMData.forEach(data => {
        totalConformation += data.avgConformation;
        totalPrecocity += data.avgPrecocity;
        totalMusculature += data.avgMusculature;
        totalCPM += data.avgCPM;
      });

      const overallStats = {
        avgConformation: count > 0 ? totalConformation / count : 0,
        avgPrecocity: count > 0 ? totalPrecocity / count : 0,
        avgMusculature: count > 0 ? totalMusculature / count : 0,
        avgCPM: count > 0 ? totalCPM / count : 0,
      };

      // Classificação dos animais
      const sortedByConformation = [...animalsCPMData].sort((a, b) => b.avgConformation - a.avgConformation);
      const sortedByPrecocity = [...animalsCPMData].sort((a, b) => b.avgPrecocity - a.avgPrecocity);
      const sortedByMusculature = [...animalsCPMData].sort((a, b) => b.avgMusculature - a.avgMusculature);
      const sortedByCPM = [...animalsCPMData].sort((a, b) => b.avgCPM - a.avgCPM);

      setReportData({
        animalsCPMData,
        overallStats,
        totalAnimals: count,
        sortedByConformation,
        sortedByPrecocity,
        sortedByMusculature,
        sortedByCPM,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter cor baseada na pontuação (1-5)
  const getScoreColor = (score) => {
    if (score >= 4.5) return '#10b981'; // Verde
    if (score >= 4.0) return '#84cc16'; // Verde claro
    if (score >= 3.5) return '#f59e0b'; // Laranja
    if (score >= 3.0) return '#ef4444'; // Vermelho
    return '#dc2626'; // Vermelho escuro
  };

  // Função para obter classificação textual
  const getScoreLabel = (score) => {
    if (score >= 4.5) return 'Excelente';
    if (score >= 4.0) return 'Muito Bom';
    if (score >= 3.5) return 'Bom';
    if (score >= 3.0) return 'Regular';
    return 'Baixo';
  };

  // Dados para gráfico radar (médias gerais)
  const radarData = reportData ? {
    labels: ['Conformação', 'Precocidade', 'Musculatura'],
    datasets: [{
      label: 'Média Geral',
      data: [
        reportData.overallStats.avgConformation,
        reportData.overallStats.avgPrecocity,
        reportData.overallStats.avgMusculature,
      ],
      backgroundColor: 'rgba(22, 163, 74, 0.2)',
      borderColor: '#16a34a',
      borderWidth: 2,
      pointBackgroundColor: '#16a34a',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#16a34a',
    }],
  } : null;

  // Dados para gráfico de barras (Top 10 CPM)
  const barData = reportData && reportData.sortedByCPM.length > 0 ? {
    labels: reportData.sortedByCPM.slice(0, 10).map(d => 
      d.animal.name || d.animal.earring_identification || d.animal.id
    ),
    datasets: [
      {
        label: 'Conformação',
        data: reportData.sortedByCPM.slice(0, 10).map(d => d.avgConformation),
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Precocidade',
        data: reportData.sortedByCPM.slice(0, 10).map(d => d.avgPrecocity),
        backgroundColor: '#8b5cf6',
      },
      {
        label: 'Musculatura',
        data: reportData.sortedByCPM.slice(0, 10).map(d => d.avgMusculature),
        backgroundColor: '#ec4899',
      },
    ],
  } : null;

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Médias Gerais CPM',
        font: {
          size: 16,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Animais - CPM Detalhado',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: 'Pontuação',
        },
      },
    },
  };

  // Colunas para tabela detalhada
  const columns = [
    {
      title: 'Ranking',
      key: 'ranking',
      render: (_, __, index) => (
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
          {index + 1}º
        </span>
      ),
      width: 80,
      fixed: 'left',
    },
    {
      title: 'Animal',
      dataIndex: ['animal', 'name'],
      key: 'name',
      render: (name, record) => name || record.animal.earring_identification || 'N/A',
      fixed: 'left',
      width: 150,
    },
    {
      title: 'Identificação',
      dataIndex: ['animal', 'earring_identification'],
      key: 'identification',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Conformação (C)',
      dataIndex: 'avgConformation',
      key: 'avgConformation',
      align: 'center',
      render: (value) => (
        <div>
          <div style={{ fontWeight: 'bold', color: getScoreColor(value) }}>
            {value.toFixed(2)}
          </div>
          <Tag color={getScoreColor(value)} style={{ marginTop: '4px' }}>
            {getScoreLabel(value)}
          </Tag>
        </div>
      ),
      sorter: (a, b) => b.avgConformation - a.avgConformation,
    },
    {
      title: 'Precocidade (P)',
      dataIndex: 'avgPrecocity',
      key: 'avgPrecocity',
      align: 'center',
      render: (value) => (
        <div>
          <div style={{ fontWeight: 'bold', color: getScoreColor(value) }}>
            {value.toFixed(2)}
          </div>
          <Tag color={getScoreColor(value)} style={{ marginTop: '4px' }}>
            {getScoreLabel(value)}
          </Tag>
        </div>
      ),
      sorter: (a, b) => b.avgPrecocity - a.avgPrecocity,
    },
    {
      title: 'Musculatura (M)',
      dataIndex: 'avgMusculature',
      key: 'avgMusculature',
      align: 'center',
      render: (value) => (
        <div>
          <div style={{ fontWeight: 'bold', color: getScoreColor(value) }}>
            {value.toFixed(2)}
          </div>
          <Tag color={getScoreColor(value)} style={{ marginTop: '4px' }}>
            {getScoreLabel(value)}
          </Tag>
        </div>
      ),
      sorter: (a, b) => b.avgMusculature - a.avgMusculature,
    },
    {
      title: 'Média CPM',
      dataIndex: 'avgCPM',
      key: 'avgCPM',
      align: 'center',
      render: (value) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: getScoreColor(value) }}>
            {value.toFixed(2)}
          </div>
          <Tag color={getScoreColor(value)} style={{ marginTop: '4px' }}>
            {getScoreLabel(value)}
          </Tag>
        </div>
      ),
      sorter: (a, b) => b.avgCPM - a.avgCPM,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Registros',
      dataIndex: 'totalRecords',
      key: 'totalRecords',
      align: 'center',
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
  ];

  // Filtrar animais para o select
  const filteredAnimalsForSelect = animals.filter(a => {
    if (selectedProperty && a.property_id !== selectedProperty) return false;
    if (selectedHerd && a.herd_id !== selectedHerd) return false;
    return true;
  });

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Filtros */}
      <Card title="Filtros" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Fazenda
              </label>
              <Select
                showSearch
                placeholder="Selecione uma fazenda"
                style={{ width: '100%' }}
                value={selectedProperty}
                onChange={setSelectedProperty}
                optionFilterProp="children"
              >
                {properties.map(property => (
                  <Option key={property.id} value={property.id}>
                    {property.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Rebanho (opcional)
              </label>
              <Select
                showSearch
                placeholder="Selecione um rebanho"
                style={{ width: '100%' }}
                value={selectedHerd}
                onChange={setSelectedHerd}
                optionFilterProp="children"
                allowClear
                disabled={!selectedProperty}
              >
                {herds.map(herd => (
                  <Option key={herd.id} value={herd.id}>
                    {herd.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Animal Específico (opcional)
              </label>
              <Select
                showSearch
                placeholder="Todos os animais"
                style={{ width: '100%' }}
                value={selectedAnimal}
                onChange={setSelectedAnimal}
                optionFilterProp="children"
                allowClear
                disabled={!selectedProperty}
              >
                {filteredAnimalsForSelect.map(animal => (
                  <Option key={animal.id} value={animal.id}>
                    {animal.name || animal.earring_identification || animal.id}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : !selectedProperty ? (
        <Card>
          <Empty description="Selecione uma fazenda para visualizar o relatório" />
        </Card>
      ) : reportData && reportData.totalAnimals > 0 ? (
        <>
          {/* Estatísticas Gerais */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Animais Avaliados"
                  value={reportData.totalAnimals}
                  prefix={<FaChartArea style={{ color: '#16a34a' }} />}
                  valueStyle={{ color: '#16a34a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Conformação Média"
                  value={reportData.overallStats.avgConformation.toFixed(2)}
                  prefix={<FaStar style={{ color: '#3b82f6' }} />}
                  valueStyle={{ color: '#3b82f6' }}
                  suffix="/ 5"
                />
                <Progress 
                  percent={(reportData.overallStats.avgConformation / 5) * 100} 
                  strokeColor="#3b82f6"
                  showInfo={false}
                  style={{ marginTop: '10px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Precocidade Média"
                  value={reportData.overallStats.avgPrecocity.toFixed(2)}
                  prefix={<FaTrophy style={{ color: '#8b5cf6' }} />}
                  valueStyle={{ color: '#8b5cf6' }}
                  suffix="/ 5"
                />
                <Progress 
                  percent={(reportData.overallStats.avgPrecocity / 5) * 100} 
                  strokeColor="#8b5cf6"
                  showInfo={false}
                  style={{ marginTop: '10px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Musculatura Média"
                  value={reportData.overallStats.avgMusculature.toFixed(2)}
                  prefix={<FaAward style={{ color: '#ec4899' }} />}
                  valueStyle={{ color: '#ec4899' }}
                  suffix="/ 5"
                />
                <Progress 
                  percent={(reportData.overallStats.avgMusculature / 5) * 100} 
                  strokeColor="#ec4899"
                  showInfo={false}
                  style={{ marginTop: '10px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Gráficos */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} md={12}>
              <Card title="Médias Gerais CPM" style={{ height: '450px' }}>
                {radarData ? (
                  <div style={{ height: '350px' }}>
                    <Radar data={radarData} options={radarOptions} />
                  </div>
                ) : (
                  <Empty description="Sem dados CPM" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Top 10 - Detalhamento CPM" style={{ height: '450px' }}>
                {barData ? (
                  <div style={{ height: '350px' }}>
                    <Bar data={barData} options={barOptions} />
                  </div>
                ) : (
                  <Empty description="Sem dados CPM" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Tabela Classificação Geral */}
          <Card title="🏆 Classificação Geral - CPM" style={{ marginBottom: '20px' }}>
            <Table
              dataSource={reportData.sortedByCPM}
              columns={columns}
              rowKey={(record) => record.animal.id}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} animais avaliados`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>

          {/* Rankings por Critério */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Card title="🥇 Top 5 - Conformação" style={{ marginBottom: '20px' }}>
                <Table
                  dataSource={reportData.sortedByConformation.slice(0, 5)}
                  columns={[
                    {
                      title: '#',
                      key: 'pos',
                      render: (_, __, index) => `${index + 1}º`,
                      width: 50,
                    },
                    {
                      title: 'Animal',
                      render: (record) => record.animal.name || record.animal.earring_identification || 'N/A',
                    },
                    {
                      title: 'Nota',
                      dataIndex: 'avgConformation',
                      align: 'center',
                      render: (value) => (
                        <Tag color={getScoreColor(value)}>
                          {value.toFixed(2)}
                        </Tag>
                      ),
                    },
                  ]}
                  rowKey={(record) => record.animal.id}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="🥇 Top 5 - Precocidade" style={{ marginBottom: '20px' }}>
                <Table
                  dataSource={reportData.sortedByPrecocity.slice(0, 5)}
                  columns={[
                    {
                      title: '#',
                      key: 'pos',
                      render: (_, __, index) => `${index + 1}º`,
                      width: 50,
                    },
                    {
                      title: 'Animal',
                      render: (record) => record.animal.name || record.animal.earring_identification || 'N/A',
                    },
                    {
                      title: 'Nota',
                      dataIndex: 'avgPrecocity',
                      align: 'center',
                      render: (value) => (
                        <Tag color={getScoreColor(value)}>
                          {value.toFixed(2)}
                        </Tag>
                      ),
                    },
                  ]}
                  rowKey={(record) => record.animal.id}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="🥇 Top 5 - Musculatura" style={{ marginBottom: '20px' }}>
                <Table
                  dataSource={reportData.sortedByMusculature.slice(0, 5)}
                  columns={[
                    {
                      title: '#',
                      key: 'pos',
                      render: (_, __, index) => `${index + 1}º`,
                      width: 50,
                    },
                    {
                      title: 'Animal',
                      render: (record) => record.animal.name || record.animal.earring_identification || 'N/A',
                    },
                    {
                      title: 'Nota',
                      dataIndex: 'avgMusculature',
                      align: 'center',
                      render: (value) => (
                        <Tag color={getScoreColor(value)}>
                          {value.toFixed(2)}
                        </Tag>
                      ),
                    },
                  ]}
                  rowKey={(record) => record.animal.id}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </>
      ) : reportData ? (
        <Card>
          <Empty description="Nenhum animal com registros CPM encontrado. Certifique-se de que os animais possuem registros de desenvolvimento ponderal com avaliações de Conformação, Precocidade e Musculatura." />
        </Card>
      ) : null}
    </div>
  );
}

