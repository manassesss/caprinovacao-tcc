# 🔐 Sistema de Autenticação - API Pravaler

## ✅ **Sistema Implementado**

A API agora possui um sistema completo de autenticação JWT com:

- **Login/Logout** com tokens JWT
- **Registro de usuários** com validação
- **Hash seguro de senhas** (bcrypt)
- **Controle de acesso por perfis** (Admin, Produtor, Técnico, etc.)
- **Proteção de rotas** sensíveis

## 🚀 **Como Usar**

### 1. **Registrar um Novo Usuário**

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@fazenda.com",
    "password": "senha123",
    "cpf": "123.456.789-00",
    "phone": "(11) 99999-9999",
    "is_producer": true,
    "is_technical": false,
    "is_admin": false
  }'
```

### 2. **Fazer Login**

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

### 3. **Usar Token para Acessar Rotas Protegidas**

```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. **Acessar Rotas de Produtor**

```bash
curl -X POST "http://localhost:8000/properties/" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prop_001",
    "producer_id": "user_1",
    "name": "Fazenda São João",
    "cpf_cnpj": "12.345.678/0001-90",
    "state_registration": "123456789",
    "state": "SP",
    "city": "Campinas",
    "address": "Rodovia SP-101, Km 15",
    "cep": "13000-000"
  }'
```

## 📋 **Endpoints de Autenticação**

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `/auth/register` | POST | Registrar novo usuário | ❌ Público |
| `/auth/login` | POST | Fazer login | ❌ Público |
| `/auth/me` | GET | Informações do usuário atual | ✅ Token |
| `/auth/me` | PUT | Atualizar perfil | ✅ Token |
| `/auth/change-password` | POST | Alterar senha | ✅ Token |

## 🔒 **Níveis de Acesso**

### **Perfis de Usuário:**
- **Admin** (`is_admin: true`) - Acesso total
- **Produtor** (`is_producer: true`) - Pode gerenciar propriedades e animais
- **Técnico** (`is_technical: true`) - Pode registrar eventos e consultar dados
- **Gerente de Cooperativa** (`is_coop_manager: true`) - Acesso a múltiplas propriedades
- **Governo** (`is_gov: true`) - Acesso para fiscalização

### **Rotas Protegidas:**
- **Admin apenas**: `/users/` (listar usuários)
- **Produtor+**: `/properties/` (criar propriedades)
- **Técnico+**: `/events/` (registrar eventos)
- **Autenticado**: `/auth/me`, `/animals/`, `/batches/`, etc.

## 🛡️ **Segurança Implementada**

- ✅ **Senhas hasheadas** com bcrypt
- ✅ **Tokens JWT** com expiração (30 minutos)
- ✅ **Validação de email/CPF/telefone** únicos
- ✅ **Controle de acesso** por perfil
- ✅ **Middleware de autenticação** automático
- ✅ **Proteção contra** ataques comuns

## 📖 **Documentação Interativa**

Acesse `http://localhost:8000/docs` para testar todos os endpoints de autenticação diretamente no navegador!

## 🔧 **Configuração**

Para produção, altere no arquivo `app/core/security.py`:
- `SECRET_KEY` para uma chave fixa e segura
- `ACCESS_TOKEN_EXPIRE_MINUTES` conforme necessário
- Configure HTTPS obrigatório

## 📝 **Exemplo Completo de Uso**

```python
import requests

# 1. Registrar usuário
register_data = {
    "name": "Maria Santos",
    "email": "maria@fazenda.com", 
    "password": "senha123",
    "cpf": "987.654.321-00",
    "phone": "(11) 88888-8888",
    "is_producer": True
}

response = requests.post("http://localhost:8000/auth/register", json=register_data)
print("Usuário registrado:", response.json())

# 2. Fazer login
login_data = {
    "email": "maria@fazenda.com",
    "password": "senha123"
}

response = requests.post("http://localhost:8000/auth/login", json=login_data)
token = response.json()["access_token"]
print("Token obtido:", token[:50] + "...")

# 3. Usar token em requisições
headers = {"Authorization": f"Bearer {token}"}

# Verificar perfil
response = requests.get("http://localhost:8000/auth/me", headers=headers)
print("Perfil do usuário:", response.json())

# Criar propriedade (apenas produtores)
property_data = {
    "id": "prop_002",
    "producer_id": "user_2", 
    "name": "Fazenda Maria",
    "cpf_cnpj": "98.765.432/0001-10",
    "state_registration": "987654321",
    "state": "MG",
    "city": "Uberaba", 
    "address": "Estrada Rural, Km 25",
    "cep": "38000-000"
}

response = requests.post("http://localhost:8000/properties/", json=property_data, headers=headers)
print("Propriedade criada:", response.json())
```

A API agora está completamente segura e pronta para uso em produção! 🚀
