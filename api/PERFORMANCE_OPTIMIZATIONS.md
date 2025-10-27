# Otimizações de Performance da API

Este documento descreve as otimizações implementadas para melhorar o tempo de resposta da API.

## 📊 Otimizações Implementadas

### 1. Índices de Banco de Dados

Foram criados índices nos campos mais consultados para acelerar queries:

#### Tabela `animals`
- `idx_animals_property_status` - property_id + status (filtragem por fazenda)
- `idx_animals_herd` - herd_id (rebanhos)
- `idx_animals_identification` - earring_identification (busca por identificação)
- `idx_animals_birth_date` - birth_date (filtros por data)
- `idx_animals_gender` - gender (filtros por sexo)

#### Tabelas de Medições
- `idx_weight_records_animal_date` - weight_records (animal_id + measurement_date)
- `idx_parasite_records_animal_date` - parasite_records (animal_id + record_date)
- `idx_body_measurements_animal_date` - body_measurements (animal_id + measurement_date)
- `idx_carcass_measurements_animal_date` - carcass_measurements (animal_id + measurement_date)

#### Tabelas de Controle Animal
- `idx_animal_movements_property` - animal_movements (property_id + movement_date)
- `idx_animal_movements_animal` - animal_movements (animal_id)
- `idx_clinical_occurrences_animal` - clinical_occurrences (animal_id + occurrence_date)
- `idx_clinical_occurrences_property` - clinical_occurrences (property_id)
- `idx_parasite_controls_animal` - parasite_controls (animal_id + application_date)
- `idx_parasite_controls_property` - parasite_controls (property_id)

#### Vacinações
- `idx_vaccinations_property` - vaccinations (property_id + vaccination_date)
- `idx_vaccinations_herd` - vaccinations (herd_id)
- `idx_vaccination_animals_vaccination` - vaccination_animals (vaccination_id)
- `idx_vaccination_animals_animal` - vaccination_animals (animal_id)

### 2. Cache de Memória

Implementado cache para queries frequentes:

- **Cache de Propriedades do Usuário**: Armazena as propriedades de cada usuário por 5 minutos, evitando queries repetidas em todas as verificações de permissão.

```python
# Exemplo de uso
from app.core.optimizations import check_permission_optimized

is_authorized, allowed_properties = check_permission_optimized(
    session, current_user, property_id
)
```

### 3. Otimização SQLite

Configurações aplicadas ao SQLite:

- **WAL Mode** (`journal_mode=WAL`): Melhora concorrência e performance de escrita
- **Synchronous NORMAL**: Balance entre performance e segurança
- **Cache de 64MB** (`cache_size=-64000`): Muito mais rápido que o padrão (2MB)
- **Temp Store em Memória** (`temp_store=MEMORY`): Operações temporárias em RAM

### 4. Connection Pooling

- Configurado `pool_pre_ping` para verificar conexões antes de usar
- Timeout de 30 segundos configurado para SQLite

### 5. Otimização de Queries

#### Antes (Problema N+1):
```python
producer_properties = session.exec(
    select(Property.id).where(Property.producer_id == current_user.id)
).all()
if not producer_properties:
    return []
statement = statement.where(Animal.property_id.in_(producer_properties))
```

#### Depois (Otimizado):
```python
is_authorized, allowed_properties = check_permission_optimized(
    session, current_user, property_id
)
# Cache + query otimizada
```

## 🚀 Ganhos Esperados

### Índices
- **50-90% mais rápido** em queries com filtros (property_id, status, data)
- Busca por identificação de animal: **De O(n) para O(log n)**

### Cache
- **90-95% redução** em queries de propriedades do usuário
- Permissões verificadas muito mais rápido

### SQLite WAL
- **30-50% mais rápido** em operações de escrita
- Melhor performance em leitura simultânea

### Cache SQLite (64MB)
- **Substancial melhoria** em queries complexas
- Menos I/O de disco

## 📈 Como Testar

1. **Antes**: Execute uma query de listagem de animais e meça o tempo
2. **Depois**: Execute a mesma query após as otimizações
3. **Compare**: O tempo deve ser significativamente menor

### Exemplo de Teste

```python
import time
from app.core.db import get_session
from app.models.animal import Animal
from sqlmodel import select

start = time.time()
with next(get_session()) as session:
    result = session.exec(
        select(Animal).where(Animal.property_id == "farm_123")
    ).all()
elapsed = time.time() - start
print(f"Tempo: {elapsed:.3f}s")
```

## 🔧 Como Aplicar as Otimizações

Execute o script de otimização:

```bash
cd api
python apply_performance_optimizations.py
```

## 📝 Arquivos Modificados

1. `app/core/db.py` - Engine otimizado + cache + índices
2. `app/core/optimizations.py` - Helpers de otimização
3. `app/routers/animals.py` - Queries otimizadas
4. `app/routers/animal_control.py` - Queries otimizadas
5. `apply_performance_optimizations.py` - Script de aplicação

## 🎯 Próximos Passos (Sugestões)

Se ainda precisar de mais performance:

1. **Migrar para PostgreSQL**: Muito melhor para produção com múltiplos usuários
2. **Redis Cache**: Cache distribuído para múltiplas instâncias da API
3. **Query Caching**: Cache de resultados de queries complexas
4. **Lazy Loading**: Carregar relações apenas quando necessário
5. **Pagination**: Implementar em todas as listagens

## 📚 Referências

- [SQLite Optimization](https://www.sqlite.org/performance.html)
- [SQLModel Performance](https://sqlmodel.tiangolo.com/tutorial/performance/)
- [FastAPI Performance](https://fastapi.tiangolo.com/advanced/performance/)

