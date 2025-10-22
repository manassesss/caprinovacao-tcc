# 🐐 CAPRINOVAÇÃO - Sistema de Gestão Caprina

Sistema completo para gestão de rebanhos caprinos com módulo de acasalamento e seleção genética.

## 🚀 Como Rodar a Aplicação

### Pré-requisitos
- Python 3.9+
- Node.js 16+
- npm ou yarn

### 1. Backend (API)
```bash
# Entrar na pasta da API
cd api

# Instalar dependências
pip install -r requirements.txt

# Rodar o servidor
python start.py
```
**Backend rodará em:** http://localhost:8000

### 2. Frontend
```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Rodar o servidor
npm run dev
```
**Frontend rodará em:** http://localhost:3000

## 📋 Funcionalidades

- **Cadastros**: Fazendas, Funcionários, Rebanhos, Animais, Raças, Doenças, Medicamentos
- **Controle Animal**: Manejo Reprodutivo, Movimentação, Ocorrências Clínicas, Controle Parasitário, Vacinação
- **Acasalamento**: Simulação genética, Seleção de reprodutores, Relatórios de cobertura
- **Relatórios**: Dados zootécnicos, Movimentação, Crias, CPM, Espessura de gordura, etc.

## 🔧 Estrutura do Projeto

```
tcc/
├── api/          # Backend FastAPI
├── frontend/     # Frontend Next.js
└── README.md
```

## 📚 Documentação da API

Acesse: http://localhost:8000/docs

## 🎯 Acesso à Aplicação

1. Abra http://localhost:3000
2. Faça login com suas credenciais
3. Navegue pelo menu lateral

---

**Desenvolvido para TCC - Gestão de Rebanhos Caprinos** 🐐
