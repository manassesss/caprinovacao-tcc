'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Table, Tag, Statistic, Collapse, DatePicker } from 'antd';
import { FaBaby, FaFemale, FaMale, FaChartPie, FaCalendarAlt } from 'react-icons/fa';
import { getReproductiveManagements, getAnimals, getProperties, getHerds } from '@/services/api';
import { Bar, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

export default function OffspringCountReport() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [dateRange, setDateRange] = useState(null);
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
  }, [selectedProperty, selectedHerd, dateRange]);

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
      // Buscar manejos reprodutivos
      const managementsResponse = await getReproductiveManagements();
      let managements = Array.isArray(managementsResponse) ? managementsResponse : managementsResponse.data || [];

      // Filtrar por fazenda (através do animal matriz)
      if (selectedProperty) {
        const propertyAnimalIds = animals
          .filter(a => a.property_id === selectedProperty)
          .map(a => a.id);
        managements = managements.filter(m => propertyAnimalIds.includes(m.female_id));
      }

      // Filtrar por rebanho se selecionado
      if (selectedHerd) {
        const herdAnimalIds = animals
          .filter(a => a.herd_id === selectedHerd)
          .map(a => a.id);
        managements = managements.filter(m => herdAnimalIds.includes(m.female_id));
      }

      // Filtrar por período de parto se selecionado
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        managements = managements.filter(m => {
          if (!m.birth_date) return false;
          return m.birth_date >= startDate && m.birth_date <= endDate;
        });
      }

      // Filtrar apenas manejos com parição confirmada
      managements = managements.filter(m => m.parturition_status === 'sim');

      // Preparar dados por rebanho
      const byHerd = {};
      const byMother = {};
      const byFather = {};
      
      let totalOffspring = 0;
      let maleOffspring = 0;
      let femaleOffspring = 0;
      const birthTypes = { simples: 0, gemelar: 0, triplo: 0, outros: 0 };

      managements.forEach(management => {
        // Buscar informações da matriz
        const mother = animals.find(a => a.id === management.female_id);
        const father = animals.find(a => a.id === management.male_id);
        
        // Contar filhotes pela lista de offspring_ids
        const offspringCount = management.offspring_ids ? management.offspring_ids.length : 0;
        totalOffspring += offspringCount;

        // Contar por tipo de parto
        const birthType = management.birth_type || 'outros';
        birthTypes[birthType] = (birthTypes[birthType] || 0) + offspringCount;

        // Agrupar por rebanho
        if (mother && mother.herd_id) {
          const herd = herds.find(h => h.id === mother.herd_id);
          const herdName = herd ? herd.name : 'Rebanho Desconhecido';
          
          if (!byHerd[herdName]) {
            byHerd[herdName] = { count: 0, managements: [] };
          }
          byHerd[herdName].count += offspringCount;
          byHerd[herdName].managements.push({
            ...management,
            mother_name: mother.name || mother.earring_identification || 'N/A',
            father_name: father ? (father.name || father.earring_identification || 'N/A') : 'N/A',
            offspring_count: offspringCount,
          });
        }

        // Agrupar por matriz
        const motherName = mother ? (mother.name || mother.earring_identification || mother.id) : 'N/A';
        if (!byMother[motherName]) {
          byMother[motherName] = { count: 0, animal: mother };
        }
        byMother[motherName].count += offspringCount;

        // Agrupar por reprodutor
        if (father) {
          const fatherName = father.name || father.earring_identification || father.id;
          if (!byFather[fatherName]) {
            byFather[fatherName] = { count: 0, animal: father };
          }
          byFather[fatherName].count += offspringCount;
        }

        // Contar gênero dos filhotes
        if (management.offspring_ids) {
          management.offspring_ids.forEach(offspringId => {
            const offspring = animals.find(a => a.id === offspringId);
            if (offspring) {
              if (offspring.gender === 'M') maleOffspring++;
              else if (offspring.gender === 'F') femaleOffspring++;
            }
          });
        }
      });

      setReportData({
        totalOffspring,
        maleOffspring,
        femaleOffspring,
        totalManagements: managements.length,
        birthTypes,
        byHerd,
        byMother,
        byFather,
        managements,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráfico de pizza (distribuição por gênero)
  const genderPieData = reportData ? {
    labels: ['Machos', 'Fêmeas', 'Não Identificado'],
    datasets: [{
      data: [
        reportData.maleOffspring,
        reportData.femaleOffspring,
        reportData.totalOffspring - reportData.maleOffspring - reportData.femaleOffspring,
      ],
      backgroundColor: ['#3b82f6', '#ec4899', '#94a3b8'],
      borderColor: ['#2563eb', '#db2777', '#64748b'],
      borderWidth: 2,
    }],
  } : null;

  // Dados para gráfico de pizza (tipo de parto)
  const birthTypePieData = reportData ? {
    labels: ['Simples', 'Gemelar', 'Triplo', 'Outros'],
    datasets: [{
      data: [
        reportData.birthTypes.simples,
        reportData.birthTypes.gemelar,
        reportData.birthTypes.triplo,
        reportData.birthTypes.outros,
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderColor: ['#059669', '#d97706', '#dc2626', '#7c3aed'],
      borderWidth: 2,
    }],
  } : null;

  // Dados para gráfico de barras (crias por rebanho)
  const herdBarData = reportData && Object.keys(reportData.byHerd).length > 0 ? {
    labels: Object.keys(reportData.byHerd),
    datasets: [{
      label: 'Número de Crias',
      data: Object.keys(reportData.byHerd).map(herd => reportData.byHerd[herd].count),
      backgroundColor: '#16a34a',
      borderColor: '#15803d',
      borderWidth: 2,
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

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Crias por Rebanho',
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
          text: 'Número de Crias',
        },
      },
    },
  };

  // Colunas para tabela de matrizes
  const motherColumns = [
    {
      title: 'Posição',
      key: 'position',
      render: (_, __, index) => index + 1,
      width: 80,
    },
    {
      title: 'Matriz',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Identificação',
      dataIndex: 'identification',
      key: 'identification',
    },
    {
      title: 'Número de Crias',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      sorter: (a, b) => b.count - a.count,
      defaultSortOrder: 'descend',
    },
  ];

  // Colunas para tabela de reprodutores
  const fatherColumns = [
    {
      title: 'Posição',
      key: 'position',
      render: (_, __, index) => index + 1,
      width: 80,
    },
    {
      title: 'Reprodutor',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Identificação',
      dataIndex: 'identification',
      key: 'identification',
    },
    {
      title: 'Número de Crias',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      sorter: (a, b) => b.count - a.count,
      defaultSortOrder: 'descend',
    },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Filtros */}
      <Card title="Filtros" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col xs={24} md={12} lg={8}>
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
          <Col xs={24} md={12} lg={8}>
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
          <Col xs={24} md={12} lg={8}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Período de Parto (opcional)
              </label>
              <RangePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                value={dateRange}
                onChange={setDateRange}
                placeholder={['Data início', 'Data fim']}
                disabled={!selectedProperty}
              />
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
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total de Crias"
                  value={reportData.totalOffspring}
                  prefix={<FaBaby style={{ color: '#16a34a' }} />}
                  valueStyle={{ color: '#16a34a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Crias Machos"
                  value={reportData.maleOffspring}
                  prefix={<FaMale style={{ color: '#3b82f6' }} />}
                  valueStyle={{ color: '#3b82f6' }}
                  suffix={`(${reportData.totalOffspring > 0 ? ((reportData.maleOffspring / reportData.totalOffspring) * 100).toFixed(1) : 0}%)`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Crias Fêmeas"
                  value={reportData.femaleOffspring}
                  prefix={<FaFemale style={{ color: '#ec4899' }} />}
                  valueStyle={{ color: '#ec4899' }}
                  suffix={`(${reportData.totalOffspring > 0 ? ((reportData.femaleOffspring / reportData.totalOffspring) * 100).toFixed(1) : 0}%)`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total de Partos"
                  value={reportData.totalManagements}
                  prefix={<FaCalendarAlt style={{ color: '#f59e0b' }} />}
                  valueStyle={{ color: '#f59e0b' }}
                  suffix={reportData.totalManagements > 0 && reportData.totalOffspring > 0 ? `(${(reportData.totalOffspring / reportData.totalManagements).toFixed(2)} crias/parto)` : ''}
                />
              </Card>
            </Col>
          </Row>

          {/* Gráficos */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} md={8}>
              <Card title="Distribuição por Gênero" style={{ height: '400px' }}>
                {genderPieData && reportData.totalOffspring > 0 ? (
                  <div style={{ height: '300px' }}>
                    <Pie data={genderPieData} options={chartOptions} />
                  </div>
                ) : (
                  <Empty description="Sem crias registradas" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Distribuição por Tipo de Parto" style={{ height: '400px' }}>
                {birthTypePieData && reportData.totalOffspring > 0 ? (
                  <div style={{ height: '300px' }}>
                    <Pie data={birthTypePieData} options={chartOptions} />
                  </div>
                ) : (
                  <Empty description="Sem partos registrados" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Resumo de Tipo de Parto" style={{ height: '400px' }}>
                <Table
                  dataSource={[
                    { key: '1', type: 'Simples', count: reportData.birthTypes.simples },
                    { key: '2', type: 'Gemelar', count: reportData.birthTypes.gemelar },
                    { key: '3', type: 'Triplo', count: reportData.birthTypes.triplo },
                    { key: '4', type: 'Outros', count: reportData.birthTypes.outros },
                  ]}
                  columns={[
                    { title: 'Tipo', dataIndex: 'type', key: 'type' },
                    { title: 'Crias', dataIndex: 'count', key: 'count', align: 'center' },
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* Gráfico de barras - Crias por Rebanho */}
          {herdBarData && (
            <Row gutter={16} style={{ marginBottom: '20px' }}>
              <Col xs={24}>
                <Card title="Crias por Rebanho" style={{ minHeight: '400px' }}>
                  <div style={{ height: '350px' }}>
                    <Bar data={herdBarData} options={barChartOptions} />
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* Rankings */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} md={12}>
              <Card title="🏆 Ranking de Matrizes (Top 10)">
                <Table
                  dataSource={Object.keys(reportData.byMother)
                    .map(name => ({
                      name,
                      identification: reportData.byMother[name].animal?.earring_identification || 'N/A',
                      count: reportData.byMother[name].count,
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)}
                  columns={motherColumns}
                  rowKey="name"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="🏆 Ranking de Reprodutores (Top 10)">
                <Table
                  dataSource={Object.keys(reportData.byFather)
                    .map(name => ({
                      name,
                      identification: reportData.byFather[name].animal?.earring_identification || 'N/A',
                      count: reportData.byFather[name].count,
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)}
                  columns={fatherColumns}
                  rowKey="name"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* Detalhamento por Rebanho */}
          {Object.keys(reportData.byHerd).length > 0 && (
            <Card title="Detalhamento por Rebanho">
              <Collapse>
                {Object.keys(reportData.byHerd).map(herdName => (
                  <Panel 
                    header={`${herdName} - ${reportData.byHerd[herdName].count} crias`} 
                    key={herdName}
                  >
                    <Table
                      dataSource={reportData.byHerd[herdName].managements}
                      columns={[
                        { 
                          title: 'Matriz', 
                          dataIndex: 'mother_name', 
                          key: 'mother_name' 
                        },
                        { 
                          title: 'Reprodutor', 
                          dataIndex: 'father_name', 
                          key: 'father_name' 
                        },
                        { 
                          title: 'Data do Parto', 
                          dataIndex: 'birth_date', 
                          key: 'birth_date',
                          render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
                        },
                        { 
                          title: 'Tipo de Parto', 
                          dataIndex: 'birth_type', 
                          key: 'birth_type',
                          align: 'center',
                          render: (type) => <Tag color="blue">{type || 'N/A'}</Tag>,
                        },
                        { 
                          title: 'Nº de Crias', 
                          dataIndex: 'offspring_count', 
                          key: 'offspring_count',
                          align: 'center',
                        },
                      ]}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </Panel>
                ))}
              </Collapse>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}

