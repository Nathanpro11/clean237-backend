export const mockDonnees = [
  {
    type: "temperature",
    zoneId: "12345",
    valeur: 23.5,
    unite: "C",
    date: new Date().toISOString(),
    source: "capteur-1",
    description: "Température ambiante",
  },
  {
    type: "humidity",
    zoneId: "12346",
    valeur: 55,
    unite: "%",
    date: new Date().toISOString(),
    source: "capteur-2",
    description: "Humidité relative",
  },
];
// Only mock `DonneeEnvironnementale` here. Analyses and Rapports are real
// entities managed by this module and should be created via the services
// in integration tests using the mocked donnee records as input.
