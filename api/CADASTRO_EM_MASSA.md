# 🐐 Cadastro em Massa de Animais

## 📋 Arquivos Criados

1. **`animais_teste.json`** - JSON com 10 animais de exemplo
2. **`cadastrar_animais.py`** - Script Python para cadastrar

---

## 🚀 Como Usar

### 1️⃣ **Instalar Dependências**

```bash
pip install requests
```

### 2️⃣ **Ajustar o JSON (se necessário)**

Edite `animais_teste.json` e ajuste:

- **`property_id`**: ID da sua fazenda
- **`race_id`**: ID da raça cadastrada
- **`herd_id`**: ID do rebanho (ou deixe `null`)

**Exemplo:**
```json
{
  "property_id": "farm_1760635880322_dz5zihr11",  ← Sua fazenda
  "race_id": "race_1",                             ← Sua raça
  "earring_identification": "BR001",               ← Número único
  "name": "Mimosa",
  "birth_date": "2023-01-15",
  ...
}
```

### 3️⃣ **Executar o Script**

```bash
cd api-pravaler
python cadastrar_animais.py
```

### 4️⃣ **Fazer Login**

O script vai pedir:
```
Email: seu@email.com
Senha: ********
```

### 5️⃣ **Aguardar o Cadastro**

```
3️⃣  CADASTRANDO ANIMAIS...
────────────────────────────────────────────────────────────

[1/10] BR001 - Mimosa... ✅ Sucesso!
[2/10] BR002 - Thor... ✅ Sucesso!
[3/10] BR003 - Estrela... ✅ Sucesso!
...
```

---

## 📊 Animais no JSON

| # | Identificação | Nome | Sexo | Categoria | Composição |
|---|---------------|------|------|-----------|------------|
| 1 | BR001 | Mimosa | F | Matriz | PO |
| 2 | BR002 | Thor | M | Reprodutor | PO |
| 3 | BR003 | Estrela | F | Borrego | PC |
| 4 | BR004 | Relâmpago | M | Cabrito | PO |
| 5 | BR005 | Luna | F | Borrego | PC |
| 6 | BR006 | Zeus | M | Reprodutor | PO |
| 7 | BR007 | Pérola | F | Matriz | PO |
| 8 | BR008 | Trovão | M | Marrão | PC |
| 9 | BR009 | Flor | F | Cabrito | PO |
| 10 | BR010 | Apolo | M | Marrão | PO |

---

## 🔧 Estrutura do JSON

### Campos Obrigatórios:
- `property_id` - ID da fazenda
- `race_id` - ID da raça
- `earring_identification` - Número único do animal
- `birth_date` - Data de nascimento (YYYY-MM-DD)
- `gender` - Sexo: "M" ou "F"
- `objective` - "producao" ou "reproducao"
- `entry_reason` - "nascimento", "compra", "emprestimo", "outros"
- `category` - "cabrito", "borrego", "marrao", "matriz", "reprodutor"
- `childbirth_type` - "simples", "duplo", "triplo", "quadruplo"
- `genetic_composition` - "PO", "PC", "mestiço"

### Campos Opcionais:
- `herd_id` - ID do rebanho
- `name` - Nome do animal
- `weaning_date` - Data de desmame
- `father_id` - ID do pai
- `mother_id` - ID da mãe
- `father_race_id` - ID da raça do pai (para mestiços)
- `mother_race_id` - ID da raça da mãe (para mestiços)
- `testicular_degree` - "normal", "criptorquidia", "monorquidia" (só machos)
- `ear_position` - "ereta", "semi-pendente", "pendente"
- `has_beard` - true/false
- `has_earring` - true/false
- `has_horn` - true/false
- `has_supranumerary_teats` - true/false
- `status` - "ativo", "vendido", "morto", "emprestado"
- `status_description` - Descrição do status

---

## ⚠️ Validações

O backend vai validar:

1. **Identificação única** - `earring_identification` não pode repetir
2. **Sexo** - Deve ser "M" ou "F"
3. **Mestiços** - Se `genetic_composition` = "mestiço", precisa de `father_race_id` e `mother_race_id`
4. **Grau testicular** - Só pode ser preenchido se `gender` = "M"
5. **Permissões** - Só pode cadastrar na sua própria fazenda

---

## 💡 Dicas

### 1. **Testar com 1 Animal Primeiro**

Crie um arquivo `teste_1.json`:
```json
[
  {
    "property_id": "sua_fazenda_id",
    "race_id": "sua_raca_id",
    "earring_identification": "TESTE001",
    "name": "Teste",
    "birth_date": "2024-01-01",
    "gender": "F",
    "objective": "producao",
    "entry_reason": "nascimento",
    "category": "cabrito",
    "childbirth_type": "simples",
    "genetic_composition": "PO"
  }
]
```

### 2. **Adicionar Mais Animais**

Copie e cole um animal existente e mude:
- `earring_identification` (deve ser único!)
- `name`
- `birth_date`
- Outros campos conforme necessário

### 3. **Verificar IDs**

Para pegar os IDs corretos:

**Fazendas:**
```bash
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:8000/properties/
```

**Raças:**
```bash
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:8000/races/
```

**Ou acesse:** http://localhost:8000/docs

---

## 🐛 Solução de Problemas

### Erro: "Earring identification already exists"
- O número de identificação já existe no banco
- Mude o `earring_identification` para um valor único

### Erro: "Not authorized"
- A fazenda não pertence ao seu usuário
- Verifique o `property_id`

### Erro: "SQLite Date type only accepts..."
- Formato de data incorreto
- Use: "YYYY-MM-DD" (ex: "2024-01-15")

### Erro: "Gender must be 'M' or 'F'"
- Use "M" para macho ou "F" para fêmea
- Cuidado com maiúsculas/minúsculas

---

## 📝 Exemplo de Uso Completo

```bash
# 1. Navegar até a pasta
cd api-pravaler

# 2. Instalar dependências
pip install requests

# 3. Executar script
python cadastrar_animais.py

# 4. Informar credenciais
Email: produtor@example.com
Senha: senha123

# 5. Aguardar resultado
✅ Login bem-sucedido!
✅ 10 animais carregados do arquivo
✅ Sucesso: 10
❌ Erros: 0
```

---

## 🎉 Pronto!

Após o cadastro, acesse:
```
http://localhost:3000/animals
```

E veja seus animais cadastrados! 🐐🐑

