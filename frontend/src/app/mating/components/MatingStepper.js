"use client"
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Checkbox, 
  Button, 
  InputNumber, 
  Select, 
  Steps,
  Row, 
  Col, 
  Space,
  Divider,
  Typography,
  Breadcrumb,
  message,
  Spin,
  Empty,
  Tag,
  Modal
} from 'antd';
import { 
  AiOutlineLeft, 
  AiOutlineRight, 
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineReload
} from 'react-icons/ai';
import { 
  getHerds,
  getEligibleAnimals,
  calculateGeneticEvaluation,
  simulateMating,
  getMatingRecommendations,
  adoptRecommendation,
  batchCreateCoverages
} from '@/services/api';

const { Title, Text } = Typography;
const { Step } = Steps;

const MatingStepper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Dados de base
  const [herds, setHerds] = useState([]);
  const [selectedHerdIds, setSelectedHerdIds] = useState([]);
  
  // Parâmetros
  const [parameters, setParameters] = useState({
    heritability: 0.3,
    min_age_female_months: 8,
    min_age_male_months: 6,
    weight_adjustment_days: 60,
    selection_method: 'individual_massal',
    max_female_percentage_per_male: 50.0
  });
  
  // Animais disponíveis e selecionados
  const [availableMales, setAvailableMales] = useState([]);
  const [availableFemales, setAvailableFemales] = useState([]);
  const [selectedMaleIds, setSelectedMaleIds] = useState([]);
  const [selectedFemaleIds, setSelectedFemaleIds] = useState([]);
  
  // Recomendações
  const [simulationId, setSimulationId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  // Carregar rebanhos ao montar
  useEffect(() => {
    loadHerds();
  }, []);
  
  const loadHerds = async () => {
    try {
      setLoading(true);
      const data = await getHerds();
      setHerds(data || []);
    } catch (error) {
      message.error('Erro ao carregar rebanhos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadEligibleAnimals = async (herdId) => {
    try {
      setLoading(true);
      const data = await getEligibleAnimals(
        herdId,
        parameters.min_age_male_months,
        parameters.min_age_female_months
      );
      
      return {
        males: data.males || [],
        females: data.females || []
      };
    } catch (error) {
      message.error('Erro ao carregar animais elegíveis');
      console.error(error);
      return { males: [], females: [] };
    } finally {
      setLoading(false);
    }
  };
  
  const runGeneticEvaluation = async (herdId) => {
    try {
      setLoading(true);
      await calculateGeneticEvaluation(
        herdId,
        parameters.heritability,
        parameters.weight_adjustment_days
      );
      message.success('Avaliação genética calculada com sucesso');
    } catch (error) {
      message.error('Erro ao calcular avaliação genética');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const runSimulation = async () => {
    if (selectedHerdIds.length === 0) {
      message.error('Selecione pelo menos um rebanho');
      return;
    }
    
    if (selectedMaleIds.length === 0 || selectedFemaleIds.length === 0) {
      message.error('Selecione pelo menos um macho e uma fêmea');
      return;
    }
    
    try {
      setLoading(true);
      
      // Pegar o primeiro rebanho selecionado para a simulação
      const herdId = selectedHerdIds[0];
      const herd = herds.find(h => h.id === herdId);
      
      if (!herd) {
        message.error('Rebanho não encontrado');
        return;
      }
      
      const response = await simulateMating({
        property_id: herd.property_id,
        herd_id: herdId,
        heritability: parameters.heritability,
        selection_method: parameters.selection_method,
        min_age_male_months: parameters.min_age_male_months,
        min_age_female_months: parameters.min_age_female_months,
        weight_adjustment_days: parameters.weight_adjustment_days,
        max_female_percentage_per_male: parameters.max_female_percentage_per_male
      }, selectedMaleIds, selectedFemaleIds);
      
      setSimulationId(response.simulation_id);
      message.success(response.message);
      
      // Carregar recomendações
      loadRecommendations(response.simulation_id);
      
      // Avançar para o relatório
      setCurrentStep(2);
      
    } catch (error) {
      message.error('Erro ao executar simulação');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadRecommendations = async (simId) => {
    try {
      setLoading(true);
      const data = await getMatingRecommendations(simId);
      setRecommendations(data || []);
    } catch (error) {
      message.error('Erro ao carregar recomendações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdoptRecommendation = async (recommendationId) => {
    try {
      await adoptRecommendation(recommendationId);
      message.success('Recomendação adotada com sucesso');
      
      // Recarregar recomendações
      if (simulationId) {
        loadRecommendations(simulationId);
      }
    } catch (error) {
      message.error('Erro ao adotar recomendação');
      console.error(error);
    }
  };
  
  const handleBatchCreateCoverages = () => {
    Modal.confirm({
      title: 'Gerar Coberturas em Lote',
      content: 'Deseja criar registros de cobertura para todas as recomendações adotadas? A data da cobertura será definida como hoje.',
      okText: 'Sim, criar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const response = await batchCreateCoverages(simulationId, today, 50.0, 3);
          
          message.success(response.message);
          
          if (response.errors && response.errors.length > 0) {
            Modal.warning({
              title: 'Alguns avisos',
              content: (
                <div>
                  {response.errors.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>
              )
            });
          }
        } catch (error) {
          message.error('Erro ao criar coberturas em lote');
          console.error(error);
        }
      }
    });
  };
  
  const handleNext = async () => {
    if (currentStep === 0) {
      if (selectedHerdIds.length === 0) {
        message.error('Selecione pelo menos um rebanho');
        return;
      }
      
      // Calcular avaliação genética para o rebanho
      const herdId = selectedHerdIds[0];
      await runGeneticEvaluation(herdId);
      
      // Carregar animais elegíveis
      const { males, females } = await loadEligibleAnimals(herdId);
      setAvailableMales(males);
      setAvailableFemales(females);
      
      // Pré-selecionar todos os animais
      setSelectedMaleIds(males.map(m => m.id));
      setSelectedFemaleIds(females.map(f => f.id));
      
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Executar simulação
      await runSimulation();
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleHerdSelection = (herdId, checked) => {
    if (checked) {
      setSelectedHerdIds([herdId]); // Por enquanto, apenas um rebanho
    } else {
      setSelectedHerdIds([]);
    }
  };
  
  const transferAnimal = (animalId, gender, from, to) => {
    if (gender === 'M') {
      if (from === 'available' && to === 'selected') {
        setSelectedMaleIds([...selectedMaleIds, animalId]);
      } else {
        setSelectedMaleIds(selectedMaleIds.filter(id => id !== animalId));
      }
    } else {
      if (from === 'available' && to === 'selected') {
        setSelectedFemaleIds([...selectedFemaleIds, animalId]);
      } else {
        setSelectedFemaleIds(selectedFemaleIds.filter(id => id !== animalId));
      }
    }
  };
  
  const transferAllAnimals = (gender, to) => {
    if (gender === 'M') {
      if (to === 'selected') {
        setSelectedMaleIds(availableMales.map(m => m.id));
      } else {
        setSelectedMaleIds([]);
      }
    } else {
      if (to === 'selected') {
        setSelectedFemaleIds(availableFemales.map(f => f.id));
      } else {
        setSelectedFemaleIds([]);
      }
    }
  };
  
  // Colunas das tabelas
  const herdColumns = [
    {
      title: '',
      dataIndex: 'select',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedHerdIds.includes(record.id)}
          onChange={(e) => handleHerdSelection(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Fazenda',
      dataIndex: 'property_name',
      key: 'property_name',
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
    },
  ];
  
  const animalColumns = [
    {
      title: 'Identificação',
      dataIndex: 'earring_identification',
      key: 'earring_identification',
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || '-',
    },
    {
      title: 'Idade (meses)',
      dataIndex: 'age_months',
      key: 'age_months',
    },
    {
      title: 'DEP',
      dataIndex: 'dep',
      key: 'dep',
      render: (value) => value !== null ? value.toFixed(3) : '-',
    },
    {
      title: 'Endogamia (%)',
      dataIndex: 'inbreeding_coefficient',
      key: 'inbreeding_coefficient',
      render: (value) => value.toFixed(2),
    },
    {
      title: 'Índice',
      dataIndex: 'selection_index',
      key: 'selection_index',
      render: (value) => value !== null ? value.toFixed(3) : '-',
    },
  ];
  
  const recommendationColumns = [
    {
      title: 'Reprodutor',
      dataIndex: 'sire_name',
      key: 'sire_name',
      render: (text, record) => text || `Animal #${record.sire_id}`,
    },
    {
      title: 'Matriz',
      dataIndex: 'dam_name',
      key: 'dam_name',
      render: (text, record) => text || `Animal #${record.dam_id}`,
    },
    {
      title: 'Índice Progênie',
      dataIndex: 'predicted_offspring_index',
      key: 'predicted_offspring_index',
      render: (value) => value.toFixed(3),
      sorter: (a, b) => a.predicted_offspring_index - b.predicted_offspring_index,
    },
    {
      title: 'Endogamia (%)',
      dataIndex: 'predicted_inbreeding',
      key: 'predicted_inbreeding',
      render: (value) => value.toFixed(2),
      sorter: (a, b) => a.predicted_inbreeding - b.predicted_inbreeding,
    },
    {
      title: 'Ganho Genético',
      dataIndex: 'predicted_genetic_gain',
      key: 'predicted_genetic_gain',
      render: (value) => value !== null ? value.toFixed(3) : '-',
      sorter: (a, b) => (a.predicted_genetic_gain || 0) - (b.predicted_genetic_gain || 0),
    },
    {
      title: 'DEP',
      dataIndex: 'predicted_dep',
      key: 'predicted_dep',
      render: (value) => value !== null ? value.toFixed(3) : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'blue',
          adopted: 'green',
          ignored: 'red'
        };
        const labels = {
          pending: 'Pendente',
          adopted: 'Adotado',
          ignored: 'Ignorado'
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<AiOutlineCheck />}
              onClick={() => handleAdoptRecommendation(record.id)}
            >
              Adotar
            </Button>
          )}
        </Space>
      ),
    },
  ];
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Spin spinning={loading}>
            <div style={{ marginBottom: 20 }}>
              <Title level={5}>Rebanhos cadastrados</Title>
              <Table
                dataSource={herds}
                columns={herdColumns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
                size="small"
              />
              <Text strong>{selectedHerdIds.length} rebanho(s) selecionado(s).</Text>
            </div>

            <Divider>Parâmetros de Seleção</Divider>

            <Row gutter={16}>
              <Col span={6}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Herdabilidade (h²):
                  </label>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={1}
                    step={0.1}
                    value={parameters.heritability}
                    onChange={(value) => setParameters({ ...parameters, heritability: value })}
                  />
                </div>
              </Col>
              
              <Col span={6}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Idade Mín. Fêmea:
                  </label>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    value={parameters.min_age_female_months}
                    onChange={(value) => setParameters({ ...parameters, min_age_female_months: value })}
                    addonAfter="meses"
                  />
                </div>
              </Col>
              
              <Col span={6}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Idade Mín. Macho:
                  </label>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    value={parameters.min_age_male_months}
                    onChange={(value) => setParameters({ ...parameters, min_age_male_months: value })}
                    addonAfter="meses"
                  />
                </div>
              </Col>
              
              <Col span={6}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Ajuste do Peso:
                  </label>
                  <Select 
                    style={{ width: '100%' }} 
                    value={parameters.weight_adjustment_days}
                    onChange={(value) => setParameters({ ...parameters, weight_adjustment_days: value })}
                  >
                    <Select.Option value={60}>60 dias</Select.Option>
                    <Select.Option value={120}>120 dias</Select.Option>
                    <Select.Option value={180}>180 dias</Select.Option>
                  </Select>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Método de Seleção:
                  </label>
                  <Select 
                    style={{ width: '100%' }} 
                    value={parameters.selection_method}
                    onChange={(value) => setParameters({ ...parameters, selection_method: value })}
                  >
                    <Select.Option value="individual_massal">Individual/Massal</Select.Option>
                    <Select.Option value="selection_index">Índice de Seleção</Select.Option>
                  </Select>
                </div>
              </Col>
              
              <Col span={12}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Máx. % Fêmeas por Macho:
                  </label>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    max={100}
                    value={parameters.max_female_percentage_per_male}
                    onChange={(value) => setParameters({ ...parameters, max_female_percentage_per_male: value })}
                    addonAfter="%"
                  />
                </div>
              </Col>
            </Row>
          </Spin>
        );

      case 1:
        const selectedMales = availableMales.filter(m => selectedMaleIds.includes(m.id));
        const unselectedMales = availableMales.filter(m => !selectedMaleIds.includes(m.id));
        const selectedFemales = availableFemales.filter(f => selectedFemaleIds.includes(f.id));
        const unselectedFemales = availableFemales.filter(f => !selectedFemaleIds.includes(f.id));
        
        return (
          <Spin spinning={loading}>
            {/* Machos */}
            <div style={{ marginBottom: 40 }}>
              <Title level={4}>Machos</Title>
              <Row gutter={16}>
                <Col span={10}>
                  <Card title="Disponíveis" size="small">
                    {unselectedMales.length === 0 ? (
                      <Empty description="Nenhum macho disponível" />
                    ) : (
                      <Table
                        dataSource={unselectedMales}
                        columns={[
                          ...animalColumns,
                          {
                            title: '',
                            key: 'select',
                            width: 50,
                            render: (_, record) => (
                              <Button
                                size="small"
                                icon={<AiOutlineRight />}
                                onClick={() => transferAnimal(record.id, 'M', 'available', 'selected')}
                              />
                            ),
                          },
                        ]}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        size="small"
                      />
                    )}
                  </Card>
                </Col>
                
                <Col span={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Space direction="vertical" size="large">
                    <Button
                      icon={<AiOutlineArrowRight />}
                      onClick={() => transferAllAnimals('M', 'selected')}
                    >
                      Todos →
                    </Button>
                    <Button
                      icon={<AiOutlineArrowLeft />}
                      onClick={() => transferAllAnimals('M', 'available')}
                    >
                      ← Todos
                    </Button>
                  </Space>
                </Col>
                
                <Col span={10}>
                  <Card title="Selecionados" size="small">
                    {selectedMales.length === 0 ? (
                      <Empty description="Nenhum macho selecionado" />
                    ) : (
                      <Table
                        dataSource={selectedMales}
                        columns={[
                          {
                            title: '',
                            key: 'remove',
                            width: 50,
                            render: (_, record) => (
                              <Button
                                size="small"
                                icon={<AiOutlineLeft />}
                                onClick={() => transferAnimal(record.id, 'M', 'selected', 'available')}
                              />
                            ),
                          },
                          ...animalColumns,
                        ]}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        size="small"
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Fêmeas */}
            <div>
              <Title level={4}>Fêmeas</Title>
              <Row gutter={16}>
                <Col span={10}>
                  <Card title="Disponíveis" size="small">
                    {unselectedFemales.length === 0 ? (
                      <Empty description="Nenhuma fêmea disponível" />
                    ) : (
                      <Table
                        dataSource={unselectedFemales}
                        columns={[
                          ...animalColumns,
                          {
                            title: '',
                            key: 'select',
                            width: 50,
                            render: (_, record) => (
                              <Button
                                size="small"
                                icon={<AiOutlineRight />}
                                onClick={() => transferAnimal(record.id, 'F', 'available', 'selected')}
                              />
                            ),
                          },
                        ]}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        size="small"
                      />
                    )}
                  </Card>
                </Col>
                
                <Col span={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Space direction="vertical" size="large">
                    <Button
                      icon={<AiOutlineArrowRight />}
                      onClick={() => transferAllAnimals('F', 'selected')}
                    >
                      Todos →
                    </Button>
                    <Button
                      icon={<AiOutlineArrowLeft />}
                      onClick={() => transferAllAnimals('F', 'available')}
                    >
                      ← Todos
                    </Button>
                  </Space>
                </Col>
                
                <Col span={10}>
                  <Card title="Selecionadas" size="small">
                    {selectedFemales.length === 0 ? (
                      <Empty description="Nenhuma fêmea selecionada" />
                    ) : (
                      <Table
                        dataSource={selectedFemales}
                        columns={[
                          {
                            title: '',
                            key: 'remove',
                            width: 50,
                            render: (_, record) => (
                              <Button
                                size="small"
                                icon={<AiOutlineLeft />}
                                onClick={() => transferAnimal(record.id, 'F', 'selected', 'available')}
                              />
                            ),
                          },
                          ...animalColumns,
                        ]}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        size="small"
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </Spin>
        );

      case 2:
        return (
          <Spin spinning={loading}>
            <div style={{ marginBottom: 20 }}>
              <Title level={5}>Relatório de Acasalamentos Recomendados</Title>
              <Text type="secondary">
                As combinações abaixo foram otimizadas para maximizar o ganho genético e minimizar a endogamia.
              </Text>
              
              <Table
                dataSource={recommendations}
                columns={recommendationColumns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
                size="small"
                style={{ marginTop: 16 }}
              />
            </div>
            
            <div style={{ marginTop: 20 }}>
              <Space>
                <Button 
                  type="primary"
                  onClick={handleBatchCreateCoverages}
                  disabled={!recommendations.some(r => r.status === 'adopted')}
                >
                  Gerar Coberturas em Lote
                </Button>
                <Button 
                  type="default"
                  onClick={() => {
                    setCurrentStep(0);
                    setSimulationId(null);
                    setRecommendations([]);
                  }}
                >
                  Nova Simulação
                </Button>
              </Space>
            </div>
          </Spin>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return 'Seleção de Rebanho e Parâmetros';
      case 1: return 'Seleção de Animais';
      case 2: return 'Relatório de Acasalamentos';
      default: return '';
    }
  };

  return (
    <main style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 20 }}>
         <Breadcrumb
            items={[
              {
                title: <strong>Acasalamento e Seleção Genética</strong>,
              },
            ]}
          />
      </div>

      <Card title={getStepTitle()}>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Rebanho" />
          <Step title="Seleção" />
          <Step title="Relatório" />
        </Steps>

        {renderStepContent()}

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            {currentStep > 0 && currentStep < 2 && (
              <Button onClick={handlePrevious}>
                Voltar
              </Button>
            )}
            {currentStep < 2 && (
              <Button type="primary" onClick={handleNext} loading={loading}>
                {currentStep === 1 ? 'Executar Simulação' : 'Próximo'}
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </main>
  );
};

export default MatingStepper;
