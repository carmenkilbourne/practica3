import {ObjectId, type OptionalId} from "mongodb"
export type Ninos ={
    nombre:string;
    comportamiento:boolean;
    ubicacion:Lugar[];
    id:string;
};

export type Lugar ={
    nombre:string;
    coordenadas:number[];
    ninosBuenos:number;
    id:string;
};

export type LugarModel =OptionalId<{
    nombre:string;
    coordenadas:number[];
    ninosBuenos:number;
}>;

export type NinosModel = OptionalId<{
    nombre:string;
    comportamiento:boolean;
    ubicacion:ObjectId[];
}>;