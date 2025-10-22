from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.db import init_db
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.properties import router as properties_router
from app.routers.employees import router as employees_router
from app.routers.animals import router as animals_router
from app.routers.batches import router as batches_router
from app.routers.breeds import router as breeds_router
from app.routers.herds import router as herds_router
from app.routers.races import router as races_router
from app.routers.illnesses import router as illnesses_router
from app.routers.medicines import router as medicines_router
from app.routers.reproductive_management import router as reproductive_management_router
from app.routers.animal_control import router_movement, router_clinical, router_parasite, router_vaccination
from app.routers.mating import router as mating_router
from app.routers.events import router as events_router

app = FastAPI(
    title="API Pravaler - Sistema de Gestão Pecuária",
    description="API completa para gestão de propriedades rurais, animais e eventos pecuários",
    version="1.0.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, PUT, DELETE, etc)
    allow_headers=["*"],  # Permite todos os headers
)

@app.on_event("startup")
def on_startup():
    init_db()

# Include all routers
app.include_router(auth_router)  # Autenticação (público)
app.include_router(users_router)
app.include_router(properties_router)  # Fazendas/Propriedades
app.include_router(employees_router)  # Funcionários
app.include_router(animals_router)
app.include_router(batches_router)
app.include_router(breeds_router)
app.include_router(herds_router)
app.include_router(races_router)  # Raças
app.include_router(illnesses_router)  # Doenças
app.include_router(medicines_router)
app.include_router(reproductive_management_router)  # Manejo Reprodutivo
app.include_router(mating_router)  # Acasalamento e Seleção
app.include_router(router_movement)  # Movimentação Animal
app.include_router(router_clinical)  # Ocorrência Clínica
app.include_router(router_parasite)  # Controle Parasitário
app.include_router(router_vaccination)  # Vacinação
app.include_router(events_router)

@app.get("/")
def root():
    return {"message": "API Pravaler - Sistema de Gestão Pecuária", "version": "1.0.0"}
