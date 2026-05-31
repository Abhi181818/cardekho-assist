import carsData from "../data/cars.json";

export function getAllCars() {
  return carsData;
}

export function getCarContext() {
  return carsData
    .map(
      (c) =>
        `${c.make} ${c.model} ${c.variant} ${c.year} | ₹${c.price_lakh}L | ${c.fuel} ${c.transmission} | ${c.body_type} | ${c.seating}S | ${c.mileage_kmpl}kmpl | Safety:${c.safety_rating}/5 | Rating:${c.user_rating}/5 | Boot:${c.boot_space_litres}L | Tags:${c.tags.join(",")}`,
    )
    .join("\n");
}
