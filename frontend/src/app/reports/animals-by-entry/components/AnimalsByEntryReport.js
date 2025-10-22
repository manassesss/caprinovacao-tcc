'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Table, Tag, Statistic, DatePicker } from 'antd';
import { FaShoppingCart, FaBaby, FaHandshake, FaEllipsisH } from 'react-icons/fa';
import { getAnimals, getProperties, getHerds, getRaces } from '@/services/api';
import { Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AnimalsByEntryReport() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [herds, setHerds] = useState([]);
  const [races, setRaces] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [selectedEntryReason, setSelectedEntryReason] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Mapeamento de motivos de entrada
  const entryReasonLabels = {
    compra: 'Compra',
    nascimento: 'Nascimento',
    emprestimo: 'Empréstimo',
    outros: 'Outros',
  };

  const entryReasonColors = {
    compra: '#10b981',
    nascimento: '#3b82f6',
    emprestimo: '#f59e0b',
    outros: '#8b5cf6',
  };

  useEffect(() => {
    loadProperties();
    loadRaces();
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
  }, [selectedProperty, selectedHerd, selectedEntryReason, dateRange]);

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

  const loadRaces = async () => {
    try {
      const response = await getRaces();
      setRaces(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Erro ao carregar raças:', error);
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

      // Filtrar por motivo de entrada se selecionado
      if (selectedEntryReason) {
        animals = animals.filter(animal => animal.entry_reason === selectedEntryReason);
      }

      // Filtrar por período de entrada (usando birth_date como proxy)
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        animals = animals.filter(animal => {
          if (!animal.birth_date) return false;
          return animal.birth_date >= startDate && animal.birth_date <= endDate;
        });
      }

      // Agrupar por motivo de entrada
      const groupedByEntryReason = {
        compra: [],
        nascimento: [],
        emprestimo: [],
        outros: [],
      };

      animals.forEach(animal => {
        const reason = animal.entry_reason || 'outros';
        if (groupedByEntryReason[reason]) {
          groupedByEntryReason[reason].push(animal);
        } else {
          groupedByEntryReason.outros.push(animal);
        }
      });

      // Calcular estatísticas
      const statistics = {
        total: animals.length,
        compra: groupedByEntryReason.compra.length,
        nascimento: groupedByEntryReason.nascimento.length,
        emprestimo: groupedByEntryReason.emprestimo.length,
        outros: groupedByEntryReason.outros.length,
      };

      // Preparar dados detalhados para a tabela
      const detailedData = animals.map(animal => {
        const race = races.find(r => r.id === animal.race_id);
        return {
          ...animal,
          race_name: race ? race.name : 'N/A',
          entry_reason_label: entryReasonLabels[animal.entry_reason] || 'Outros',
          gender_label: animal.gender === 'M' ? 'Macho' : animal.gender === 'F' ? 'Fêmea' : 'N/A',
        };
      });

      setReportData({
        animals: detailedData,
        groupedByEntryReason,
        statistics,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráfico de pizza
  const pieChartData = reportData ? {
    labels: ['Compra', 'Nascimento', 'Empréstimo', 'Outros'],
    datasets: [{
      data: [
        reportData.statistics.compra,
        reportData.statistics.nascimento,
        reportData.statistics.emprestimo,
        reportData.statistics.outros,
      ],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
      borderColor: ['#059669', '#2563eb', '#d97706', '#7c3aed'],
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
      title: {
        display: true,
        text: 'Distribuição por Motivo de Entrada',
        font: {
          size: 16,
        },
      },
    },
  };

  // Colunas da tabela
  const columns = [
    {
      title: 'Identificação',
      dataIndex: 'earring_identification',
      key: 'earring_identification',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Sexo',
      dataIndex: 'gender_label',
      key: 'gender_label',
      align: 'center',
      render: (text, record) => (
        <Tag color={record.gender === 'M' ? 'blue' : 'pink'}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Raça',
      dataIndex: 'race_name',
      key: 'race_name',
    },
    {
      title: 'Motivo de Entrada',
      dataIndex: 'entry_reason_label',
      key: 'entry_reason_label',
      align: 'center',
      render: (text, record) => {
        const color = entryReasonColors[record.entry_reason] || entryReasonColors.outros;
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Data de Nascimento',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (text) => text || 'N/A',
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
                Motivo de Entrada (opcional)
              </label>
              <Select
                placeholder="Todos os motivos"
                style={{ width: '100%' }}
                value={selectedEntryReason}
                onChange={setSelectedEntryReason}
                allowClear
                disabled={!selectedProperty}
              >
                <Option value="compra">Compra</Option>
                <Option value="nascimento">Nascimento</Option>
                <Option value="emprestimo">Empréstimo</Option>
                <Option value="outros">Outros</Option>
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
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total de Animais"
                  value={reportData.statistics.total}
                  prefix={<FaEllipsisH style={{ color: '#16a34a' }} />}
                  valueStyle={{ color: '#16a34a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Por Compra"
                  value={reportData.statistics.compra}
                  prefix={<FaShoppingCart style={{ color: '#10b981' }} />}
                  valueStyle={{ color: '#10b981' }}
                  suffix={`(${reportData.statistics.total > 0 ? ((reportData.statistics.compra / reportData.statistics.total) * 100).toFixed(1) : 0}%)`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Por Nascimento"
                  value={reportData.statistics.nascimento}
                  prefix={<FaBaby style={{ color: '#3b82f6' }} />}
                  valueStyle={{ color: '#3b82f6' }}
                  suffix={`(${reportData.statistics.total > 0 ? ((reportData.statistics.nascimento / reportData.statistics.total) * 100).toFixed(1) : 0}%)`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Por Empréstimo"
                  value={reportData.statistics.emprestimo}
                  prefix={<FaHandshake style={{ color: '#f59e0b' }} />}
                  valueStyle={{ color: '#f59e0b' }}
                  suffix={`(${reportData.statistics.total > 0 ? ((reportData.statistics.emprestimo / reportData.statistics.total) * 100).toFixed(1) : 0}%)`}
                />
              </Card>
            </Col>
          </Row>

          {/* Gráfico de Pizza */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} md={12}>
              <Card title="Distribuição por Motivo de Entrada" style={{ height: '400px' }}>
                {pieChartData && reportData.statistics.total > 0 ? (
                  <div style={{ height: '300px' }}>
                    <Pie data={pieChartData} options={chartOptions} />
                  </div>
                ) : (
                  <Empty description="Sem dados para exibir" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Resumo por Motivo" style={{ height: '400px' }}>
                <Table
                  dataSource={[
                    { key: '1', reason: 'Compra', count: reportData.statistics.compra, percentage: `${reportData.statistics.total > 0 ? ((reportData.statistics.compra / reportData.statistics.total) * 100).toFixed(1) : 0}%` },
                    { key: '2', reason: 'Nascimento', count: reportData.statistics.nascimento, percentage: `${reportData.statistics.total > 0 ? ((reportData.statistics.nascimento / reportData.statistics.total) * 100).toFixed(1) : 0}%` },
                    { key: '3', reason: 'Empréstimo', count: reportData.statistics.emprestimo, percentage: `${reportData.statistics.total > 0 ? ((reportData.statistics.emprestimo / reportData.statistics.total) * 100).toFixed(1) : 0}%` },
                    { key: '4', reason: 'Outros', count: reportData.statistics.outros, percentage: `${reportData.statistics.total > 0 ? ((reportData.statistics.outros / reportData.statistics.total) * 100).toFixed(1) : 0}%` },
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

          {/* Tabela Detalhada */}
          <Card title="Listagem Detalhada de Animais">
            <Table
              dataSource={reportData.animals}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} animais`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </>
      ) : null}
    </div>
  );
}

