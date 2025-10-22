'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Table, Tag, Statistic, DatePicker } from 'antd';
import { FaShoppingBag, FaSkullCrossbones, FaBan, FaUtensils, FaHandshake, FaExchangeAlt } from 'react-icons/fa';
import { getAnimalMovements, getAnimals, getProperties, getHerds } from '@/services/api';
import { Pie, Line } from 'react-chartjs-2';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AnimalMovementsReport() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Mapeamento de motivos de saída
  const exitReasonLabels = {
    venda: 'Venda',
    morte: 'Morte',
    roubo: 'Roubo',
    alimentacao: 'Alimentação',
    emprestimo: 'Empréstimo',
  };

  const exitReasonColors = {
    venda: '#10b981',
    morte: '#ef4444',
    roubo: '#f59e0b',
    alimentacao: '#8b5cf6',
    emprestimo: '#06b6d4',
  };

  const exitReasonIcons = {
    venda: <FaShoppingBag />,
    morte: <FaSkullCrossbones />,
    roubo: <FaBan />,
    alimentacao: <FaUtensils />,
    emprestimo: <FaHandshake />,
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
  }, [selectedProperty, selectedHerd, selectedReason, dateRange]);

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
      // Buscar movimentações
      const movementsResponse = await getAnimalMovements();
      let movements = Array.isArray(movementsResponse) ? movementsResponse : movementsResponse.data || [];

      // Filtrar por animais da fazenda selecionada
      if (selectedProperty) {
        const propertyAnimalIds = animals
          .filter(a => a.property_id === selectedProperty)
          .map(a => a.id);
        movements = movements.filter(m => propertyAnimalIds.includes(m.animal_id));
      }

      // Filtrar por rebanho se selecionado
      if (selectedHerd) {
        const herdAnimalIds = animals
          .filter(a => a.herd_id === selectedHerd)
          .map(a => a.id);
        movements = movements.filter(m => herdAnimalIds.includes(m.animal_id));
      }

      // Filtrar por motivo de saída se selecionado
      if (selectedReason) {
        movements = movements.filter(m => m.exit_reason === selectedReason);
      }

      // Filtrar por período se selecionado
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        movements = movements.filter(m => {
          if (!m.movement_date) return false;
          return m.movement_date >= startDate && m.movement_date <= endDate;
        });
      }

      // Agrupar por motivo de saída
      const groupedByReason = {
        venda: [],
        morte: [],
        roubo: [],
        alimentacao: [],
        emprestimo: [],
      };

      movements.forEach(movement => {
        const reason = movement.exit_reason;
        if (groupedByReason[reason]) {
          groupedByReason[reason].push(movement);
        }
      });

      // Calcular estatísticas
      const statistics = {
        total: movements.length,
        venda: groupedByReason.venda.length,
        morte: groupedByReason.morte.length,
        roubo: groupedByReason.roubo.length,
        alimentacao: groupedByReason.alimentacao.length,
        emprestimo: groupedByReason.emprestimo.length,
      };

      // Preparar dados detalhados para a tabela
      const detailedData = movements.map(movement => {
        const animal = animals.find(a => a.id === movement.animal_id);
        return {
          ...movement,
          animal_name: animal ? animal.name || animal.earring_identification || 'N/A' : 'N/A',
          animal_identification: animal ? animal.earring_identification || 'N/A' : 'N/A',
          exit_reason_label: exitReasonLabels[movement.exit_reason] || 'Outros',
        };
      });

      // Preparar dados para gráfico de linha (evolução temporal)
      const movementsByMonth = {};
      movements.forEach(movement => {
        if (movement.movement_date) {
          const month = dayjs(movement.movement_date).format('MM/YYYY');
          if (!movementsByMonth[month]) {
            movementsByMonth[month] = { venda: 0, morte: 0, roubo: 0, alimentacao: 0, emprestimo: 0 };
          }
          movementsByMonth[month][movement.exit_reason] = (movementsByMonth[month][movement.exit_reason] || 0) + 1;
        }
      });

      setReportData({
        movements: detailedData,
        groupedByReason,
        statistics,
        movementsByMonth,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráfico de pizza
  const pieChartData = reportData ? {
    labels: ['Venda', 'Morte', 'Roubo', 'Alimentação', 'Empréstimo'],
    datasets: [{
      data: [
        reportData.statistics.venda,
        reportData.statistics.morte,
        reportData.statistics.roubo,
        reportData.statistics.alimentacao,
        reportData.statistics.emprestimo,
      ],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'],
      borderColor: ['#059669', '#dc2626', '#d97706', '#7c3aed', '#0891b2'],
      borderWidth: 2,
    }],
  } : null;

  // Dados para gráfico de linha (evolução temporal)
  const lineChartData = reportData && Object.keys(reportData.movementsByMonth).length > 0 ? {
    labels: Object.keys(reportData.movementsByMonth).sort((a, b) => {
      const [monthA, yearA] = a.split('/');
      const [monthB, yearB] = b.split('/');
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    }),
    datasets: [
      {
        label: 'Venda',
        data: Object.keys(reportData.movementsByMonth).sort().map(month => reportData.movementsByMonth[month].venda),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Morte',
        data: Object.keys(reportData.movementsByMonth).sort().map(month => reportData.movementsByMonth[month].morte),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Roubo',
        data: Object.keys(reportData.movementsByMonth).sort().map(month => reportData.movementsByMonth[month].roubo),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Alimentação',
        data: Object.keys(reportData.movementsByMonth).sort().map(month => reportData.movementsByMonth[month].alimentacao),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Empréstimo',
        data: Object.keys(reportData.movementsByMonth).sort().map(month => reportData.movementsByMonth[month].emprestimo),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
      },
    ],
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

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução Temporal das Movimentações',
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
          text: 'Quantidade',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Mês/Ano',
        },
      },
    },
  };

  // Colunas da tabela
  const columns = [
    {
      title: 'Animal',
      dataIndex: 'animal_identification',
      key: 'animal_identification',
    },
    {
      title: 'Nome',
      dataIndex: 'animal_name',
      key: 'animal_name',
    },
    {
      title: 'Data',
      dataIndex: 'movement_date',
      key: 'movement_date',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
      sorter: (a, b) => new Date(a.movement_date) - new Date(b.movement_date),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Motivo',
      dataIndex: 'exit_reason_label',
      key: 'exit_reason_label',
      align: 'center',
      render: (text, record) => {
        const color = exitReasonColors[record.exit_reason] || '#gray';
        const icon = exitReasonIcons[record.exit_reason];
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Peso (kg)',
      dataIndex: 'weight',
      key: 'weight',
      align: 'center',
      render: (weight) => weight ? weight.toFixed(2) : 'N/A',
    },
    {
      title: 'Observações',
      dataIndex: 'observations',
      key: 'observations',
      render: (text) => text || '-',
      ellipsis: true,
    },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Filtros */}
      <Card title="Filtros" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col xs={24} md={12} lg={6}>
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
          <Col xs={24} md={12} lg={6}>
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
          <Col xs={24} md={12} lg={6}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Motivo (opcional)
              </label>
              <Select
                placeholder="Todos os motivos"
                style={{ width: '100%' }}
                value={selectedReason}
                onChange={setSelectedReason}
                allowClear
                disabled={!selectedProperty}
              >
                <Option value="venda">Venda</Option>
                <Option value="morte">Morte</Option>
                <Option value="roubo">Roubo</Option>
                <Option value="alimentacao">Alimentação</Option>
                <Option value="emprestimo">Empréstimo</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Período (opcional)
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
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Total"
                  value={reportData.statistics.total}
                  prefix={<FaExchangeAlt style={{ color: '#16a34a' }} />}
                  valueStyle={{ color: '#16a34a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Vendas"
                  value={reportData.statistics.venda}
                  prefix={<FaShoppingBag style={{ color: '#10b981' }} />}
                  valueStyle={{ color: '#10b981' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Mortes"
                  value={reportData.statistics.morte}
                  prefix={<FaSkullCrossbones style={{ color: '#ef4444' }} />}
                  valueStyle={{ color: '#ef4444' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Roubos"
                  value={reportData.statistics.roubo}
                  prefix={<FaBan style={{ color: '#f59e0b' }} />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Alimentação"
                  value={reportData.statistics.alimentacao}
                  prefix={<FaUtensils style={{ color: '#8b5cf6' }} />}
                  valueStyle={{ color: '#8b5cf6' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Empréstimos"
                  value={reportData.statistics.emprestimo}
                  prefix={<FaHandshake style={{ color: '#06b6d4' }} />}
                  valueStyle={{ color: '#06b6d4' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Gráficos */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} md={12}>
              <Card title="Distribuição por Motivo" style={{ height: '400px' }}>
                {pieChartData && reportData.statistics.total > 0 ? (
                  <div style={{ height: '300px' }}>
                    <Pie data={pieChartData} options={chartOptions} />
                  </div>
                ) : (
                  <Empty description="Sem movimentações registradas" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Resumo por Motivo" style={{ height: '400px' }}>
                <Table
                  dataSource={[
                    { key: '1', reason: 'Venda', count: reportData.statistics.venda, percentage: `${reportData.statistics.total > 0 ? ((reportData.statistics.venda / reportData.statistics.total) * 100).toFixed(1) : 0}%` },
                    { key: '2', reason: 'Morte', count: reportData.statistics.morte, percentage: `${reportData.statistics.total > 0 ? ((reportData.statistics.morte / reportData.statistics.total) * 100).toFixed(1) : 0}%` },
                    { key: '3', reason: 'Roubo', count: reportData.statistics.roubo, percentage: `${reportData.statistics.total > 0 ? ((reportData.statistics.roubo / reportData.statistics.total) * 100).toFixed(1) : 0}%` },
                    { key: '4', reason: 'Alimentação', count: reportData.statistics.alimentacao, percentage: `${reportData.statistics.total > 0 ? ((reportData.statistics.alimentacao / reportData.statistics.total) * 100).toFixed(1) : 0}%` },
                    { key: '5', reason: 'Empréstimo', count: reportData.statistics.emprestimo, percentage: `${reportData.statistics.total > 0 ? ((reportData.statistics.emprestimo / reportData.statistics.total) * 100).toFixed(1) : 0}%` },
                  ]}
                  columns={[
                    { title: 'Motivo', dataIndex: 'reason', key: 'reason' },
                    { title: 'Quantidade', dataIndex: 'count', key: 'count', align: 'center' },
                    { title: 'Percentual', dataIndex: 'percentage', key: 'percentage', align: 'center' },
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* Evolução Temporal */}
          {lineChartData && (
            <Row gutter={16} style={{ marginBottom: '20px' }}>
              <Col xs={24}>
                <Card title="Evolução Temporal das Movimentações" style={{ minHeight: '400px' }}>
                  <div style={{ height: '350px' }}>
                    <Line data={lineChartData} options={lineChartOptions} />
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* Tabela Detalhada */}
          <Card title="Listagem Detalhada de Movimentações">
            <Table
              dataSource={reportData.movements}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} movimentações`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </>
      ) : null}
    </div>
  );
}

