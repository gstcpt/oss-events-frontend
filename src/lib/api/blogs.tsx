import { apiFetch } from "../api";
import { Blog, BlogCategory, BlogTag } from "@/types/blogs";

type BlogClientPayload = Omit<Partial<Blog>, "blogTags" | "blogCategories"> & {
    tags?: string[];
    categories?: string[];
};
export const getBlogs = async (): Promise<Blog[]> => {
    const response = await apiFetch<Blog[]>("/blogs");
    return response;
};
export const getBlogDetails = async (id: number): Promise<Blog> => {
    return await apiFetch<Blog>(`/blogs/${id}`);
};
export const createBlog = async (blog: BlogClientPayload, files?: File[]) => {
    const formData = new FormData();
    (Object.keys(blog) as (keyof BlogClientPayload)[]).forEach((key) => {
        const val = blog[key];
        if (key === "image" && typeof val === "string" && val.startsWith("data:")) {
            const byteCharacters = atob(val.split(",")[1]);
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            const blob = new Blob(byteArrays, { type: "image/jpeg" });
            const file = new File([blob], `blog_image_${Date.now()}.jpg`, { type: "image/jpeg" });
            formData.append("image", file);
        } else if (key === "tags" && Array.isArray(val)) {
            (val as string[]).forEach((tag: string) => {
                formData.append("tags[]", tag);
            });
        } else if (key === "categories" && Array.isArray(val)) {
            (val as string[]).forEach((category: string) => {
                formData.append("categories[]", category);
            });
        } else if (blog[key] !== undefined && blog[key] !== null && key !== "tags" && key !== "categories") {
            formData.append(key, String(blog[key]));
        }
    });
    if (files && files.length > 0) {
        files.forEach((file, index) => {
            formData.append("files", file);
        });
    }
    return await apiFetch<Blog>(`/blogs`, { method: "POST", body: formData });
};
export const updateBlog = async (id: number, blog: BlogClientPayload, files?: File[]) => {
    const formData = new FormData();
    (Object.keys(blog) as (keyof BlogClientPayload)[]).forEach((key) => {
        if (key === "id") return;
        const val = blog[key];
        if (key === "image" && typeof val === "string" && val.startsWith("data:")) {
            const byteCharacters = atob(val.split(",")[1]);
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            const blob = new Blob(byteArrays, { type: "image/jpeg" });
            const file = new File([blob], `blog_image_${Date.now()}.jpg`, { type: "image/jpeg" });
            formData.append("image", file);
        } else if (key === "tags" && Array.isArray(val)) {
            (val as string[]).forEach((tag: string) => {
                formData.append("tags[]", tag);
            });
        } else if (key === "categories" && Array.isArray(val)) {
            (val as string[]).forEach((category: string) => {
                formData.append("categories[]", category);
            });
        } else if (blog[key] !== undefined && blog[key] !== null && key !== "tags" && key !== "categories") {
            formData.append(key, String(blog[key]));
        }
    });
    if (files && files.length > 0) {
        files.forEach((file, index) => {
            formData.append("files", file);
        });
    }
    return await apiFetch<Blog>(`/blogs/${id}`, { method: "PATCH", body: formData });
};
export const deleteBlog = async (id: number) => {
    return await apiFetch<void>(`/blogs/${id}`, { method: "DELETE" });
};
export const getBlogComments = async (blogId: number) => {
    return await apiFetch(`/blogs/${blogId}/comments`);
};
export const createBlogComment = async (blogId: number, comment: { comment: string }) => {
    return await apiFetch(`/blogs/${blogId}/comments`, {
        method: "POST",
        body: JSON.stringify(comment),
        headers: { "Content-Type": "application/json" },
    });
};
export const getBlogRating = async (blogId: number) => {
    return await apiFetch(`/blogs/${blogId}/rating`);
};
export const createBlogRating = async (blogId: number, rating: { rating: number }) => {
    return await apiFetch(`/blogs/${blogId}/ratings`, {
        method: "POST",
        body: JSON.stringify(rating),
        headers: { "Content-Type": "application/json" },
    });
};
export const getBlogAverageRating = async (blogId: number) => {
    return await apiFetch(`/blogs/${blogId}/ratings/average`);
};
export const getBlogMedia = async (blogId: number) => {
    return await apiFetch(`/blogs/${blogId}/media`);
};
export const createBlogMedia = async (blogId: number, media: { file: string; media_type?: string }) => {
    return await apiFetch(`/blogs/${blogId}/media`, { method: "POST", body: JSON.stringify(media), headers: { "Content-Type": "application/json" } });
};
export const deleteBlogMedia = async (mediaId: number) => {
    return await apiFetch(`/blogs/media/${mediaId}`, { method: "DELETE" });
};
