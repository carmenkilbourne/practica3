import { MongoClient, ObjectId } from "mongodb";
import { LugarModel, NinosModel } from "./types.ts";
import { haversine, ModelToLugar, ModelToNino } from "./resolvers.ts";

const MONGO_URL = "mongodb+srv://ckilbourne:12345@nebrija-cluster.cumaf.mongodb.net/?retryWrites=true&w=majority&appName=Nebrija-Cluster";
// Connection URL
/* const url = Deno.env.get("MONGO_URL");
if (!url) {
  throw new Error("Please provide a MONGO_URL");
} */
const client = new MongoClient(MONGO_URL);
const dbName = "nebrijadb";
await client.connect();
console.log("Conexion exitosa");
const db = client.db(dbName);
const ninoscollection = db.collection<NinosModel>("ninos");
const lugarcollection = db.collection<LugarModel>("lugares");
const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;
  if (method === "POST") {
    if (path === "/ubicacion") {
      const body = await req.json();
      if (body.nombre && body.coordenadas && body.ninosBuenos) {
        const nombre = body.nombre;
        const lugar = await lugarcollection.findOne({ nombre });
        const coordenadas = body.coordenadas;
        if (!lugar) {
          if (coordenadas.length === 2) {
            const { insertedId } = await lugarcollection.insertOne({
              coordenadas: body.coordenadas,
              nombre: body.nombre,
              ninosBuenos: body.ninosBuenos,
            });
            return new Response(
              JSON.stringify({
                coordenadas: body.coordenadas,
                nombre: body.nombre,
                ninosBuenos: body.ninosBuenos,
                id: insertedId,
              }),
              { status: 201 },
            );
          } else {
            return new Response("Coordenadas mal", { status: 400 });
          }
        } else {
          return new Response("ya existe", { status: 409 });
        }
      }
      return new Response(
        "Los campos nombre, coordenadas y numero de ninos buenos son obligatorios",
        { status: 400 },
      );
    } else if (path === "/ninos") {
      const ninos = await req.json();
      if (ninos.nombre) {
        const nombre = ninos.nombre;
        const nino = await ninoscollection.findOne({ nombre });
        const ubicaciones = ninos.ubicacion.map((id: string) =>
          new ObjectId(id)
        );
        const comportamiento = ninos.comportamiento;

        if (!nino) {
          if (typeof comportamiento === "boolean") {
            const { insertedId } = await ninoscollection.insertOne({
              nombre: ninos.nombre,
              comportamiento: ninos.comportamiento,
              ubicacion: ubicaciones,
            });
            return new Response(
              JSON.stringify({
                nombre: ninos.nombre,
                comportamiento: ninos.comportamiento,
                ubicacion: ninos.ubicacion,
                id: insertedId,
              }),
              { status: 201 },
            );
          }
        } else {
          return new Response("El nino ya existe", { status: 409 });
        }
      }
      return new Response(
        "Los campos nombre, comportamiento y ubicacion de ninos son obligatorios",
        { status: 400 },
      );
    }
  } else if (method === "GET") {
    if (path === "/ninos/malos") {
      const ninosMalossdb = await ninoscollection.find({
        comportamiento: false,
      }).toArray();
      if (!ninosMalossdb) {
        return new Response("No hay ninos malos", { status: 404 });
      }
      const ninosMalos = await Promise.all(
        ninosMalossdb.map((n) => ModelToNino(lugarcollection, n)),
      );
      return new Response(JSON.stringify(ninosMalos), { status: 200 });
    } else if (path === "/ninos/buenos") {
      const ninosBuenosdb = await ninoscollection.find({ comportamiento: true })
        .toArray();
      if (!ninosBuenosdb) {
        return new Response("No hay ninos malos", { status: 404 });
      }
      const ninosBuenos = await Promise.all(
        ninosBuenosdb.map((n) => ModelToNino(lugarcollection, n)),
      );
      return new Response(JSON.stringify(ninosBuenos), { status: 200 });
    } else if (path === "/entregas") { //organizados respecto a cantidad de ninosBuenos(de mas a menos)
      const ubicacionesdb = await lugarcollection.find().toArray();
      const ubicaciones = await Promise.all(
        ubicacionesdb.map((u) => ModelToLugar(u)),
      );
      const ubicacionesOrdenadas = ubicaciones.sort((a, b) => {
        return b.ninosBuenos - a.ninosBuenos;
      });
      return new Response(JSON.stringify(ubicacionesOrdenadas), {
        status: 200,
      });
    } else if (path === "/ruta") {
      const ubicacionesdb = await lugarcollection.find().toArray();
      const ubicaciones = await Promise.all(
        ubicacionesdb.map((u) => ModelToLugar(u)),
      );

      const ubicacionesOrdenadas = ubicaciones.sort((a, b) => {
        return b.ninosBuenos - a.ninosBuenos;
      });
      const distancias = ubicacionesOrdenadas.reduce((acc, elem, i, a) => {
        if (i === a.length - 1) return acc;
        const siguiente = a[i + 1];
        return acc +
          haversine(
            elem.coordenadas[0],
            elem.coordenadas[1],
            siguiente.coordenadas[0],
            siguiente.coordenadas[1],
          );
      }, 0);
      return new Response(
        "distancia total a recorrer por Santa Claus= " + distancias,
        { status: 200 },
      );
    }
  }
  return new Response("No endpoint", { status: 404 });
};
Deno.serve({ port: 6768 }, handler);
