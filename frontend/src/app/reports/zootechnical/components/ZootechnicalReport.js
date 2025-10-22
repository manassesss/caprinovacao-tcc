'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Statistic, Spin, Empty, Divider, Table } from 'antd';
import { FaMale, FaFemale, FaChartLine, FaExchangeAlt } from 'react-icons/fa';
import { getAnimals, getAnimalWeights, getAnimalMovements, getProperties, getHerds } from '@/services/api';
import { Line, Pie } from 'react-chartjs-2';
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

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const { Option } = Select;

export default function ZootechnicalReport() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadProperties();
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
      // A API retorna diretamente um array, não um objeto com data
      setProperties(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Erro ao carregar fazendas:', error);
    }
  };

  const loadHerds = async (propertyId) => {
    try {
      const response = await getHerds();
      // A API retorna diretamente um array, não um objeto com data
      const allHerds = Array.isArray(response) ? response : response.data || [];
      const filteredHerds = allHerds.filter(herd => herd.property_id === propertyId);
      setHerds(filteredHerds || []);
    } catch (error) {
      console.error('Erro ao carregar rebanhos:', error);
    }
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Buscar animais
      const animalsResponse = await getAnimals();
      let animals = Array.isArray(animalsResponse) ? animalsResponse : animalsResponse.data || [];

      // Filtrar por fazenda
      if (selectedProperty) {
        animals = animals.filter(animal => animal.property_id === selectedProperty);
      }

      // Filtrar por rebanho se selecionado
      if (selectedHerd) {
        animals = animals.filter(animal => animal.herd_id === selectedHerd);
      }

      // Calcular estatísticas de gênero
      // O backend armazena como 'M' (Macho) ou 'F' (Fêmea)
      const males = animals.filter(a => a.gender === 'M').length;
      const females = animals.filter(a => a.gender === 'F').length;

      // Buscar movimentações
      const movementsResponse = await getAnimalMovements();
      let movements = Array.isArray(movementsResponse) ? movementsResponse : movementsResponse.data || [];

      // Filtrar movimentações pelos animais selecionados
      const animalIds = animals.map(a => a.id);
      movements = movements.filter(m => animalIds.includes(m.animal_id));

      // Calcular distribuição de movimentações
      // O backend armazena o motivo no campo 'exit_reason'
      const movementCounts = {
        venda: movements.filter(m => m.exit_reason === 'venda').length,
        morte: movements.filter(m => m.exit_reason === 'morte').length,
        roubo: movements.filter(m => m.exit_reason === 'roubo').length,
        alimentacao: movements.filter(m => m.exit_reason === 'alimentacao').length,
        emprestimo: movements.filter(m => m.exit_reason === 'emprestimo').length,
      };

      // Buscar pesos e calcular curva de crescimento
      const growthData = await calculateGrowthCurve(animals);

      setReportData({
        totalAnimals: animals.length,
        males,
        females,
        movementCounts,
        growthData,
        animals,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowthCurve = async (animals) => {
    // Buscar pesos de todos os animais
    const growthByAge = { 60: [], 120: [], 180: [] };

    for (const animal of animals) {
      try {
        const weightsResponse = await getAnimalWeights(animal.id);
        const weights = Array.isArray(weightsResponse) ? weightsResponse : weightsResponse.data || [];

        // Calcular idade em dias para cada peso
        const birthDate = new Date(animal.birth_date);
        
        weights.forEach(weight => {
          const weightDate = new Date(weight.measurement_date);
          const ageInDays = Math.floor((weightDate - birthDate) / (1000 * 60 * 60 * 24));

          // Ajustar para os marcos de 60, 120 e 180 dias (± 15 dias de tolerância)
          if (ageInDays >= 45 && ageInDays <= 75) {
            growthByAge[60].push(weight.weight);
          } else if (ageInDays >= 105 && ageInDays <= 135) {
            growthByAge[120].push(weight.weight);
          } else if (ageInDays >= 165 && ageInDays <= 195) {
            growthByAge[180].push(weight.weight);
          }
        });
      } catch (error) {
        console.error(`Erro ao buscar pesos do animal ${animal.id}:`, error);
      }
    }

    // Calcular médias
    const averages = {};
    Object.keys(growthByAge).forEach(age => {
      const weights = growthByAge[age];
      averages[age] = weights.length > 0
        ? (weights.reduce((sum, w) => sum + w, 0) / weights.length).toFixed(2)
        : 0;
    });

    return averages;
  };

  // Dados para gráfico de pizza (gênero)
  const genderChartData = reportData ? {
    labels: ['Machos', 'Fêmeas'],
    datasets: [{
      data: [reportData.males, reportData.females],
      backgroundColor: ['#3b82f6', '#ec4899'],
      borderColor: ['#2563eb', '#db2777'],
      borderWidth: 2,
    }],
  } : null;

  // Dados para gráfico de pizza (movimentações)
  const movementChartData = reportData ? {
    labels: ['Venda', 'Morte', 'Roubo', 'Alimentação', 'Empréstimo'],
    datasets: [{
      data: [
        reportData.movementCounts.venda,
        reportData.movementCounts.morte,
        reportData.movementCounts.roubo,
        reportData.movementCounts.alimentacao,
        reportData.movementCounts.emprestimo,
      ],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'],
      borderColor: ['#059669', '#dc2626', '#d97706', '#7c3aed', '#0891b2'],
      borderWidth: 2,
    }],
  } : null;

  // Dados para curva de crescimento
  const growthChartData = reportData ? {
    labels: ['60 dias', '120 dias', '180 dias'],
    datasets: [{
      label: 'Peso Médio (kg)',
      data: [
        parseFloat(reportData.growthData[60]) || 0,
        parseFloat(reportData.growthData[120]) || 0,
        parseFloat(reportData.growthData[180]) || 0,
      ],
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: '#16a34a',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const growthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Curva de Crescimento (Peso Ajustado)',
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
          text: 'Peso (kg)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Idade',
        },
      },
    },
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Filtros */}
      <Card title="Filtros" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
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
          <Col xs={24} md={12}>
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
      ) : reportData ? (
        <>
          {/* Estatísticas Gerais */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Total de Animais"
                  value={reportData.totalAnimals}
                  prefix={<FaChartLine style={{ color: '#16a34a' }} />}
                  valueStyle={{ color: '#16a34a' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Machos"
                  value={reportData.males}
                  prefix={<FaMale style={{ color: '#3b82f6' }} />}
                  valueStyle={{ color: '#3b82f6' }}
                  suffix={`(${reportData.totalAnimals > 0 ? ((reportData.males / reportData.totalAnimals) * 100).toFixed(1) : 0}%)`}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Fêmeas"
                  value={reportData.females}
                  prefix={<FaFemale style={{ color: '#ec4899' }} />}
                  valueStyle={{ color: '#ec4899' }}
                  suffix={`(${reportData.totalAnimals > 0 ? ((reportData.females / reportData.totalAnimals) * 100).toFixed(1) : 0}%)`}
                />
              </Card>
            </Col>
          </Row>

          {/* Gráficos */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} md={12}>
              <Card title="Distribuição por Gênero" style={{ height: '400px' }}>
                {genderChartData && reportData.totalAnimals > 0 ? (
                  <div style={{ height: '300px' }}>
                    <Pie data={genderChartData} options={chartOptions} />
                  </div>
                ) : (
                  <Empty description="Sem dados de gênero" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Distribuição de Movimentações" style={{ height: '400px' }}>
                {movementChartData && Object.values(reportData.movementCounts).some(v => v > 0) ? (
                  <div style={{ height: '300px' }}>
                    <Pie data={movementChartData} options={chartOptions} />
                  </div>
                ) : (
                  <Empty description="Sem movimentações registradas" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Curva de Crescimento */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24}>
              <Card title="Curva de Crescimento" style={{ minHeight: '400px' }}>
                {growthChartData && Object.values(reportData.growthData).some(v => v > 0) ? (
                  <div style={{ height: '350px' }}>
                    <Line data={growthChartData} options={growthChartOptions} />
                  </div>
                ) : (
                  <Empty description="Sem dados de peso registrados para os marcos de 60, 120 e 180 dias" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Tabela de Movimentações */}
          <Card title="Resumo de Movimentações">
            <Table
              dataSource={(() => {
                const totalMovements = Object.values(reportData.movementCounts).reduce((a, b) => a + b, 0);
                const calculatePercentage = (count) => {
                  return totalMovements > 0 ? ((count / totalMovements) * 100).toFixed(1) : '0.0';
                };
                
                return [
                  { key: '1', reason: 'Venda', count: reportData.movementCounts.venda, percentage: `${calculatePercentage(reportData.movementCounts.venda)}%` },
                  { key: '2', reason: 'Morte', count: reportData.movementCounts.morte, percentage: `${calculatePercentage(reportData.movementCounts.morte)}%` },
                  { key: '3', reason: 'Roubo', count: reportData.movementCounts.roubo, percentage: `${calculatePercentage(reportData.movementCounts.roubo)}%` },
                  { key: '4', reason: 'Alimentação', count: reportData.movementCounts.alimentacao, percentage: `${calculatePercentage(reportData.movementCounts.alimentacao)}%` },
                  { key: '5', reason: 'Empréstimo', count: reportData.movementCounts.emprestimo, percentage: `${calculatePercentage(reportData.movementCounts.emprestimo)}%` },
                ];
              })()}
              columns={[
                { title: 'Motivo', dataIndex: 'reason', key: 'reason' },
                { title: 'Quantidade', dataIndex: 'count', key: 'count', align: 'center' },
                { title: 'Percentual', dataIndex: 'percentage', key: 'percentage', align: 'center' },
              ]}
              pagination={false}
            />
          </Card>
        </>
      ) : null}
    </div>
  );
}

