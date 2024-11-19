import { MongoClient, ObjectId } from 'mongodb'
import { LugarModel, NinosModel } from "./types.ts";

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
                const {insertedId } =  await lugarcollection.insertOne({coordenadas:body.coordenadas,nombre:body.nombre,ninosBuenos:body.ninosBuenos});
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
    }
    return new Response("No endpoint",{status:404});
  } 
  Deno.serve({ port: 6768 }, handler);

