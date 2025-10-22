'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Table, Statistic, Progress, Tag } from 'antd';
import { FaRuler, FaChartLine, FaTrophy, FaAward } from 'react-icons/fa';
import { getAnimals, getAnimalCarcassMeasurements, getProperties, getHerds } from '@/services/api';
import { Radar, Line, Bar } from 'react-chartjs-2';
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

export default function FatThicknessReport() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Labels das medidas
  const measurementLabels = {
    egs: 'EGS - Espessura de Gordura Subcutânea',
    egbf: 'EGBF - Espessura de Gordura de Braço de Fêmur',
    ege: 'EGE - Espessura de Gordura Esternal',
    aol: 'AOL - Área de Olho de Lombo',
  };

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

      // Buscar medidas de carcaça para cada animal
      const animalsCarcassData = [];
      
      for (const animal of filteredAnimals) {
        try {
          const measurementsResponse = await getAnimalCarcassMeasurements(animal.id);
          const measurements = Array.isArray(measurementsResponse) ? measurementsResponse : measurementsResponse.data || [];
          
          // Filtrar apenas registros com dados de espessura de gordura
          const fatMeasurements = measurements.filter(m => 
            m.egs !== null || m.egbf !== null || m.ege !== null
          );

          if (fatMeasurements.length > 0) {
            // Calcular médias para o animal
            const avgEGS = fatMeasurements
              .filter(m => m.egs !== null)
              .reduce((sum, m) => sum + m.egs, 0) / fatMeasurements.filter(m => m.egs !== null).length || 0;
            
            const avgEGBF = fatMeasurements
              .filter(m => m.egbf !== null)
              .reduce((sum, m) => sum + m.egbf, 0) / fatMeasurements.filter(m => m.egbf !== null).length || 0;
            
            const avgEGE = fatMeasurements
              .filter(m => m.ege !== null)
              .reduce((sum, m) => sum + m.ege, 0) / fatMeasurements.filter(m => m.ege !== null).length || 0;

            const avgAOL = fatMeasurements
              .filter(m => m.aol !== null)
              .reduce((sum, m) => sum + m.aol, 0) / fatMeasurements.filter(m => m.aol !== null).length || 0;

            const avgTotal = ((avgEGS || 0) + (avgEGBF || 0) + (avgEGE || 0)) / 3;

            animalsCarcassData.push({
              animal,
              measurements: fatMeasurements,
              avgEGS,
              avgEGBF,
              avgEGE,
              avgAOL,
              avgTotal,
              totalRecords: fatMeasurements.length,
              lastMeasurement: fatMeasurements[fatMeasurements.length - 1],
            });
          }
        } catch (error) {
          console.error(`Erro ao carregar medidas do animal ${animal.id}:`, error);
        }
      }

      // Calcular médias gerais
      let totalEGS = 0;
      let totalEGBF = 0;
      let totalEGE = 0;
      let totalAOL = 0;
      let count = animalsCarcassData.length;

      animalsCarcassData.forEach(data => {
        totalEGS += data.avgEGS || 0;
        totalEGBF += data.avgEGBF || 0;
        totalEGE += data.avgEGE || 0;
        totalAOL += data.avgAOL || 0;
      });

      const overallStats = {
        avgEGS: count > 0 ? totalEGS / count : 0,
        avgEGBF: count > 0 ? totalEGBF / count : 0,
        avgEGE: count > 0 ? totalEGE / count : 0,
        avgAOL: count > 0 ? totalAOL / count : 0,
      };

      // Ordenar por média total
      const sortedByTotal = [...animalsCarcassData].sort((a, b) => b.avgTotal - a.avgTotal);
      const sortedByEGS = [...animalsCarcassData].sort((a, b) => (b.avgEGS || 0) - (a.avgEGS || 0));
      const sortedByEGBF = [...animalsCarcassData].sort((a, b) => (b.avgEGBF || 0) - (a.avgEGBF || 0));
      const sortedByEGE = [...animalsCarcassData].sort((a, b) => (b.avgEGE || 0) - (a.avgEGE || 0));

      setReportData({
        animalsCarcassData,
        overallStats,
        totalAnimals: count,
        sortedByTotal,
        sortedByEGS,
        sortedByEGBF,
        sortedByEGE,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráfico radar (médias gerais)
  const radarData = reportData ? {
    labels: ['EGS', 'EGBF', 'EGE', 'AOL'],
    datasets: [{
      label: 'Médias Gerais (mm)',
      data: [
        reportData.overallStats.avgEGS,
        reportData.overallStats.avgEGBF,
        reportData.overallStats.avgEGE,
        reportData.overallStats.avgAOL,
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

  // Dados para gráfico de barras (Top 10)
  const barData = reportData && reportData.sortedByTotal.length > 0 ? {
    labels: reportData.sortedByTotal.slice(0, 10).map(d => 
      d.animal.name || d.animal.earring_identification || d.animal.id
    ),
    datasets: [
      {
        label: 'EGS',
        data: reportData.sortedByTotal.slice(0, 10).map(d => d.avgEGS || 0),
        backgroundColor: '#3b82f6',
      },
      {
        label: 'EGBF',
        data: reportData.sortedByTotal.slice(0, 10).map(d => d.avgEGBF || 0),
        backgroundColor: '#8b5cf6',
      },
      {
        label: 'EGE',
        data: reportData.sortedByTotal.slice(0, 10).map(d => d.avgEGE || 0),
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
        text: 'Médias Gerais - Medidas de Carcaça',
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
        text: 'Top 10 Animais - Espessura de Gordura',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Espessura (mm)',
        },
      },
    },
  };

  // Função para obter cor baseada no valor
  const getValueColor = (value) => {
    if (value >= 5) return '#10b981'; // Verde - Ótimo
    if (value >= 3) return '#84cc16'; // Verde claro - Bom
    if (value >= 2) return '#f59e0b'; // Laranja - Regular
    return '#ef4444'; // Vermelho - Baixo
  };

  const getValueLabel = (value) => {
    if (value >= 5) return 'Ótimo';
    if (value >= 3) return 'Bom';
    if (value >= 2) return 'Regular';
    return 'Baixo';
  };

  // Colunas da tabela principal
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
      title: 'EGS (mm)',
      dataIndex: 'avgEGS',
      key: 'avgEGS',
      align: 'center',
      render: (value) => value ? (
        <div>
          <div style={{ fontWeight: 'bold', color: getValueColor(value) }}>
            {value.toFixed(2)}
          </div>
          <Tag color={getValueColor(value)} style={{ marginTop: '4px' }}>
            {getValueLabel(value)}
          </Tag>
        </div>
      ) : '-',
      sorter: (a, b) => (b.avgEGS || 0) - (a.avgEGS || 0),
    },
    {
      title: 'EGBF (mm)',
      dataIndex: 'avgEGBF',
      key: 'avgEGBF',
      align: 'center',
      render: (value) => value ? (
        <div>
          <div style={{ fontWeight: 'bold', color: getValueColor(value) }}>
            {value.toFixed(2)}
          </div>
          <Tag color={getValueColor(value)} style={{ marginTop: '4px' }}>
            {getValueLabel(value)}
          </Tag>
        </div>
      ) : '-',
      sorter: (a, b) => (b.avgEGBF || 0) - (a.avgEGBF || 0),
    },
    {
      title: 'EGE (mm)',
      dataIndex: 'avgEGE',
      key: 'avgEGE',
      align: 'center',
      render: (value) => value ? (
        <div>
          <div style={{ fontWeight: 'bold', color: getValueColor(value) }}>
            {value.toFixed(2)}
          </div>
          <Tag color={getValueColor(value)} style={{ marginTop: '4px' }}>
            {getValueLabel(value)}
          </Tag>
        </div>
      ) : '-',
      sorter: (a, b) => (b.avgEGE || 0) - (a.avgEGE || 0),
    },
    {
      title: 'AOL (cm²)',
      dataIndex: 'avgAOL',
      key: 'avgAOL',
      align: 'center',
      render: (value) => value ? (
        <div style={{ fontWeight: 'bold' }}>
          {value.toFixed(2)}
        </div>
      ) : '-',
      sorter: (a, b) => (b.avgAOL || 0) - (a.avgAOL || 0),
    },
    {
      title: 'Média Geral',
      dataIndex: 'avgTotal',
      key: 'avgTotal',
      align: 'center',
      render: (value) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: getValueColor(value) }}>
            {value.toFixed(2)} mm
          </div>
          <Tag color={getValueColor(value)} style={{ marginTop: '4px' }}>
            {getValueLabel(value)}
          </Tag>
        </div>
      ),
      sorter: (a, b) => b.avgTotal - a.avgTotal,
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
                  prefix={<FaRuler style={{ color: '#16a34a' }} />}
                  valueStyle={{ color: '#16a34a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="EGS Média"
                  value={reportData.overallStats.avgEGS.toFixed(2)}
                  prefix={<FaChartLine style={{ color: '#3b82f6' }} />}
                  valueStyle={{ color: '#3b82f6' }}
                  suffix="mm"
                />
                <Tag 
                  color={getValueColor(reportData.overallStats.avgEGS)} 
                  style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}
                >
                  {getValueLabel(reportData.overallStats.avgEGS)}
                </Tag>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="EGBF Média"
                  value={reportData.overallStats.avgEGBF.toFixed(2)}
                  prefix={<FaTrophy style={{ color: '#8b5cf6' }} />}
                  valueStyle={{ color: '#8b5cf6' }}
                  suffix="mm"
                />
                <Tag 
                  color={getValueColor(reportData.overallStats.avgEGBF)} 
                  style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}
                >
                  {getValueLabel(reportData.overallStats.avgEGBF)}
                </Tag>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="EGE Média"
                  value={reportData.overallStats.avgEGE.toFixed(2)}
                  prefix={<FaAward style={{ color: '#ec4899' }} />}
                  valueStyle={{ color: '#ec4899' }}
                  suffix="mm"
                />
                <Tag 
                  color={getValueColor(reportData.overallStats.avgEGE)} 
                  style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}
                >
                  {getValueLabel(reportData.overallStats.avgEGE)}
                </Tag>
              </Card>
            </Col>
          </Row>

          {/* Gráficos */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} md={12}>
              <Card title="Médias Gerais - Medidas de Carcaça" style={{ height: '450px' }}>
                {radarData ? (
                  <div style={{ height: '350px' }}>
                    <Radar data={radarData} options={radarOptions} />
                  </div>
                ) : (
                  <Empty description="Sem dados de carcaça" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Top 10 - Espessura de Gordura" style={{ height: '450px' }}>
                {barData ? (
                  <div style={{ height: '350px' }}>
                    <Bar data={barData} options={barOptions} />
                  </div>
                ) : (
                  <Empty description="Sem dados de carcaça" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Tabela Classificação Geral */}
          <Card title="🏆 Classificação Geral - Espessura de Gordura" style={{ marginBottom: '20px' }}>
            <Table
              dataSource={reportData.sortedByTotal}
              columns={columns}
              rowKey={(record) => record.animal.id}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} animais avaliados`,
              }}
              scroll={{ x: 1400 }}
            />
          </Card>

          {/* Rankings por Critério */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Card title="🥇 Top 5 - EGS (Subcutânea)" style={{ marginBottom: '20px' }}>
                <Table
                  dataSource={reportData.sortedByEGS.slice(0, 5)}
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
                      title: 'Média',
                      dataIndex: 'avgEGS',
                      align: 'center',
                      render: (value) => value ? (
                        <Tag color={getValueColor(value)}>
                          {value.toFixed(2)} mm
                        </Tag>
                      ) : '-',
                    },
                  ]}
                  rowKey={(record) => record.animal.id}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="🥇 Top 5 - EGBF (Braço de Fêmur)" style={{ marginBottom: '20px' }}>
                <Table
                  dataSource={reportData.sortedByEGBF.slice(0, 5)}
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
                      title: 'Média',
                      dataIndex: 'avgEGBF',
                      align: 'center',
                      render: (value) => value ? (
                        <Tag color={getValueColor(value)}>
                          {value.toFixed(2)} mm
                        </Tag>
                      ) : '-',
                    },
                  ]}
                  rowKey={(record) => record.animal.id}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="🥇 Top 5 - EGE (Esternal)" style={{ marginBottom: '20px' }}>
                <Table
                  dataSource={reportData.sortedByEGE.slice(0, 5)}
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
                      title: 'Média',
                      dataIndex: 'avgEGE',
                      align: 'center',
                      render: (value) => value ? (
                        <Tag color={getValueColor(value)}>
                          {value.toFixed(2)} mm
                        </Tag>
                      ) : '-',
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
          <Empty description="Nenhum animal com registros de espessura de gordura encontrado. Certifique-se de que os animais possuem medidas de carcaça cadastradas." />
        </Card>
      ) : null}
    </div>
  );
}

