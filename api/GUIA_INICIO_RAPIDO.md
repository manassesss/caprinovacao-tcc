# 🚀 Guia de Início Rápido - Sistema Pravaler

## ⚡ Popular o Sistema em 3 Passos

### 1️⃣ Instalar Dependências

```bash
pip install requests
```

### 2️⃣ Popular o Banco

```bash
cd api-pravaler
python cadastrar_tudo.py
```

**Você verá:**
```
Email: seu@email.com
Senha: ********

✅ Login bem-sucedido!

1️⃣  CADASTRANDO FAZENDAS
[1/5] Fazenda São João... ✅ ID: farm_xxx
[2/5] Sítio Boa Vista... ✅ ID: farm_yyy
...

2️⃣  CADASTRANDO RAÇAS
[1/10] Anglo Nubiana... ✅ ID: race_xxx
...

RESUMO DO CADASTRO:
  ✅ Fazendas:      5
  ✅ Raças:         10
  ✅ Rebanhos:      5
  ✅ Doenças:       10
  ✅ Medicamentos:  10

  📊 TOTAL:         40 registros

🎉 CADASTRO COMPLETO!
```

### 3️⃣ Acessar o Sistema

```
http://localhost:3000
```

---

## 📊 O Que Foi Cadastrado

### 🏡 5 Fazendas (Pernambuco)
- Fazenda São João (Caruaru, 150ha)
- Sítio Boa Vista (Gravatá, 85ha)
- Chácara Santa Rita (Bezerros, 46ha)
- Fazenda Vale Verde (Arcoverde, 320ha)
- Sítio Primavera (São Bento, 62ha)

### 🐐 10 Raças

**Caprinos:**
- Anglo Nubiana (mista)
- Boer (carne)
- Saanen (leite)
- Alpina (leite)
- Parda Alpina (leite)
- SRD
- Mestiço Leiteiro

**Ovinos:**
- Santa Inês
- Dorper
- Morada Nova

### 🐑 5 Rebanhos
- Rebanho Principal
- Matrizes Elite
- Reprodutores
- Cabritos Desmamados
- Engorda

### 🦠 10 Doenças
Verminose, Mastite, Clostridioses, Ceratoconjuntivite, Ectima, Pneumonia, Linfadenite, Coccidiose, Pododermatite, Toxoplasmose

### 💊 10 Medicamentos
Ivermectina, Moxidectina, Levamisol, Oxitetraciclina, Penicilina, Flunixina, Sulfas, Vacina, Complexo B, Cálcio

---

## 🎯 Próximos Passos

### 1. Cadastrar Animais

Agora que tem fazendas e raças, cadastre animais:

**Via Interface:**
```
http://localhost:3000/animals → Adicionar
```

**Via Script (10 animais):**
```bash
# 1. Pegar IDs
python pegar_ids.py

# 2. Editar animais_teste.json
# Substitua property_id e race_id

# 3. Cadastrar
python cadastrar_animais.py
```

### 2. Criar Manejo Reprodutivo

```
http://localhost:3000/reproductive-management → Adicionar
```

Selecione:
- Matriz (fêmea)
- Reprodutor (macho)
- Configure parição
- Vincule filhos

---

## 🗺️ Fluxo Completo de Uso

```
1. Cadastre-se
   ↓
2. Execute cadastrar_tudo.py
   ↓
3. Sistema populado com:
   • 5 Fazendas
   • 10 Raças
   • 5 Rebanhos
   • 10 Doenças
   • 10 Medicamentos
   ↓
4. Cadastre Animais
   (via interface ou script)
   ↓
5. Use o Sistema Completo!
   • Manejo Reprodutivo
   • Controle Sanitário
   • Pesagens
   • Eventos
```

---

## 📚 Documentação Completa

| Documento | Conteúdo |
|-----------|----------|
| `dados_teste/README.md` | Detalhes dos JSONs e scripts |
| `MANEJO_REPRODUTIVO.md` | Guia do manejo reprodutivo |
| `CADASTRO_EM_MASSA.md` | Guia de cadastro de animais |
| `tcc-frontend/ANIMAIS_MELHORIAS.md` | Melhorias do sistema de animais |

---

## 💡 Dicas Rápidas

### Ver IDs Cadastrados

```bash
python pegar_ids.py
```

Mostra:
- IDs de todas as fazendas
- IDs de todas as raças
- IDs de todos os rebanhos

### Limpar e Recomeçar

```bash
# Pare o backend
# Delete o banco
cd api-pravaler
rm pravaler.db
# Reinicie o backend (recria vazio)
# Execute os scripts novamente
python cadastrar_tudo.py
```

### Cadastro Seletivo

Não quer cadastrar tudo? Use individual:

```bash
python cadastrar_individual.py fazendas
python cadastrar_individual.py racas
# etc...
```

---

## ⚠️ Problemas Comuns

### "Not authorized"
- Faça login primeiro
- Verifique se é produtor ou admin

### "Already exists"
- Registro já cadastrado
- Limpe o banco ou edite o JSON

### "Foreign key constraint"
- Cadastre dependências primeiro
- Ex: Fazendas antes de Rebanhos

### Rebanhos não vinculam
- Edite `rebanhos.json`
- Substitua `PROPERTY_ID_AQUI` por ID real de fazenda

---

## 🎉 Pronto!

Com este guia você popula o sistema completo em **menos de 5 minutos**!

```bash
pip install requests
cd api-pravaler
python cadastrar_tudo.py
```

✨ **Sistema pronto para uso com dados realistas!** ✨

---

**Atualizado em:** 17/10/2024

