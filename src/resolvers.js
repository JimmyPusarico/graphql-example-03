"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const axios_1 = __importDefault(require("axios"));
exports.resolvers = {
    Query: {
        // Consultas para Categories
        categories: async () => {
            const response = await axios_1.default.get('http://localhost:5000/categories');
            return response.data;
        },
        category: async (_, { id }) => {
            const response = await axios_1.default.get(`http://localhost:5000/categories/${id}`);
            return response.data;
        },
        // Consultas para Articles
        articles: async () => {
            const response = await axios_1.default.get('http://localhost:5000/articles');
            return response.data;
        },
        article: async (_, { id }) => {
            const response = await axios_1.default.get(`http://localhost:5000/articles/${id}`);
            return response.data;
        }
    },
    Mutation: {
        // Mutaciones para Categories
        createCategory: async (_, { title, description }) => {
            const newCategory = { id: 'uuid', title, description };
            const response = await axios_1.default.post('http://localhost:5000/categories', newCategory);
            return response.data;
        },
        updateCategory: async (_, { id, title, description }) => {
            const response = await axios_1.default.put(`http://localhost:5000/categories/${id}`, { title, description });
            return response.data;
        },
        deleteCategory: async (_, { id }) => {
            await axios_1.default.delete(`http://localhost:5000/categories/${id}`);
            return true;
        },
        // Mutaciones para Articles
        createArticle: async (_, { title, author, introduction, fulltext, keywords, status, publish_datetime, views, category_id }) => {
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
            const response = await axios_1.default.post('http://localhost:5000/articles', newArticle);
            return response.data;
        },
        updateArticle: async (_, { id, title, author, introduction, fulltext, keywords, status, publish_datetime, views, category_id }) => {
            const response = await axios_1.default.put(`http://localhost:5000/articles/${id}`, {
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
        deleteArticle: async (_, { id }) => {
            await axios_1.default.delete(`http://localhost:5000/articles/${id}`);
            return true;
        }
    }
};
