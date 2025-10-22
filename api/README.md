# 🐄 API Pravaler - Sistema de Gestão Pecuária

[![FastAPI](https://img.shields.io/badge/FastAPI-0.119.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![SQLModel](https://img.shields.io/badge/SQLModel-0.0.27-green.svg)](https://sqlmodel.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

API completa para gestão de propriedades rurais, animais e eventos pecuários baseada em diagrama ERD completo. Sistema desenvolvido para gerenciar rebanhos caprinos/ovinos com autenticação JWT e controle de acesso por perfis.

## 🚀 **Funcionalidades**

### 🔐 **Sistema de Autenticação**
- **Login/Logout** com tokens JWT
- **Registro de usuários** com validação completa
- **Hash seguro de senhas** (bcrypt)
- **Controle de acesso por perfis** (Admin, Produtor, Técnico, etc.)
- **Tokens com expiração** (30 minutos)

### 👥 **Gestão de Usuários**
- Cadastro de usuários com diferentes perfis
- Relacionamentos profissionais com propriedades
- Controle de permissões granular

### 🏡 **Gestão de Propriedades**
- Cadastro de propriedades rurais
- Gestão de relacionamentos profissionais
- Controle de acesso por propriedade

### 🐐 **Gestão de Animais**
- Cadastro completo de animais com informações detalhadas
- Controle de genealogia (pai/mãe)
- Associação a lotes e rebanhos
- Características morfológicas

### 📦 **Gestão de Lotes e Rebanhos**
- Organização de animais em lotes
- Gestão de rebanhos por espécie
- Movimentação entre lotes

### 📊 **Eventos Pecuários**
- **Pesagem**: Controle de peso dos animais
- **Reprodutivo**: Coberturas, inseminações, diagnósticos de gestação, partos
- **Alimentação**: Controle de dietas e mudanças alimentares
- **Movimentação**: Transferências entre lotes
- **Saúde**: Eventos de saúde com medicamentos
- **Sazonal**: Controle de estações do ano

### 🧬 **Taxonomia**
- Gestão de espécies e raças
- Associação com animais e rebanhos

### 💊 **Medicamentos**
- Cadastro de medicamentos
- Controle de períodos de carência
- Associação com eventos de saúde

## 🛠️ **Tecnologias Utilizadas**

- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework web moderno e rápido
- **[SQLModel](https://sqlmodel.tiangolo.com/)** - ORM baseado em Pydantic e SQLAlchemy
- **[SQLite/PostgreSQL](https://www.postgresql.org/)** - Banco de dados
- **[JWT](https://jwt.io/)** - Autenticação com tokens
- **[Bcrypt](https://pypi.org/project/bcrypt/)** - Hash seguro de senhas
- **[Pydantic](https://pydantic-docs.helpmanual.io/)** - Validação de dados
- **[Uvicorn](https://www.uvicorn.org/)** - Servidor ASGI

## 📋 **Pré-requisitos**

- Python 3.9 ou superior
- pip (gerenciador de pacotes Python)
- PostgreSQL (opcional, para produção)

## 🔧 **Instalação**

### **Método Rápido (Recomendado)**
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd api-pravaler

# Execute o script de configuração automática
python setup.py
```

### **Método Manual**

#### 1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd api-pravaler
```

#### 2. **Crie um ambiente virtual**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### 3. **Instale as dependências**
```bash
pip install -r requirements.txt
```

#### 4. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
```

#### 5. **Execute a aplicação**
```bash
# Método simples
python start.py

# Ou manualmente
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🌐 **Acesso à API**

- **API Principal**: http://localhost:8000
- **Documentação Interativa**: http://localhost:8000/docs
- **Schema OpenAPI**: http://localhost:8000/openapi.json

## 📚 **Documentação da API**

### **Endpoints Principais**

| Categoria | Endpoint | Descrição | Autenticação |
|-----------|----------|-----------|--------------|
| **Autenticação** | `POST /auth/register` | Registrar usuário | ❌ Público |
| | `POST /auth/login` | Fazer login | ❌ Público |
| | `GET /auth/me` | Perfil do usuário | ✅ Token |
| **Usuários** | `GET /users/` | Listar usuários | ✅ Admin |
| **Propriedades** | `POST /properties/` | Criar propriedade | ✅ Produtor+ |
| | `GET /properties/` | Listar propriedades | ✅ Autenticado |
| **Animais** | `POST /animals/` | Criar animal | ✅ Autenticado |
| | `GET /animals/` | Listar animais | ✅ Autenticado |
| **Lotes** | `POST /batches/` | Criar lote | ✅ Autenticado |
| **Rebanhos** | `POST /herds/` | Criar rebanho | ✅ Autenticado |
| **Taxonomia** | `POST /taxonomy/species` | Criar espécie | ✅ Autenticado |
| | `POST /taxonomy/races` | Criar raça | ✅ Autenticado |
| **Medicamentos** | `POST /medicines/` | Criar medicamento | ✅ Autenticado |
| **Eventos** | `POST /events/weigh-in` | Evento de pesagem | ✅ Técnico+ |
| | `POST /events/reproductive` | Evento reprodutivo | ✅ Técnico+ |
| | `POST /events/health` | Evento de saúde | ✅ Técnico+ |

### **Níveis de Acesso**

- **Admin** (`is_admin: true`) - Acesso total ao sistema
- **Produtor** (`is_producer: true`) - Pode gerenciar propriedades e animais
- **Técnico** (`is_technical: true`) - Pode registrar eventos e consultar dados
- **Gerente de Cooperativa** (`is_coop_manager: true`) - Acesso a múltiplas propriedades
- **Governo** (`is_gov: true`) - Acesso para fiscalização

## 🔐 **Autenticação**

### **1. Registrar Usuário**
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@fazenda.com",
    "password": "senha123",
    "cpf": "123.456.789-00",
    "phone": "(11) 99999-9999",
    "is_producer": true
  }'
```

### **2. Fazer Login**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@fazenda.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### **3. Usar Token em Requisições**
```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🗄️ **Estrutura do Banco de Dados**

### **Principais Entidades**

- **users** - Usuários do sistema
- **properties** - Propriedades rurais
- **professional_relationship** - Relacionamentos profissionais
- **animals** - Animais com genealogia
- **species/races** - Taxonomia
- **batches** - Lotes de animais
- **herd** - Rebanhos
- **animal_herd** - Relacionamento animal-rebanho
- **medicines** - Medicamentos
- **weigh_in_event** - Eventos de pesagem
- **reproductive_event** - Eventos reprodutivos
- **food_events** - Eventos alimentares
- **movimentation_events** - Eventos de movimentação
- **health_events** - Eventos de saúde
- **season_year_events** - Eventos sazonais
- **morphological_characteristics** - Características morfológicas

## 🏗️ **Estrutura do Projeto**

```
api-pravaler/
├── app/                        # Código fonte da aplicação
│   ├── core/                   # Configurações e utilitários
│   │   ├── config.py          # Configurações da aplicação
│   │   ├── db.py              # Conexão com banco de dados
│   │   ├── security.py        # Funções de segurança
│   │   └── auth.py            # Middleware de autenticação
│   ├── models/                # Modelos de dados
│   │   ├── __init__.py        # Inicialização dos modelos
│   │   ├── base.py            # Modelo base com timestamps
│   │   ├── user.py            # Modelo de usuário
│   │   ├── property.py        # Modelos de propriedade
│   │   ├── animal.py          # Modelo de animal
│   │   ├── batch.py           # Modelo de lote
│   │   ├── taxonomy.py        # Modelos de espécies/raças
│   │   ├── farm.py            # Modelos de rebanho
│   │   ├── medicine.py        # Modelo de medicamento
│   │   ├── events.py          # Modelos de eventos
│   │   └── auth.py            # Modelos de autenticação
│   ├── routers/               # Endpoints da API
│   │   ├── auth.py            # Autenticação
│   │   ├── users.py           # Usuários
│   │   ├── properties.py      # Propriedades
│   │   ├── animals.py         # Animais
│   │   ├── batches.py         # Lotes
│   │   ├── breeds.py          # Taxonomia
│   │   ├── farms.py           # Rebanhos
│   │   ├── medicines.py       # Medicamentos
│   │   └── events.py          # Eventos
│   ├── crud/                  # Operações CRUD
│   │   └── base.py            # CRUD genérico
│   └── main.py                # Aplicação principal
├── venv/                      # Ambiente virtual (criado automaticamente)
├── requirements.txt           # Dependências Python
├── setup.py                   # Script de configuração automática
├── start.py                   # Script para iniciar a API
├── env.example                # Exemplo de variáveis de ambiente
├── .env                       # Variáveis de ambiente (criado automaticamente)
├── README.md                  # Este arquivo
├── AUTH_EXAMPLES.md          # Exemplos de autenticação
├── LICENSE                    # Licença MIT
└── pravaler.db               # Banco SQLite (criado automaticamente)
```

### **📁 Arquivos Principais**

| Arquivo | Descrição |
|---------|-----------|
| `requirements.txt` | Lista de dependências Python |
| `setup.py` | Script de configuração automática |
| `start.py` | Script para iniciar a API facilmente |
| `env.example` | Exemplo de variáveis de ambiente |
| `README.md` | Documentação completa do projeto |
| `AUTH_EXAMPLES.md` | Exemplos de uso da autenticação |
| `LICENSE` | Licença MIT do projeto |

## 🚀 **Deploy em Produção**

### **1. Configuração do Banco PostgreSQL**
```env
DATABASE_URL=postgresql+psycopg2://usuario:senha@localhost:5432/pravaler
```

### **2. Variáveis de Segurança**
```env
SECRET_KEY=chave_super_secreta_de_producao
APP_ENV=production
```

### **3. Deploy com Docker (opcional)**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### **4. Deploy com Gunicorn**
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 🧪 **Testes**

### **Testando a API**
```bash
# Teste básico
curl http://localhost:8000/

# Teste de autenticação
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123","cpf":"123.456.789-00","phone":"11999999999","is_producer":true}'
```

## 📈 **Monitoramento e Logs**

A aplicação inclui logs automáticos do SQLAlchemy em modo de desenvolvimento. Para produção, configure um sistema de logging robusto.

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 **Suporte**

Para suporte, entre em contato através de:
- Email: suporte@pravaler.com
- Issues: [GitHub Issues](https://github.com/seu-usuario/api-pravaler/issues)

## 🎯 **Roadmap**

- [ ] Sistema de notificações
- [ ] Relatórios e dashboards
- [ ] API mobile
- [ ] Integração com sensores IoT
- [ ] Sistema de backup automático
- [ ] Cache Redis
- [ ] Rate limiting
- [ ] Documentação API v2

---

**Desenvolvido com ❤️ para o setor pecuário brasileiro** 🐄🇧🇷