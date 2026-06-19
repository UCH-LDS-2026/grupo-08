/**
 * Devuelve solo los campos técnicos del vehículo, sin datos del dueño.
 * Usado en los endpoints públicos de historial.
 */
function sanitizarVehiculoPublico(vehiculo) {
    if (!vehiculo) return null;
    const obj = {
        id: vehiculo.id,
        patente: vehiculo.patente,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        kilometraje: vehiculo.kilometraje,
    };
    if (vehiculo.vin != null) obj.vin = vehiculo.vin;
    return obj;
}

module.exports = { sanitizarVehiculoPublico };
