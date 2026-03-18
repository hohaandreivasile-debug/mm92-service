// src/data/fleet.js — Turbine fleet data for Blue Line Energy

export const FLEET = {
  mm92: {
    type: "Senvion MM92",
    parks: [
      {
        id: "blue2",
        name: "CEE Blue 2",
        commissioning: "15.11.2013",
        turbines: [
          { id: "mm92_t1", label: "Turbina 1", serial: "91929" },
          { id: "mm92_t2", label: "Turbina 2", serial: "91812" },
          { id: "mm92_t3", label: "Turbina 3", serial: "92692" }
        ]
      },
      {
        id: "bestepe",
        name: "CEE Bestepe",
        commissioning: "01.10.2016",
        turbines: [
          { id: "mm92_t4", label: "Turbina 4", serial: "93337" },
          { id: "mm92_t5", label: "Turbina 5", serial: "91178" }
        ]
      }
    ]
  },
  pw56: {
    type: "PowerWind PW56",
    parks: [
      {
        id: "pw_park",
        name: "Parc PW56",
        commissioning: "11.11.2011",
        turbines: [
          { id: "pw56_t1", label: "Turbina 1", serial: "56110214" },
          { id: "pw56_t2", label: "Turbina 2", serial: "56110213" }
        ]
      }
    ]
  }
};

// Get all turbines flat list (for interventions)
export function getAllTurbines() {
  const all = [];
  Object.entries(FLEET).forEach(([typeKey, typeData]) => {
    typeData.parks.forEach(park => {
      park.turbines.forEach(t => {
        all.push({
          ...t,
          park: park.name,
          parkId: park.id,
          commissioning: park.commissioning,
          turbineType: typeData.type,
          typeKey
        });
      });
    });
  });
  return all;
}

// Get parks for a specific turbine type
export function getParks(typeKey) {
  return FLEET[typeKey]?.parks || [];
}

// Get turbines for a specific park
export function getTurbinesForPark(typeKey, parkId) {
  const park = FLEET[typeKey]?.parks.find(p => p.id === parkId);
  return park?.turbines || [];
}
