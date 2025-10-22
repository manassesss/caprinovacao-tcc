'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Spin, Alert, Empty } from 'antd';
import { 
  FaBuilding, 
  FaUsers, 
  FaHorse, 
  FaDna, 
  FaVirus, 
  FaPills,
  FaHeart,
  FaExchangeAlt,
  FaStethoscope,
  FaBug,
  FaSyringe,
  FaBaby,
  FaMale,
  FaFemale,
  FaExclamationTriangle,
  FaChartLine
} from 'react-icons/fa';
import { 
  getProperties, 
  getUsers, 
  getAnimals, 
  getRaces, 
  getIllnesses, 
  getMedicines,
  getHerds,
  getReproductiveManagements,
  getAnimalMovements,
  getClinicalOccurrences,
  getParasiteControls,
  getVaccinations
} from '@/services/api';
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

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Buscar todos os dados em paralelo
      const [
        propertiesRes,
        usersRes,
        animalsRes,
        racesRes,
        illnessesRes,
        medicinesRes,
        herdsRes,
        reproductiveRes,
        movementsRes,
        clinicalRes,
        parasiteRes,
        vaccinationsRes,
      ] = await Promise.all([
        getProperties(),
        getUsers().catch(() => ({ data: [] })),
        getAnimals(),
        getRaces(),
        getIllnesses(),
        getMedicines(),
        getHerds(),
        getReproductiveManagements(),
        getAnimalMovements(),
        getClinicalOccurrences(),
        getParasiteControls(),
        getVaccinations(),
      ]);

      const properties = Array.isArray(propertiesRes) ? propertiesRes : propertiesRes.data || [];
      const users = Array.isArray(usersRes) ? usersRes : usersRes.data || [];
      const animals = Array.isArray(animalsRes) ? animalsRes : animalsRes.data || [];
      const races = Array.isArray(racesRes) ? racesRes : racesRes.data || [];
      const illnesses = Array.isArray(illnessesRes) ? illnessesRes : illnessesRes.data || [];
      const medicines = Array.isArray(medicinesRes) ? medicinesRes : medicinesRes.data || [];
      const herds = Array.isArray(herdsRes) ? herdsRes : herdsRes.data || [];
      const reproductive = Array.isArray(reproductiveRes) ? reproductiveRes : reproductiveRes.data || [];
      const movements = Array.isArray(movementsRes) ? movementsRes : movementsRes.data || [];
      const clinical = Array.isArray(clinicalRes) ? clinicalRes : clinicalRes.data || [];
      const parasite = Array.isArray(parasiteRes) ? parasiteRes : parasiteRes.data || [];
      const vaccinations = Array.isArray(vaccinationsRes) ? vaccinationsRes : vaccinationsRes.data || [];

      // Calcular estatísticas
      const maleAnimals = animals.filter(a => a.gender === 'M').length;
      const femaleAnimals = animals.filter(a => a.gender === 'F').length;
      const activeAnimals = animals.filter(a => a.status === 'ativo').length;
      
      // Manejos reprodutivos com parição confirmada
      const confirmedBirths = reproductive.filter(r => r.parturition_status === 'sim').length;
      
      // Movimentações por motivo
      const salesCount = movements.filter(m => m.exit_reason === 'venda').length;
      const deathsCount = movements.filter(m => m.exit_reason === 'morte').length;
      
      // Ocorrências clínicas recentes (últimos 30 dias)
      const recentClinical = clinical.filter(c => {
        const occurrenceDate = new Date(c.occurrence_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return occurrenceDate >= thirtyDaysAgo;
      }).length;

      // Controles parasitários recentes
      const recentParasite = parasite.filter(p => {
        const controlDate = new Date(p.deworming_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return controlDate >= thirtyDaysAgo;
      }).length;

      // Vacinações recentes
      const recentVaccinations = vaccinations.filter(v => {
        const vaccinationDate = new Date(v.vaccination_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return vaccinationDate >= thirtyDaysAgo;
      }).length;

      // Raças mais comuns
      const raceCount = {};
      animals.forEach(a => {
        if (a.race_id) {
          raceCount[a.race_id] = (raceCount[a.race_id] || 0) + 1;
        }
      });

      const topRaces = Object.entries(raceCount)
        .map(([raceId, count]) => {
          const race = races.find(r => r.id === raceId);
          return { race: race?.name || 'Desconhecida', count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Doenças mais comuns
      const illnessCount = {};
      clinical.forEach(c => {
        if (c.illness_id) {
          illnessCount[c.illness_id] = (illnessCount[c.illness_id] || 0) + 1;
        }
      });

      const topIllnesses = Object.entries(illnessCount)
        .map(([illnessId, count]) => {
          const illness = illnesses.find(i => i.id === illnessId);
          return { illness: illness?.name || 'Desconhecida', count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        // Cadastros básicos
        totalProperties: properties.length,
        totalUsers: users.length,
        totalAnimals: animals.length,
        totalRaces: races.length,
        totalIllnesses: illnesses.length,
        totalMedicines: medicines.length,
        totalHerds: herds.length,
        
        // Animais
        maleAnimals,
        femaleAnimals,
        activeAnimals,
        
        // Controle Animal
        totalReproductive: reproductive.length,
        confirmedBirths,
        totalMovements: movements.length,
        salesCount,
        deathsCount,
        totalClinical: clinical.length,
        recentClinical,
        totalParasite: parasite.length,
        recentParasite,
        totalVaccinations: vaccinations.length,
        recentVaccinations,
        
        // Rankings
        topRaces,
        topIllnesses,
        
        // Arrays completos
        animals,
        movements,
        clinical,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError(error.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Gráfico de pizza - Distribuição de gênero
  const genderPieData = stats ? {
    labels: ['Machos', 'Fêmeas'],
    datasets: [{
      data: [stats.maleAnimals, stats.femaleAnimals],
      backgroundColor: ['#3b82f6', '#ec4899'],
      borderWidth: 2,
    }],
  } : null;

  // Gráfico de pizza - Status dos animais
  const statusPieData = stats ? {
    labels: ['Ativos', 'Movimentados'],
    datasets: [{
      data: [stats.activeAnimals, stats.totalMovements],
      backgroundColor: ['#10b981', '#f59e0b'],
      borderWidth: 2,
    }],
  } : null;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px', color: '#16a34a', fontSize: '16px' }}>Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Erro ao carregar Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <button
              onClick={() => {
                setError(null);
                loadDashboardData();
              }}
              style={{
                padding: '4px 16px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Tentar Novamente
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Título */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', marginBottom: '8px' }}>
          Dashboard CAPRINOVAÇÃO
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Visão geral do sistema de gestão agropecuária
        </p>
      </div>

      {/* Alerta de Boas-vindas */}
      <Alert
        message="Bem-vindo ao Sistema CAPRINOVAÇÃO!"
        description="Aqui você tem acesso rápido às principais métricas e indicadores da sua fazenda."
        type="success"
        showIcon
        style={{ marginBottom: '24px' }}
        closable
      />

      {/* SEÇÃO 1: Cadastros Básicos */}
      <Card 
        title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>📋 Cadastros Básicos</span>}
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Fazendas"
                value={stats?.totalProperties || 0}
                prefix={<FaBuilding style={{ color: '#16a34a' }} />}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Funcionários"
                value={stats?.totalUsers || 0}
                prefix={<FaUsers style={{ color: '#3b82f6' }} />}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Rebanhos"
                value={stats?.totalHerds || 0}
                prefix={<FaHorse style={{ color: '#8b5cf6' }} />}
                valueStyle={{ color: '#8b5cf6' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Raças"
                value={stats?.totalRaces || 0}
                prefix={<FaDna style={{ color: '#ec4899' }} />}
                valueStyle={{ color: '#ec4899' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Doenças"
                value={stats?.totalIllnesses || 0}
                prefix={<FaVirus style={{ color: '#ef4444' }} />}
                valueStyle={{ color: '#ef4444' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Medicamentos"
                value={stats?.totalMedicines || 0}
                prefix={<FaPills style={{ color: '#f59e0b' }} />}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* SEÇÃO 2: Animais */}
      <Card 
        title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>🐐 Rebanho</span>}
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Total de Animais"
                value={stats?.totalAnimals || 0}
                prefix={<FaHorse style={{ color: '#16a34a' }} />}
                valueStyle={{ color: '#16a34a', fontSize: '32px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Machos"
                value={stats?.maleAnimals || 0}
                prefix={<FaMale style={{ color: '#3b82f6' }} />}
                valueStyle={{ color: '#3b82f6' }}
                suffix={`(${stats?.totalAnimals > 0 ? ((stats.maleAnimals / stats.totalAnimals) * 100).toFixed(1) : 0}%)`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Fêmeas"
                value={stats?.femaleAnimals || 0}
                prefix={<FaFemale style={{ color: '#ec4899' }} />}
                valueStyle={{ color: '#ec4899' }}
                suffix={`(${stats?.totalAnimals > 0 ? ((stats.femaleAnimals / stats.totalAnimals) * 100).toFixed(1) : 0}%)`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Ativos"
                value={stats?.activeAnimals || 0}
                prefix={<FaChartLine style={{ color: '#10b981' }} />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* SEÇÃO 3: Controle Animal */}
      <Card 
        title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>🔬 Controle Animal</span>}
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Manejos Reprodutivos"
                value={stats?.totalReproductive || 0}
                prefix={<FaHeart style={{ color: '#ec4899' }} />}
                valueStyle={{ color: '#ec4899' }}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                {stats?.confirmedBirths || 0} parições confirmadas
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Movimentações"
                value={stats?.totalMovements || 0}
                prefix={<FaExchangeAlt style={{ color: '#f59e0b' }} />}
                valueStyle={{ color: '#f59e0b' }}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                {stats?.salesCount || 0} vendas | {stats?.deathsCount || 0} mortes
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Ocorrências Clínicas"
                value={stats?.totalClinical || 0}
                prefix={<FaStethoscope style={{ color: '#ef4444' }} />}
                valueStyle={{ color: '#ef4444' }}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                {stats?.recentClinical || 0} nos últimos 30 dias
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Controles Parasitários"
                value={stats?.totalParasite || 0}
                prefix={<FaBug style={{ color: '#8b5cf6' }} />}
                valueStyle={{ color: '#8b5cf6' }}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                {stats?.recentParasite || 0} nos últimos 30 dias
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Vacinações"
                value={stats?.totalVaccinations || 0}
                prefix={<FaSyringe style={{ color: '#06b6d4' }} />}
                valueStyle={{ color: '#06b6d4' }}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                {stats?.recentVaccinations || 0} nos últimos 30 dias
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Crias Registradas"
                value={stats?.confirmedBirths || 0}
                prefix={<FaBaby style={{ color: '#10b981' }} />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* SEÇÃO 4: Gráficos e Tabelas */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={8}>
          <Card title="Distribuição por Gênero" style={{ height: '400px' }}>
            {genderPieData ? (
              <div style={{ height: '300px' }}>
                <Pie data={genderPieData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            ) : <Empty description="Sem dados disponíveis" />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Status dos Animais" style={{ height: '400px' }}>
            {statusPieData ? (
              <div style={{ height: '300px' }}>
                <Pie data={statusPieData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            ) : <Empty description="Sem dados disponíveis" />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top 5 - Raças Mais Comuns" style={{ height: '400px' }}>
            <Table
              dataSource={stats?.topRaces || []}
              columns={[
                { title: 'Raça', dataIndex: 'race', key: 'race' },
                { title: 'Animais', dataIndex: 'count', key: 'count', align: 'center', render: (count) => <Tag color="green">{count}</Tag> },
                { title: '%', key: 'percentage', align: 'center', render: (_, record) => `${((record.count / stats.totalAnimals) * 100).toFixed(1)}%` },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* SEÇÃO 5: Alertas e Rankings */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title="⚠️ Ocorrências Clínicas Recentes" style={{ marginBottom: '24px' }}>
            {stats?.recentClinical > 0 ? (
              <Alert
                message={`${stats.recentClinical} ocorrências nos últimos 30 dias`}
                description="Monitore a saúde do rebanho e tome ações preventivas."
                type="warning"
                showIcon
              />
            ) : (
              <Alert
                message="Nenhuma ocorrência recente"
                description="Seu rebanho está saudável!"
                type="success"
                showIcon
              />
            )}
            
            {stats?.topIllnesses.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '12px' }}>Doenças Mais Frequentes:</h4>
                <Table
                  dataSource={stats.topIllnesses}
                  columns={[
                    { title: 'Doença', dataIndex: 'illness', key: 'illness' },
                    { title: 'Ocorrências', dataIndex: 'count', key: 'count', align: 'center', render: (count) => <Tag color="red">{count}</Tag> },
                  ]}
                  pagination={false}
                  size="small"
                />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="📊 Resumo de Movimentações" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Vendas"
                    value={stats?.salesCount || 0}
                    valueStyle={{ color: '#10b981' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Mortes"
                    value={stats?.deathsCount || 0}
                    valueStyle={{ color: '#ef4444' }}
                  />
                </Card>
              </Col>
            </Row>
            <div style={{ marginTop: '16px' }}>
              <Progress 
                percent={stats?.totalAnimals > 0 ? ((stats.activeAnimals / stats.totalAnimals) * 100).toFixed(1) : 0} 
                status="active"
                strokeColor="#16a34a"
                format={percent => `${percent}% ativos`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* SEÇÃO 6: Atividades Recentes */}
      <Card title="📅 Atividades dos Últimos 30 Dias">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <FaStethoscope style={{ fontSize: '32px', color: '#f59e0b', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {stats?.recentClinical || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>Ocorrências Clínicas</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f3e8ff', borderRadius: '8px' }}>
              <FaBug style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {stats?.recentParasite || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#5b21b6' }}>Controles Parasitários</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
              <FaSyringe style={{ fontSize: '32px', color: '#3b82f6', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                {stats?.recentVaccinations || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#1e40af' }}>Vacinações</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fce7f3', borderRadius: '8px' }}>
              <FaBaby style={{ fontSize: '32px', color: '#ec4899', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ec4899' }}>
                {stats?.confirmedBirths || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#9f1239' }}>Parições Confirmadas</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

