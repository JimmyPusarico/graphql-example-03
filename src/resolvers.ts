import axios from 'axios';

export const resolvers = {
  Query: {
    // Consultas para Categories
    categories: async () => {
      const response = await axios.get('http://localhost:5000/categories');
      return response.data;
    },
    category: async (_: any, { id }: { id: string }) => {
      const response = await axios.get(`http://localhost:5000/categories/${id}`);
      return response.data;
    },

    // Consultas para Articles
    articles: async () => {
      const response = await axios.get('http://localhost:5000/articles');
      return response.data;
    },
    article: async (_: any, { id }: { id: string }) => {
      const response = await axios.get(`http://localhost:5000/articles/${id}`);
      return response.data;
    }
  },
  Mutation: {
    // Mutaciones para Categories
    createCategory: async (_: any, { title, description }: { title: string, description: string }) => {
      const newCategory = { id: 'uuid', title, description };
      const response = await axios.post('http://localhost:5000/categories', newCategory);
      return response.data;
    },
    updateCategory: async (_: any, { id, title, description }: { id: string, title: string, description: string }) => {
      const response = await axios.put(`http://localhost:5000/categories/${id}`, { title, description });
      return response.data;
    },
    deleteCategory: async (_: any, { id }: { id: string }) => {
      await axios.delete(`http://localhost:5000/categories/${id}`);
      return true;
    },

    // Mutaciones para Articles
    createArticle: async (_: any, { title, author, introduction, fulltext, keywords, status, publish_datetime, views, category_id }: any) => {
      const newArticle = {
        id: 'uuid',
        title,
        author,
        introduction,
        fulltext,
        keywords,
        status,
        publish_datetime,
        views: views || 0,
        category_id
      };
      const response = await axios.post('http://localhost:5000/articles', newArticle);
      return response.data;
    },
    updateArticle: async (_: any, { id, title, author, introduction, fulltext, keywords, status, publish_datetime, views, category_id }: any) => {
      const response = await axios.put(`http://localhost:5000/articles/${id}`, {
        title,
        author,
        introduction,
        fulltext,
        keywords,
        status,
        publish_datetime,
        views,
        category_id
      });
      return response.data;
    },
    deleteArticle: async (_: any, { id }: { id: string }) => {
      await axios.delete(`http://localhost:5000/articles/${id}`);
      return true;
    }
  }
};
