/**
 * Constantes pour les formulaires de véhicules
 */

export const vehicleTypes = [
  { value: 'container', label: 'Conteneur standard' },
  { value: 'container-20ft', label: 'Conteneur 20 pieds' },
  { value: 'container-40ft', label: 'Conteneur 40 pieds' },
  { value: 'container-refrigerated', label: 'Conteneur frigorifique' },
  { value: 'truck', label: 'Camion' },
  { value: 'refrigerated-truck', label: 'Camion frigorifique' },
  { value: 'trailer', label: 'Remorque' },
  { value: 'vessel', label: 'Navire' },
  { value: 'aircraft', label: 'Avion cargo' }
];

export const transporterVehicleTypes = [
  { value: 'motorcycle', label: 'Moto' },
  { value: 'van', label: 'Fourgonnette' },
  { value: 'truck', label: 'Camion' },
  { value: 'refrigerated-truck', label: 'Camion frigorifique' },
  { value: 'trailer', label: 'Remorque' },
  { value: 'container-truck', label: 'Camion conteneur' }
];

export const specialFeaturesOptions = [
  { value: 'refrigerated', label: 'Frigorifique' },
  { value: 'insulated', label: 'Isolé' },
  { value: 'ventilated', label: 'Ventilé' },
  { value: 'covered', label: 'Couvert' },
  { value: 'gps-tracked', label: 'Suivi GPS' },
  { value: 'temperature-controlled', label: 'Température contrôlée' }
];
