import { Collection } from "mongodb";
import { Lugar, LugarModel, Ninos, NinosModel } from "./types.ts";

export const  ModelToNino = async(
    lugarcollections:Collection<LugarModel>,
    ninosdb:NinosModel
):Promise<Ninos> =>{
    const lugares = await lugarcollections.find({_id:{$in:ninosdb.ubicacion}}).toArray();
    return {
        nombre:ninosdb.nombre,
        comportamiento:ninosdb.comportamiento,
        id:ninosdb._id!.toString(),
        ubicacion:lugares.map((l) => ModelToLugar(l)),
    };
};

export const  ModelToLugar = (lugarmodel:LugarModel):Lugar =>({
    id:lugarmodel._id!.toString(),
    nombre:lugarmodel.nombre,
    coordenadas:lugarmodel.coordenadas,
    ninosBuenos:lugarmodel.ninosBuenos
});
export const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const toRad = (deg: number) => (deg * Math.PI) / 180; // Conversión a radianes
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);
    const a = Math.sin(dLat / 2) ** 2 +
         Math.cos(lat1Rad) * Math.cos(lat2Rad) *
         Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }