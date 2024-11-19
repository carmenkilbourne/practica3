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
  const ninoscollection = db.collection<NinosModel>('ninos');
  const lugarcollection = db.collection<LugarModel>('lugares');
  const handler= async (req:Request): Promise<Response> =>
  {
     const method =req.method;
     const url = new URL(req.url);
     const path = url.pathname;
     if(method === "/GET"){
         if(path === "/ninos/buenos"){
             
         }else if(path === "/ninos/malos"){

         }else if(path === "/entregas"){

         }else if(path === "/ruta"){

         }
    }else if(method === "POST"){
      if(path === "/ubicacion"){
        const body = await req.json()
        if(body.nombre && body.coordenadas && body.ninosBuenos){

          if (body.coordenadas.size === 2&& body.coordenadas.typeof === "number"){
            const name = body.nombre;
            const lugar = lugarcollection.find({name});
            if(!lugar){
              const newlugar = lugarcollection.insertOne({_id: new ObjectId,coordenadas:body.coordenadas,nombre:body.nombre,ninosBuenos:body.ninosBuenos});
              return new Response(JSON.stringify(newlugar),{status:200});
            }else{
              return new Response("ya existe",{status:400})
            }
          }

        }
        return new Response("Data body not found",{status:400})
      }else if( path === "/ninos"){

      }
    }
    return new Response("No endpoint",{status:404});
  } 
  Deno.serve({ port: 6768 }, handler);

