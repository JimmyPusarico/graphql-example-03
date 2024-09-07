"use strict";
/* import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import axios from 'axios';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const typeDefs = readFileSync('src/schema.graphql', 'utf8');

const resolvers = {
  Book: {
    author: async (root) => {
      try {
        const { data: author } = await axios.get(process.env.API_URL + '/authors/' + root.author_id);
        return {
          id: author.id,
          name: author.name,
          nationality: author.nationality
        };
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        return null;
      }
    }
  },
  Author: {
    books: async (root) => {
      try {
        const { data: books } = await axios.get(process.env.API_URL + '/books?author_id=' + root.id);
        return books;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        return null;
      }
    }
  },

  Query: {
    getBooks: async (root, args) => {
      try {
        const { data: books } = await axios.get(process.env.API_URL + '/books');
        return books;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        return null;
      }
    },
    getBook: async (root, {id}) => {
      try {
        const { data: book } = await axios.get(process.env.API_URL + '/books/' + id);
        return book;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        return null;
      }
    },
    getBooksByAuthorName: async (root, {authorName}) => {
      try {
        const { data: author } = await axios.get(process.env.API_URL + '/authors?name=' + authorName);
        const { data: books } = await axios.get(process.env.API_URL + '/books?author_id=' + author[0].id);
        return books;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        return [];
      }
    },

    getAuthors: async (root, args) => {
      try {
        const { data: authors } = await axios.get(process.env.API_URL + '/authors');
        return authors;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        return null;
      }
    },
    getAuthor: async (root, {id}) => {
      try {
        const { data: author } = await axios.get(process.env.API_URL + '/authors/' + id);
        return author;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        return null;
      }
    },
  },

  Mutation: {
    addAuthor: async (root, args) => {
      let existsAuthor = false;
      try {
        // Verificamos si existe un libro con el mismo título
        const { data: authors } = await axios.get(process.env.API_URL + '/authors?name=' + args.name);
        if (authors.length > 0) {
          existsAuthor = true;
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Error al conectar con el API');
        }
        throw new Error(error.message);
      }

      if (existsAuthor) {
        throw new GraphQLError('El nombre del autor ya existe', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }

      const newAuthor = {
        name: args.name,
        nationality: args.nationality
      };
      try {
        // Creamos el recurso en el API RESTful
        const { data: author }  = await axios.post(process.env.API_URL + '/authors', newAuthor);
        return author;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        throw new Error(error.message);
      }
    },

    updateAuthor: async (root, args) => {
      // Obtenemos el autor con el ID
      const { data: author } = await axios.get(process.env.API_URL + '/authors/' + args.id).catch(function (error) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Error al conectar con el API');
        }
        throw new GraphQLError('No existe el author con el ID: ' + args.id, {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      });

      if (args.name) {
        let existsAuthorName = false;
        try {
          // Verificamos si existe un autor con el mismo nombre y que tenga diferente ID del que se está editando
          const { data: authors } = await axios.get(process.env.API_URL + '/authors?name=' + args.name + '&id_ne=' + args.id);
          if (authors.length > 0) {
            existsAuthorName = true;
          }
        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            throw new Error('Error al conectar con el API');
          }
          throw new Error(error.message);
        }

        if (existsAuthorName) {
          throw new GraphQLError('El nombre del libro ya existe', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          });
        }
      }

      const updatedAuthorData = {
        name: args.name ? args.name : author.name,
        nationality: args.nationality ? args.nationality : author.nationality
      };

      try {
        const { data: updatedAuthor } = await axios.put(process.env.API_URL + '/authors/' + author.id, updatedAuthorData);
        return updatedAuthor;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        throw new Error(error.message);
      }
    },
    deleteAuthor: async (root, {id}) => {
      // Obtenemos el autor con el ID
      await axios.get(process.env.API_URL + '/authors/' + id).catch(function (error) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Error al conectar con el API');
        }
        throw new GraphQLError('No existe el autor con el ID: ' + id, {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      });

      try {
        const { data: deletedAuthor } = await axios.delete(process.env.API_URL + '/authors/' + id);
        return deletedAuthor;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        throw new Error(error.message);
      }
    },

    addBook: async (root, args) => {
      let existsBook = false;
      try {
        // Verificamos si existe un libro con el mismo título
        const { data: books } = await axios.get(process.env.API_URL + '/books?title=' + args.title);
        if (books.length > 0) {
          existsBook = true;
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Error al conectar con el API');
        }
        throw new Error(error.message);
      }

      if (existsBook) {
        throw new GraphQLError('El título del libro ya existe', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }

      try {
        // Verificamos si el Autor existe
        await axios.get(process.env.API_URL + '/authors/' + args.authorId);
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Error al conectar con el API');
        }
        throw new GraphQLError('No existe el autor con el ID: ' + args.authorId, {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }

      const newBook = {
        title: args.title,
        description: args.description,
        isbn: args.isbn,
        publisher: args.publisher,
        genre: args.genre,
        year: args.year,
        author_id: args.authorId
      };
      try {
        // Creamos el recurso en el API RESTful
        const { data: book }  = await axios.post(process.env.API_URL + '/books', newBook);
        return book;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        throw new Error(error.message);
      }
    },

    updateBook: async (root, args) => {
      // Obtenemos el libro con el ID
      const { data: book } = await axios.get(process.env.API_URL + '/books/' + args.id).catch(function (error) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Error al conectar con el API');
        }
        if (error.status === 404) {
          throw new GraphQLError('No existe el libro con el ID: ' + args.id, {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          });
        }
        throw new GraphQLError('Error ' + error.code, {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      });

      if (args.title) {
        let existsBookTitle = false;
        try {
          // Verificamos si existe un libro con el mismo título y que tenga diferente ID del que se está editando
          const { data: books } = await axios.get(process.env.API_URL + '/books?title=' + args.title + '&id_ne=' + args.id);
          if (books.length > 0) {
            existsBookTitle = true;
          }
        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            throw new Error('Error al conectar con el API');
          }
          throw new Error(error.message);
        }

        if (existsBookTitle) {
          throw new GraphQLError('El título del libro ya existe', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          });
        }
      }

      if (args.authorId) {
        try {
          // Verificamos si el Autor existe
          await axios.get(process.env.API_URL + '/authors/' + args.authorId);
        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            throw new Error('Error al conectar con el API');
          }
          throw new GraphQLError('No existe el autor con el ID: ' + args.authorId, {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          });
        }
      }

      const updatedBookData = {
        title: args.title || book.title,
        description: args.description ? args.description : book.description,
        isbn: args.isbn ? args.isbn : book.isbn,
        publisher: args.publisher ? args.publisher : book.publisher,
        genre: args.genre ? args.genre : book.genre,
        year: args.year ? args.year : book.year,
        author_id: args.authorId ? args.authorId : book.authorName
      };

      try {
        const { data: updatedBook } = await axios.put(process.env.API_URL + '/books/' + book.id, updatedBookData);
        return updatedBook;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        throw new Error(error.message);
      }
    },
    deleteBook: async (root, {id}) => {
      // Obtenemos el libro con el ID
      await axios.get(process.env.API_URL + '/books/' + id).catch(function (error) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Error al conectar con el API');
        }
        if (error.status === 404) {
          throw new GraphQLError('No existe el libro con el ID: ' + id, {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          });
        }
        throw new GraphQLError('Error ' + error.code, {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      });

      try {
        const { data: deletedBook } = await axios.delete(process.env.API_URL + '/books/' + id);
        return deletedBook;
      } catch (error) {
        if (error.code === 'ECONNREFUSED') throw new Error('Error al conectar con el API');
        throw new Error(error.message);
      }
    },

  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4001 },
});

console.log(`🚀  Server ready at: ${url}`); */
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const resolvers_1 = require("./resolvers"); // Asegúrate de tener tus resolvers correctamente definidos
const fs_1 = require("fs"); // Para leer archivos del sistema
const path_1 = require("path"); // Para manejar rutas
// Cargar el esquema desde schema.graphql
const typeDefs = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, 'schema.graphql'), 'utf8');
// Crear una instancia del servidor Apollo
const server = new server_1.ApolloServer({
    typeDefs,
    resolvers: resolvers_1.resolvers,
});
// Iniciar el servidor en el puerto 4000
(0, standalone_1.startStandaloneServer)(server, {
    listen: { port: 4000 },
}).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
