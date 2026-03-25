import API from "./api";

export interface Category {
    _id: string;
    name: string;
    icon: string;
    color: string;
}

export const fetchCategories = () =>
    API.get<Category[]>("/categories").then((r) => r.data);

export const createCategory = (data: { name: string; icon: string; color: string }) =>
    API.post<Category>("/categories", data).then((r) => r.data);

export const deleteCategory = (id: string) =>
    API.delete(`/categories/${id}`);
