"use client"
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Select, 
  Typography,
  Breadcrumb,
  Tabs,
  Tag,
  message,
  Spin
} from 'antd';
import { getHerds, getBirthPredictions, getCoverageByReproducer } from '@/services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MatingReports = () => {
  const [loading, setLoading] = useState(false);
  const [herds, setHerds] = useState([]);
  const [selectedHerdId, setSelectedHerdId] = useState(null);
  
  // Dados dos relatórios
  const [birthPredictions, setBirthPredictions] = useState([]);
  const [coverageByReproducer, setCoverageByReproducer] = useState([]);
  
  useEffect(() => {
    loadHerds();
  }, []);
  
  useEffect(() => {
    if (selectedHerdId) {
      loadReports();
    }
  }, [selectedHerdId]);
  
  const loadHerds = async () => {
    try {
      setLoading(true);
      const data = await getHerds();
      setHerds(data || []);
      
      if (data && data.length > 0) {
        setSelectedHerdId(data[0].id);
      }
    } catch (error) {
      message.error('Erro ao carregar rebanhos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Carregar previsão de partos
      const birthData = await getBirthPredictions(selectedHerdId);
      setBirthPredictions(birthData || []);
      
      // Carregar coberturas por reprodutor
      const coverageData = await getCoverageByReproducer(selectedHerdId);
      setCoverageByReproducer(coverageData || []);
      
    } catch (error) {
      message.error('Erro ao carregar relatórios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const birthPredictionColumns = [
    {
      title: 'Matriz',
      dataIndex: 'dam_name',
      key: 'dam_name',
      render: (text, record) => text || `Animal #${record.dam_id}`,
    },
    {
      title: 'Reprodutor',
      dataIndex: 'sire_name',
      key: 'sire_name',
      render: (text, record) => text || `Animal #${record.sire_id}`,
    },
    {
      title: 'Data de Cobertura',
      dataIndex: 'coverage_date',
      key: 'coverage_date',
    },
    {
      title: 'Data Prevista de Parto',
      dataIndex: 'predicted_birth_date',
      key: 'predicted_birth_date',
    },
    {
      title: 'Dias até o Parto',
      dataIndex: 'days_until_birth',
      key: 'days_until_birth',
      render: (days) => {
        let color = 'blue';
        if (days < 0) color = 'red';
        else if (days < 30) color = 'orange';
        else if (days < 60) color = 'gold';
        
        return <Tag color={color}>{days} dias</Tag>;
      },
      sorter: (a, b) => a.days_until_birth - b.days_until_birth,
    },
  ];
  
  const coverageColumns = [
    {
      title: 'Reprodutor',
      dataIndex: 'sire_name',
      key: 'sire_name',
      render: (text, record) => text || `Animal #${record.sire_id}`,
    },
    {
      title: 'Total de Coberturas',
      dataIndex: 'total_coverages',
      key: 'total_coverages',
      sorter: (a, b) => a.total_coverages - b.total_coverages,
    },
    {
      title: 'Partos Confirmados',
      dataIndex: 'total_births',
      key: 'total_births',
      sorter: (a, b) => a.total_births - b.total_births,
    },
    {
      title: 'Em Andamento',
      dataIndex: 'total_ongoing',
      key: 'total_ongoing',
      sorter: (a, b) => a.total_ongoing - b.total_ongoing,
    },
    {
      title: 'Taxa de Natalidade (%)',
      dataIndex: 'birth_rate',
      key: 'birth_rate',
      render: (rate) => {
        let color = 'red';
        if (rate >= 80) color = 'green';
        else if (rate >= 60) color = 'orange';
        
        return <Tag color={color}>{rate.toFixed(2)}%</Tag>;
      },
      sorter: (a, b) => a.birth_rate - b.birth_rate,
    },
  ];
  
  return (
    <main style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 20 }}>
        <Breadcrumb
          items={[
            {
              title: 'Acasalamento',
            },
            {
              title: <strong>Relatórios</strong>,
            },
          ]}
        />
      </div>

      <Card 
        title="Relatórios de Acasalamento"
        extra={
          <Select
            style={{ width: 300 }}
            placeholder="Selecione um rebanho"
            value={selectedHerdId}
            onChange={setSelectedHerdId}
          >
            {herds.map(herd => (
              <Select.Option key={herd.id} value={herd.id}>
                {herd.name} - {herd.property_name || 'Sem fazenda'}
              </Select.Option>
            ))}
          </Select>
        }
      >
        <Spin spinning={loading}>
          <Tabs defaultActiveKey="birth-predictions">
            <TabPane tab="Previsão de Partos" key="birth-predictions">
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                  Lista de coberturas em andamento com data prevista de parto (data de cobertura + 152 dias)
                </Text>
              </div>
              
              <Table
                dataSource={birthPredictions}
                columns={birthPredictionColumns}
                rowKey="reproductive_management_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
                size="small"
              />
            </TabPane>
            
            <TabPane tab="Coberturas por Reprodutor" key="coverage-by-reproducer">
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                  Consolidação de coberturas por reprodutor com taxas de sucesso
                </Text>
              </div>
              
              <Table
                dataSource={coverageByReproducer}
                columns={coverageColumns}
                rowKey="sire_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
                size="small"
              />
            </TabPane>
          </Tabs>
        </Spin>
      </Card>
    </main>
  );
};

export default MatingReports;

