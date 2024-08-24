import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import axios from 'axios';
import { GraphQLError } from 'graphql';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  enum Genre {
    NONE
    FICTION
    MYSTERY
    FANTASY
    ROMANCE
  }

  type Author {
    name: String!
    nationality: String
  }

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    id: String!
    title: String!
    description: String
    isbn: String
    publisher: String!
    genre: Genre!
    publishYear: Int
    author: Author!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    getBooks: [Book]
    getBooksCount: Int!
    getBook(id: String): Book
  }
  
  type Mutation {
    addBook (
      title: String!
      description: String
      isbn: String
      publisher: String!
      genre: Genre!
      publishYear: Int
      authorName: String!
      authorNationality: String
    ): Book

    updateBook (
      id: String!
      title: String
      description: String
      isbn: String
      publisher: String
      genre: Genre
      publishYear: Int
      authorName: String
      authorNationality: String
    ): Book

    deleteBook (id: String!): Book
  }
`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    getBooks: async (root, args) => {
      const { data: books } = await axios.get(`${process.env.API_URL}/books/`);
      return books;
    },
    getBooksCount: async () => {
      const { data: books } = await axios.get(`${process.env.API_URL}/books/`);
      return books.length;
    },
    getBook: async (root, args) => {
      const { id } = args;
      const { data: book } = await axios.get(`${process.env.API_URL}/books/${id}`);
      return book;
    }
  },

  Book: {
    author: (root) => {
      return {
        name: root.authorName,
        nationality: root.authorNationality
      }
    }
  },

  Mutation: {
    addBook: async (root, args) => {
      // Verificamos si existe un libro con el mismo título
      const { data: books } = await axios.get(process.env.API_URL + '/books?title=' + args.title);
      if (books.length > 0) {
        throw new GraphQLError('El Título del libro ya existe', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }

      const newBook = { ...args, id: uuid() }
      const response = await axios.post(`${process.env.API_URL}/books`, newBook)
      return response.data;
    },
    
    updateBook: async (root, args) => {
      const { data: book, status: statusCode } = await axios.get(process.env.API_URL + '/books/' + args.id);

      if (statusCode == 404) {
        throw new GraphQLError(`El libro con ID ${args.id} no existe`, {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }

      const updatedBook = {
        ...book,
        title: args.title || book.title,
        description: args.description || book.description,
        isbn: args.isbn || book.isbn,
        publisher: args.publisher || book.publisher,
        genre: args.genre | book.genre,
        publishYear: args.publishYear || book.publishYear,
        authorName: args.authorName || book.authorName,
        authorNationality: args.authorNationality || book.authorNationality
      };

      const response = await axios.put(`${process.env.API_URL}/books/${book.id}`, updatedBook);
      return response.data;
    },

    deleteBook: async (root, { id }) => {
      const response = await axios.delete(`${process.env.API_URL}/books/${id}`);
      return response.data;
    }
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
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);