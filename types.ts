import {ObjectId} from "mongodb"
export type Ninos ={
    nombre:string;
    comportamiento:boolean;
    ubicacion:Lugar[];
    id:string;
};
export type NinosModel ={
    nombre:string;
    comportamiento:boolean;
    ubicacion:ObjectId[];
    _id:ObjectId;
};
export type Lugar ={
    nombre:string;
    coordenadas:number[];
    ninosBuenos:number;
    id:string;
};
export type LugarModel ={
    nombre:string;
    coordenadas:number[];
    ninosBuenos:number;
    _id:ObjectId;
};
