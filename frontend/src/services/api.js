// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Função auxiliar para fazer requisições HTTP
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Adiciona token de autenticação se existir
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, config);
    
    // Se a resposta não for ok, lança erro
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(error.detail || `Erro ${response.status}`);
    }

    // Retorna resposta JSON
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// ============ AUTENTICAÇÃO ============

/**
 * Faz login do usuário
 */
export async function login(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Registra novo usuário
 */
export async function register(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Busca dados do usuário atual
 */
export async function getCurrentUser() {
  return apiRequest('/auth/me');
}

/**
 * Atualiza dados do usuário atual
 */
export async function updateCurrentUser(userData) {
  return apiRequest('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

/**
 * Altera senha do usuário
 */
export async function changePassword(oldPassword, newPassword) {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
}

// ============ ANIMAIS ============

export async function getAnimals(filters = {}) {
  const params = new URLSearchParams();
  
  // Adiciona filtros se existirem
  if (filters.q) params.append('q', filters.q);
  if (filters.property_id) params.append('property_id', filters.property_id);
  if (filters.herd_id) params.append('herd_id', filters.herd_id);
  if (filters.skip) params.append('skip', filters.skip);
  if (filters.limit) params.append('limit', filters.limit);
  
  const queryString = params.toString();
  const url = queryString ? `/animals/?${queryString}` : '/animals/';
  
  return apiRequest(url);
}

export async function getAnimal(id) {
  return apiRequest(`/animals/${id}`);
}

export async function createAnimal(data) {
  return apiRequest('/animals/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAnimal(id, data) {
  return apiRequest(`/animals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAnimal(id) {
  return apiRequest(`/animals/${id}`, {
    method: 'DELETE',
  });
}

// Desenvolvimento Ponderal (Peso)
export async function getAnimalWeights(animalId) {
  return apiRequest(`/animals/${animalId}/weights`);
}

export async function createAnimalWeight(animalId, data) {
  return apiRequest(`/animals/${animalId}/weights`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Verminose
export async function getAnimalParasites(animalId) {
  return apiRequest(`/animals/${animalId}/parasites`);
}

export async function createAnimalParasite(animalId, data) {
  return apiRequest(`/animals/${animalId}/parasites`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Medidas Corporais
export async function getAnimalBodyMeasurements(animalId) {
  return apiRequest(`/animals/${animalId}/body-measurements`);
}

export async function createAnimalBodyMeasurement(animalId, data) {
  return apiRequest(`/animals/${animalId}/body-measurements`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Medidas de Carcaça
export async function getAnimalCarcassMeasurements(animalId) {
  return apiRequest(`/animals/${animalId}/carcass-measurements`);
}

export async function createAnimalCarcassMeasurement(animalId, data) {
  return apiRequest(`/animals/${animalId}/carcass-measurements`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============ LOTES ============

export async function getBatches() {
  return apiRequest('/batches/');
}

export async function getBatch(id) {
  return apiRequest(`/batches/${id}`);
}

export async function createBatch(data) {
  return apiRequest('/batches/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBatch(id, data) {
  return apiRequest(`/batches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBatch(id) {
  return apiRequest(`/batches/${id}`, {
    method: 'DELETE',
  });
}

// ============ PROPRIEDADES/FAZENDAS ============

export async function getProperties() {
  return apiRequest('/properties/');
}

export async function getProperty(id) {
  return apiRequest(`/properties/${id}`);
}

export async function createProperty(data) {
  return apiRequest('/properties/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProperty(id, data) {
  return apiRequest(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProperty(id) {
  return apiRequest(`/properties/${id}`, {
    method: 'DELETE',
  });
}

// Aliases para fazendas (mesma coisa que properties)
export const getFarms = getProperties;
export const getFarm = getProperty;
export const createFarm = createProperty;
export const updateFarm = updateProperty;
export const deleteFarm = deleteProperty;

// ============ REBANHOS/LOTES (HERDS) ============

export async function getHerds() {
  return apiRequest('/herds/');
}

export async function getHerd(id) {
  return apiRequest(`/herds/${id}`);
}

export async function createHerd(data) {
  return apiRequest('/herds/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateHerd(id, data) {
  return apiRequest(`/herds/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteHerd(id) {
  return apiRequest(`/herds/${id}`, {
    method: 'DELETE',
  });
}

// ============ FUNCIONÁRIOS ============

export async function getEmployees(propertyId = null) {
  const url = propertyId ? `/employees/?property_id=${propertyId}` : '/employees/';
  return apiRequest(url);
}

export async function getEmployee(id) {
  return apiRequest(`/employees/${id}`);
}

export async function createEmployee(data) {
  return apiRequest('/employees/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(id, data) {
  return apiRequest(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEmployee(id) {
  return apiRequest(`/employees/${id}`, {
    method: 'DELETE',
  });
}

export async function changeEmployeePassword(id, newPassword) {
  return apiRequest(`/employees/${id}/change-password`, {
    method: 'POST',
    body: JSON.stringify({ new_password: newPassword }),
  });
}

// ============ MEDICAMENTOS ============

export async function getMedicines() {
  return apiRequest('/medicines/');
}

export async function getMedicine(id) {
  return apiRequest(`/medicines/${id}`);
}

export async function createMedicine(data) {
  return apiRequest('/medicines/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMedicine(id, data) {
  return apiRequest(`/medicines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMedicine(id) {
  return apiRequest(`/medicines/${id}`, {
    method: 'DELETE',
  });
}

// ============ RAÇAS ============

export async function getRaces() {
  return apiRequest('/races/');
}

export async function getRace(id) {
  return apiRequest(`/races/${id}`);
}

export async function createRace(data) {
  return apiRequest('/races/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRace(id, data) {
  return apiRequest(`/races/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRace(id) {
  return apiRequest(`/races/${id}`, {
    method: 'DELETE',
  });
}

// Aliases antigos (breeds) para compatibilidade
export const getBreeds = getRaces;
export const getBreed = getRace;
export const createBreed = createRace;
export const updateBreed = updateRace;
export const deleteBreed = deleteRace;

// ============ DOENÇAS ============

export async function getIllnesses() {
  return apiRequest('/illnesses/');
}

export async function getIllness(id) {
  return apiRequest(`/illnesses/${id}`);
}

export async function createIllness(data) {
  return apiRequest('/illnesses/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateIllness(id, data) {
  return apiRequest(`/illnesses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteIllness(id) {
  return apiRequest(`/illnesses/${id}`, {
    method: 'DELETE',
  });
}

// ============ MANEJO REPRODUTIVO ============

export async function getReproductiveManagements() {
  return apiRequest('/reproductive-management/');
}

export async function getReproductiveManagement(id) {
  return apiRequest(`/reproductive-management/${id}`);
}

export async function createReproductiveManagement(data) {
  return apiRequest('/reproductive-management/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReproductiveManagement(id, data) {
  return apiRequest(`/reproductive-management/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReproductiveManagement(id) {
  return apiRequest(`/reproductive-management/${id}`, {
    method: 'DELETE',
  });
}

export async function getOffspring(managementId) {
  return apiRequest(`/reproductive-management/${managementId}/offspring`);
}

export async function addOffspring(managementId, data) {
  return apiRequest(`/reproductive-management/${managementId}/offspring`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function removeOffspring(managementId, offspringId) {
  return apiRequest(`/reproductive-management/${managementId}/offspring/${offspringId}`, {
    method: 'DELETE',
  });
}

// ============ MOVIMENTAÇÃO ANIMAL ============

export async function getAnimalMovements() {
  return apiRequest('/animal-movements/');
}

export async function getAnimalMovement(id) {
  return apiRequest(`/animal-movements/${id}`);
}

export async function createAnimalMovement(data) {
  return apiRequest('/animal-movements/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAnimalMovement(id) {
  return apiRequest(`/animal-movements/${id}`, {
    method: 'DELETE',
  });
}

// ============ OCORRÊNCIA CLÍNICA ============

export async function getClinicalOccurrences() {
  return apiRequest('/clinical-occurrences/');
}

export async function getClinicalOccurrence(id) {
  return apiRequest(`/clinical-occurrences/${id}`);
}

export async function createClinicalOccurrence(data) {
  return apiRequest('/clinical-occurrences/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteClinicalOccurrence(id) {
  return apiRequest(`/clinical-occurrences/${id}`, {
    method: 'DELETE',
  });
}

// ============ CONTROLE PARASITÁRIO ============

export async function getParasiteControls() {
  return apiRequest('/parasite-controls/');
}

export async function getParasiteControl(id) {
  return apiRequest(`/parasite-controls/${id}`);
}

export async function createParasiteControl(data) {
  return apiRequest('/parasite-controls/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteParasiteControl(id) {
  return apiRequest(`/parasite-controls/${id}`, {
    method: 'DELETE',
  });
}

// ============ VACINAÇÃO ============

export async function getVaccinations() {
  return apiRequest('/vaccinations/');
}

export async function getVaccination(id) {
  return apiRequest(`/vaccinations/${id}`);
}

export async function createVaccination(data) {
  return apiRequest('/vaccinations/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getVaccinationAnimals(vaccinationId) {
  return apiRequest(`/vaccinations/${vaccinationId}/animals`);
}

export async function deleteVaccination(id) {
  return apiRequest(`/vaccinations/${id}`, {
    method: 'DELETE',
  });
}

// ============ EVENTOS ============

export async function getEvents() {
  return apiRequest('/events/');
}

export async function getEvent(id) {
  return apiRequest(`/events/${id}`);
}

export async function createEvent(data) {
  return apiRequest('/events/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id, data) {
  return apiRequest(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id) {
  return apiRequest(`/events/${id}`, {
    method: 'DELETE',
  });
}

// ============ USUÁRIOS ============

export async function getUsers() {
  return apiRequest('/users/');
}

export async function getUser(id) {
  return apiRequest(`/users/${id}`);
}

export async function updateUser(id, data) {
  return apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id) {
  return apiRequest(`/users/${id}`, {
    method: 'DELETE',
  });
}

export default {
  login,
  register,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  getAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  getAnimalWeights,
  createAnimalWeight,
  getAnimalParasites,
  createAnimalParasite,
  getAnimalBodyMeasurements,
  createAnimalBodyMeasurement,
  getAnimalCarcassMeasurements,
  createAnimalCarcassMeasurement,
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
  getHerds,
  getHerd,
  createHerd,
  updateHerd,
  deleteHerd,
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  changeEmployeePassword,
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getRaces,
  getRace,
  createRace,
  updateRace,
  deleteRace,
  getBreeds,
  getBreed,
  createBreed,
  updateBreed,
  deleteBreed,
  getIllnesses,
  getIllness,
  createIllness,
  updateIllness,
  deleteIllness,
  getReproductiveManagements,
  getReproductiveManagement,
  createReproductiveManagement,
  updateReproductiveManagement,
  deleteReproductiveManagement,
  getOffspring,
  addOffspring,
  removeOffspring,
  getAnimalMovements,
  getAnimalMovement,
  createAnimalMovement,
  deleteAnimalMovement,
  getClinicalOccurrences,
  getClinicalOccurrence,
  createClinicalOccurrence,
  deleteClinicalOccurrence,
  getParasiteControls,
  getParasiteControl,
  createParasiteControl,
  deleteParasiteControl,
  getVaccinations,
  getVaccination,
  createVaccination,
  getVaccinationAnimals,
  deleteVaccination,
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};

// ============ ACASALAMENTO ============

/**
 * Busca animais elegíveis para acasalamento
 */
export async function getEligibleAnimals(herdId, minAgeMale, minAgeFemale) {
  const params = new URLSearchParams();
  if (minAgeMale) params.append('min_age_male_months', minAgeMale);
  if (minAgeFemale) params.append('min_age_female_months', minAgeFemale);
  
  return apiRequest(`/mating/eligible-animals/${herdId}?${params.toString()}`);
}

/**
 * Calcula avaliação genética do rebanho
 */
export async function calculateGeneticEvaluation(herdId, heritability, weightAdjustmentDays) {
  const params = new URLSearchParams();
  if (heritability) params.append('heritability', heritability);
  if (weightAdjustmentDays) params.append('weight_adjustment_days', weightAdjustmentDays);
  
  return apiRequest(`/mating/calculate-genetic-evaluation/${herdId}?${params.toString()}`, {
    method: 'POST',
  });
}

/**
 * Executa simulação de acasalamentos
 */
export async function simulateMating(params, selectedMaleIds, selectedFemaleIds) {
  const queryParams = new URLSearchParams();
  selectedMaleIds.forEach(id => queryParams.append('selected_male_ids', id));
  selectedFemaleIds.forEach(id => queryParams.append('selected_female_ids', id));
  
  return apiRequest(`/mating/simulate?${queryParams.toString()}`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Lista recomendações de uma simulação
 */
export async function getMatingRecommendations(simulationId) {
  return apiRequest(`/mating/recommendations/${simulationId}`);
}

/**
 * Adota uma recomendação de acasalamento
 */
export async function adoptRecommendation(recommendationId) {
  return apiRequest(`/mating/recommendations/${recommendationId}/adopt`, {
    method: 'POST',
  });
}

/**
 * Cria coberturas em lote a partir de recomendações
 */
export async function batchCreateCoverages(simulationId, coverageDate, defaultDamWeight, defaultDamBodyCondition) {
  const params = new URLSearchParams();
  params.append('coverage_date', coverageDate);
  if (defaultDamWeight) params.append('default_dam_weight', defaultDamWeight);
  if (defaultDamBodyCondition) params.append('default_dam_body_condition', defaultDamBodyCondition);
  
  return apiRequest(`/mating/recommendations/batch-create-coverages/${simulationId}?${params.toString()}`, {
    method: 'POST',
  });
}

/**
 * Relatório de previsão de partos
 */
export async function getBirthPredictions(herdId) {
  return apiRequest(`/mating/reports/birth-predictions/${herdId}`);
}

/**
 * Relatório de coberturas por reprodutor
 */
export async function getCoverageByReproducer(herdId) {
  return apiRequest(`/mating/reports/coverage-by-reproducer/${herdId}`);
}

