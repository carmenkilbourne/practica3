import { MongoClient, ObjectId } from 'mongodb'
import { LugarModel, NinosModel } from "./types.ts";
import { ModelToNino } from "./resolvers.ts";

// Connection URL
const url = Deno.env.get("MONGO_URL");
if(!url){
    Deno.exit(1);
}
const client = new MongoClient(url);
const dbName = 'nebrijadb';
  await client.connect();
  console.log('Conexion exitosa');
  const db = client.db(dbName);
  const ninoscollection = db.collection<NinosModel>("ninos");
  const lugarcollection = db.collection<LugarModel>("lugares");
  const handler= async (req:Request): Promise<Response> =>
  {
     const method =req.method;
     const url = new URL(req.url);
     const path = url.pathname;
   if(method === "POST"){
      if(path === "/ubicacion"){
        const body = await req.json();
        if(body.nombre && body.coordenadas && body.ninosBuenos){

            const nombre =  body.nombre;
            const lugar = await lugarcollection.findOne({nombre});
            const coordenadas =  body.coordenadas;
            if(!lugar){
              if(coordenadas.length === 2 && coordenadas.every(c => typeof c === "number")){//error aqui
                const {insertedId } =  await lugarcollection.insertOne({coordenadas: body.coordenadas, nombre: body.nombre, ninosBuenos: body.ninosBuenos });
              return new Response(JSON.stringify({coordenadas:body.coordenadas,nombre:body.nombre,ninosBuenos:body.ninosBuenos,id:insertedId }),{status:201});
              }   
              else{
                return new Response("Coordenadas mal",{status:400})

              }
            }else{
              return new Response("ya existe",{status:409})
            }

        }
        return new Response("Data body not found",{status:400})
      }
      else if(path === "/ninos"){
        const ninos = await req.json();
        if(ninos.nombre ){
          const nombre =  ninos.nombre;
          const nino = await ninoscollection.findOne({nombre});
          const comportamiento = ninos.comportamiento;
          if(!nino){
            if(typeof comportamiento === "boolean" ){//error aqui
              const {insertedId } =  await ninoscollection.insertOne({ nombre: ninos.nombre, comportamiento:ninos.comportamiento, ubicacion:ninos.ubicacion});
            return new Response(JSON.stringify({nombre: ninos.nombre, comportamiento:ninos.comportamiento, ubicacion:ninos.ubicacion,id:insertedId }),{status:201});
            }   
           
          }
          else{
            return new Response("El nino ya existe",{status:409})
          }
        }
        return new Response("Data body not found",{status:400})
      }
    }
    else if(method === "GET"){
      if(path === "/ninos/malos"){ //hay que hacer condicion por si no existe ningun false
        const ninosMalossdb = await ninoscollection.find({comportamiento:false}).toArray();
        const ninosMalos = await Promise.all(
        ninosMalossdb.map((n) =>ModelToNino(lugarcollection,n)));
        return new Response(JSON.stringify(ninosMalos),{status:200});
      }
      if(path === "/ninos/buenos"){ //hay que hacer condicion por si no existe ningun true
        const ninosBuenosdb = await ninoscollection.find({comportamiento:true}).toArray();
        const ninosBuenos = await Promise.all(
        ninosBuenosdb.map((n) =>ModelToNino(lugarcollection,n)));
        return new Response(JSON.stringify(ninosBuenos),{status:200});
      }
    /*   if(path === "/entregas"){
        const ninosBuenosdb = await ninoscollection.find().toArray();

      } */
    }
    return new Response("No endpoint",{status:404});
  } 
  Deno.serve({ port: 6768 }, handler);

