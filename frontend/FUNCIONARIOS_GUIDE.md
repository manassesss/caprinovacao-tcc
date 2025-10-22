# 👥 Sistema de Funcionários - Guia Completo

## ✅ Implementação Completa

Sistema de cadastro de funcionários vinculados a fazendas, totalmente integrado com a API.

---

## 📋 **Modelo de Dados (Employee)**

```
Employee (employees):
  - id: string (chave primária)
  - property_id: string (fazenda - obrigatório)
  
  Dados Pessoais:
  - name: string ⭐ (nome completo - obrigatório)
  - cpf: string ⭐ (CPF - obrigatório, único)
  - phone: string ⭐ (telefone - obrigatório)
  - email: string (email - opcional)
  - address: string (endereço - opcional)
  - city: string (município - opcional)
  - state: string (estado - opcional)
  
  Dados da Conta:
  - login: string ⭐ (login - obrigatório, único)
  - password: string ⭐ (senha hash - obrigatório)
  - is_active: boolean (status ativo/inativo)
  
  Timestamps:
  - created_at: datetime
  - updated_at: datetime
```

---

## 🚀 **Funcionalidades Implementadas**

### **Backend (API)**
- ✅ Modelo `Employee` criado
- ✅ Rotas em `/employees/`
- ✅ CRUD completo
- ✅ Autenticação obrigatória
- ✅ Filtragem por fazendas do usuário
- ✅ Validações (CPF único, login único, email único)
- ✅ Senha hash segura (bcrypt)
- ✅ Endpoint para alterar senha

### **Frontend**
- ✅ Listagem de funcionários
- ✅ Filtro por fazenda
- ✅ Busca por nome, CPF ou email
- ✅ Modal de detalhes
- ✅ Formulário de cadastro/edição
- ✅ Máscaras automáticas (CPF, telefone)
- ✅ Validações completas
- ✅ Integração total com API

---

## 📝 **Campos do Formulário**

### **Fazenda:** ⭐
- Select com todas as fazendas do usuário
- Mostra: Nome - Cidade/Estado
- Não pode ser alterado na edição

### **Dados Pessoais:**

1. **Nome Completo** ⭐
   - Mínimo 3 caracteres
   - Exemplo: "João Silva Santos"

2. **CPF** ⭐
   - Máscara: 000.000.000-00
   - Validação de formato
   - Deve ser único
   - Não pode ser alterado na edição

3. **Telefone** ⭐
   - Máscara: (00) 00000-0000
   - Celular ou fixo

4. **Email** (opcional)
   - Validação de formato
   - Deve ser único se informado

5. **Endereço** (opcional)
   - Texto livre

6. **Município** (opcional)
   - Texto livre

7. **Estado** (opcional)
   - Select com 27 estados

### **Dados da Conta** (apenas no cadastro):

8. **Login** ⭐
   - Mínimo 4 caracteres
   - Deve ser único
   - Usado para acesso ao sistema

9. **Senha** ⭐
   - Mínimo 6 caracteres
   - Armazenada com hash seguro

10. **Confirmar Senha** ⭐
    - Deve ser igual à senha

---

## 🎯 **Como Usar**

### **1. Acessar Funcionários**
```
Menu Lateral → Cadastros → Funcionários
ou
http://localhost:3000/employees
```

### **2. Cadastrar Funcionário**
1. Clique em **"Adicionar Funcionário"**
2. **Selecione a fazenda** (obrigatório)
3. Preencha os **dados pessoais**:
   - Nome: João Silva
   - CPF: 123.456.789-00
   - Telefone: (86) 99999-9999
   - Email: joao@fazenda.com (opcional)
   - Endereço: Rua Principal, 123 (opcional)
   - Município: Teresina (opcional)
   - Estado: PI (opcional)
4. Preencha os **dados da conta**:
   - Login: joao.silva
   - Senha: senha123
   - Confirmar Senha: senha123
5. Clique em **"Cadastrar"**

### **3. Listar Funcionários**
- Vê todos os funcionários das suas fazendas
- Filtra por fazenda específica
- Busca por nome, CPF ou email
- Vê status (Ativo/Inativo)

### **4. Editar Funcionário**
- Clique no botão de editar
- Altere dados pessoais (nome, telefone, email, etc.)
- **Não pode alterar**: Fazenda, CPF, Login
- **Para alterar senha**: Use opção específica (futuro)

### **5. Excluir Funcionário**
- Clique no botão vermelho
- Confirme a exclusão
- Funcionário será removido

### **6. Ver Detalhes**
- Visualiza todas as informações
- Mostra fazenda vinculada
- Exibe status ativo/inativo

---

## 🔒 **Segurança e Validações**

### **Backend:**
- ✅ CPF deve ser único no sistema
- ✅ Login deve ser único no sistema
- ✅ Email deve ser único (se informado)
- ✅ Senha armazenada com hash bcrypt
- ✅ Usuário só vê funcionários de suas fazendas
- ✅ Apenas dono da fazenda ou admin pode gerenciar

### **Frontend:**
- ✅ Validação de formato CPF
- ✅ Validação de formato email
- ✅ Senhas devem coincidir
- ✅ Campos obrigatórios marcados
- ✅ Máscaras automáticas

---

## 📡 **Endpoints da API**

```
GET    /employees/                    - Lista funcionários das fazendas do usuário
GET    /employees/?property_id={id}   - Lista funcionários de uma fazenda específica
POST   /employees/                    - Cria novo funcionário
GET    /employees/{id}                - Busca funcionário específico
PUT    /employees/{id}                - Atualiza dados do funcionário
DELETE /employees/{id}                - Exclui funcionário
POST   /employees/{id}/change-password - Altera senha do funcionário
```

Todos requerem autenticação:
```
Authorization: Bearer {token}
```

---

## 🎨 **Interface**

### **Listagem:**
- Tabela com: Nome, CPF, Telefone, Email, Fazenda, Status
- Filtro por fazenda (select)
- Busca em tempo real
- Tags coloridas (fazenda, status)
- Paginação automática
- Confirmação antes de excluir

### **Formulário:**
- 3 seções organizadas:
  1. **Fazenda** - Select de fazendas
  2. **Dados Pessoais** - Nome, CPF, contato, endereço
  3. **Dados da Conta** - Login e senha (só no cadastro)
- Layout responsivo (2-3 colunas)
- Máscaras automáticas
- Validações em tempo real

### **Modal de Detalhes:**
- Informações completas
- Ícones visuais
- Tags de status
- Data de cadastro
- Layout organizado

---

## 🧪 **Testando**

### **Pré-requisito:**
1. Ter pelo menos uma fazenda cadastrada
2. Estar logado no sistema

### **Teste Completo:**

1. **Acesse:** `http://localhost:3000/employees`
2. **Clique em** "Adicionar Funcionário"
3. **Preencha:**
   - Fazenda: Selecione uma fazenda
   - Nome: Maria Silva
   - CPF: 111.222.333-44
   - Telefone: (86) 99999-9999
   - Email: maria@fazenda.com
   - Login: maria.silva
   - Senha: senha123
   - Confirmar Senha: senha123
4. **Cadastre** e veja na listagem
5. **Filtre** por fazenda
6. **Busque** por nome
7. **Edite** o funcionário
8. **Veja detalhes**

---

## 💡 **Recursos Especiais**

### **Máscaras Automáticas:**
- CPF: Digite "11122233344" → Vira "111.222.333-44"
- Telefone: Digite "86999999999" → Vira "(86) 99999-9999"

### **Validações:**
- CPF: formato e unicidade
- Login: mínimo 4 caracteres e único
- Senha: mínimo 6 caracteres
- Senhas devem coincidem
- Email: formato válido e único (se informado)

### **Filtros:**
- Por fazenda específica
- Busca em tempo real por nome/CPF/email
- Limpeza de filtros

### **Segurança:**
- Senha nunca é exibida
- Na edição, senha não é alterada (endpoint separado)
- CPF e Login não podem ser alterados após criação
- Fazenda não pode ser alterada após criação

---

## 📁 **Arquivos Criados**

### **Backend:**
- ✅ `app/models/employee.py` - Modelo Employee
- ✅ `app/routers/employees.py` - Rotas /employees/

### **Frontend:**
- ✅ `src/app/employees/components/EmployeesList.js` - Listagem integrada
- ✅ `src/app/employees/edit/[[...id]]/components/EmployeesForm.js` - Formulário
- ✅ `src/app/employees/edit/[[...id]]/page.js` - Página de edição
- ✅ `src/services/api.js` - Funções de API adicionadas

---

## 🎉 **Sistema Completo!**

✅ Backend com modelo e rotas  
✅ Validações e segurança  
✅ Frontend totalmente integrado  
✅ Máscaras e validações  
✅ Filtros e busca  
✅ Vinculação com fazendas  

**Acesse:** `http://localhost:3000/employees`

---

**Criado em:** 14/10/2025  
**Status:** ✅ Completo e Funcionando


