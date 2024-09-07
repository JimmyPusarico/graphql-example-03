import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { resolvers } from './resolvers';  // Asegúrate de tener tus resolvers correctamente definidos
import { readFileSync } from 'fs';         // Para leer archivos del sistema
import { join } from 'path';               // Para manejar rutas

// Cargar el esquema desde schema.graphql
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf8');

// Crear una instancia del servidor Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Iniciar el servidor en el puerto 4000
startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
