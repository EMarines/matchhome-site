import { i as inventoryData } from "../../../../chunks/inventory.js";
import { m as mockProperties } from "../../../../chunks/mockProperties.js";
import { error } from "@sveltejs/kit";
async function load({ params, fetch }) {
  const { id } = params;
  const staticProperty = inventoryData.find((p) => p.public_id === id);
  if (staticProperty) return { property: staticProperty };
  try {
    const res = await fetch(`/api/properties/${id}`, {
      headers: {
        "X-Authorization": "pqnjps13ry7iaudododsi455mg22mt",
        "accept": "application/json"
      }
    });
    if (res.ok) {
      const data = await res.json();
      return { property: data };
    }
  } catch (e) {
    console.warn("API fetch failed", e);
  }
  const mock = mockProperties.find((p) => p.public_id === id);
  if (mock) return { property: mock };
  throw error(404, "Propiedad no encontrada");
}
export {
  load
};
