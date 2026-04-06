import { apiFetch } from "@/lib/api";
import { Blog, BlogDetail, FeaturedBlog } from "@/types/public/blogs";

const BLOGS_BASE_URL = "/public/blogs";

/**
 * Get all blogs
 * @returns Promise<Blog[]>
 */
export async function getBlogs(): Promise<Blog[]> {
    try {
        const response = await apiFetch(BLOGS_BASE_URL);
        return response;
    } catch (error) {
        throw new Error("Failed to fetch blogs");
    }
}
/**
 * Get a single blog by ID
 * @param id - Blog ID
 * @returns Promise<BlogDetail>
 */
export async function getBlog(id: number): Promise<BlogDetail> {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/${id}`);
        return response;
    } catch (error) {
        throw new Error("Failed to fetch blog");
    }
}
/**
 * Get featured/latest blogs
 * @param limit - Number of blogs to return (default: 6)
 * @returns Promise<FeaturedBlog[]>
 */
export async function getFeaturedBlogs(limit: number = 6): Promise<FeaturedBlog[]> {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/featured?limit=${limit}`);
        return response;
    } catch (error) {
        throw new Error("Failed to fetch featured blogs");
    }
}
/**
 * Get blogs with search and filtering
 * @param searchQuery - Search term
 * @param sortBy - Sort option ('date', 'rating', 'views')
 * @returns Promise<Blog[]>
 */
export async function searchBlogs(searchQuery: string = "", sortBy: string = "date"): Promise<Blog[]> {
    try {
        const blogs = await getBlogs();
        let filteredBlogs = blogs;
        if (searchQuery) {
            filteredBlogs = blogs.filter(
                (blog) =>
                    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (blog.author?.name && blog.author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (blog.tags && blog.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (blog.categories && blog.categories.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())))
            );
        }
        switch (sortBy) {
            case "rating":
                return filteredBlogs.sort((a, b) => b.rating - a.rating);
            case "views":
                return filteredBlogs.sort((a, b) => b.views - a.views);
            case "date":
            default:
                return filteredBlogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
    } catch (error) {
        throw new Error("Failed to search blogs");
    }
}

/**
 * Toggle like/unlike for a blog post
 * @param id - Blog ID
 * @returns Promise with like status and updated like count
 */
export async function toggleBlogLike(id: number): Promise<{ liked: boolean; likes: number; message: string }> {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/${id}/like`, {
            method: "POST",
        });
        return response;
    } catch (error) {
        throw new Error("Failed to toggle like");
    }
}

/**
 * Check if current user has liked a blog
 * @param id - Blog ID
 * @returns Promise with like status
 */
export async function checkBlogLike(id: number): Promise<{ liked: boolean }> {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/${id}/liked`);
        return response;
    } catch (error) {
        // Return default value when user is not authenticated or API fails
        return { liked: false };
    }
}

/**
 * Add comment to a blog post
 * @param id - Blog ID
 * @param comment - Comment content
 * @returns Promise with created comment
 */
export async function addBlogComment(id: number, comment: string): Promise<any> {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/${id}/comment`, {
            method: "POST",
            body: JSON.stringify({ comment }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response;
    } catch (error) {
        throw new Error("Failed to add comment");
    }
}

export async function editBlogComment(commentId: number, comment: string): Promise<any> {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/comment/${commentId}`, {
            method: "PUT",
            body: JSON.stringify({ comment }),
        });
        return response;
    } catch (error) {
        throw new Error("Failed to edit comment");
    }
}

export async function deleteBlogComment(commentId: number): Promise<any> {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/comment/${commentId}`, {
            method: "DELETE",
        });
        return response;
    } catch (error) {
        throw new Error("Failed to delete comment");
    }
}

/**
 * Subscribe to newsletter
 * @param email - Email address
 * @returns Promise with subscription result
 */
export async function subscribeToNewsletter(email: string): Promise<any> {
    try {
        const response = await apiFetch("/public/home/newsletter", {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response;
    } catch (error) {
        throw new Error("Failed to subscribe to newsletter");
    }
}

/**
 * Rate a blog post
 * @param id - Blog ID
 * @param rating - Rating value (1-5)
 * @returns Promise with new average rating
 */
export async function rateBlog(id: number, rating: number): Promise<{ success: boolean; message: string; newRating: number }> {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/${id}/rate`, {
            method: "POST",
            body: JSON.stringify({ rating }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response;
    } catch (error) {
        throw new Error("Failed to rate blog");
    }
}

export const getBlogComments = async (blogId: number) => {
    const response = await apiFetch(`${BLOGS_BASE_URL}/${blogId}/comments`);
    return response;
};

export const getBlogAverageRating = async (blogId: number) => {
    const response = await apiFetch(`${BLOGS_BASE_URL}/${blogId}/average-rating`);
    return response;
};

export const getUserRatingForBlog = async (blogId: number) => {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/${blogId}/user-rating`);
        return response;
    } catch (error) {
        // Return default value when user is not authenticated or API fails
        return { rating: null };
    }
};

export const getBlogRating = async (blogId: number) => {
    const response = await apiFetch(`${BLOGS_BASE_URL}/${blogId}/rating`);
    return response;
};

/**
 * Get related blogs based on categories and tags
 * @param id - Blog ID
 * @param limit - Number of related blogs to return (default: 4)
 * @returns Promise<FeaturedBlog[]>
 */
export async function getRelatedBlogs(id: number, limit: number = 4): Promise<FeaturedBlog[]> {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/${id}/related?limit=${limit}`);
        return response;
    } catch (error) {
        throw new Error("Failed to fetch related blogs");
    }
}

export async function incrementBlogShares(id: number): Promise<{ success: boolean; shares: number }> {
    try {
        const response = await apiFetch(`${BLOGS_BASE_URL}/${id}/share`, {
            method: "POST",
        });
        return response;
    } catch (error) {
        throw new Error("Failed to increment share count");
    }
}

export async function trackBlogView(id: number, sessionId: number, visitorId: number): Promise<void> { await apiFetch(`${BLOGS_BASE_URL}/${id}/view`, { method: "POST", body: JSON.stringify({ sessionId, visitorId }) }); }

export async function trackBlogShare(id: number, platform: string): Promise<void> { await apiFetch(`${BLOGS_BASE_URL}/${id}/share`, { method: "POST", body: JSON.stringify({ platform }) }); }
