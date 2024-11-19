import { MongoClient } from 'mongodb'
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
    // const method =req.method;
    // const url = new URL(req.url);
    // const path = url.pathname;
    // if(method === "/GET"){
    //     if(path === "/ninos"){
    //         //const nino = await ninoscollection
    //     }
    // }
    return new Response("No endpoint",{status:404});

  } 
  Deno.serve({ port: 6768 }, handler);

