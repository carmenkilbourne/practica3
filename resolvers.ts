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
        ubicacion:lugares.map((l) => ModelToLugar(l))
    };
}




export const  ModelToLugar = (lugarmodel:LugarModel):Lugar =>({
    id:lugarmodel._id!.toString(),
    nombre:lugarmodel.nombre,
    coordenadas:lugarmodel.coordenadas,
    ninosBuenos:lugarmodel.ninosBuenos
});