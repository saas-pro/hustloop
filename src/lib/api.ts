const getApiBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl && envUrl !== 'undefined' && envUrl !== 'null' && envUrl !== '') {
        return envUrl;
    }
    return 'https://api.hustloop.com';
};

export const API_BASE_URL = getApiBaseUrl();

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featured_image_url?: string;
    youtube_embed_url?: string;
    meta_title?: string;
    meta_description?: string;
    tags?: string[];
    status: 'draft' | 'published';
    author_id: string;
    author?: {
        uid: string;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface BlogListResponse {
    success: boolean;
    message: string;
    blogs: BlogPost[];
    total: number;
    page: number;
    per_page: number;
    pages: number;
}

export interface BlogResponse {
    success: boolean;
    message: string;
    blog: BlogPost;
}

// --- PUBLIC BLOG APIs (No Authentication Required) ---

/**
 * Get paginated list of published blogs
 */
export async function getPublicBlogs(
    page: number = 1,
    perPage: number = 10,
    search?: string,
    tags?: string
): Promise<BlogListResponse> {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
    });

    if (search) params.append('search', search);
    if (tags) params.append('tags', tags);

    const response = await fetch(`${API_BASE_URL}/api/blogs?${params}`);
    if (!response.ok) {
        throw new Error('Failed to fetch blogs');
    }
    return response.json();
}

/**
 * Get a single published blog by slug
 */
export async function getBlogBySlug(slug: string): Promise<BlogResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const response = await fetch(`${API_BASE_URL}/api/blogs/${slug}`, {
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`[API Error] getBlogBySlug(${slug}) failed:`, {
                status: response.status,
                statusText: response.statusText,
                url: `${API_BASE_URL}/api/blogs/${slug}`
            });
            if (response.status === 404) {
                throw new Error('Blog not found');
            }
            throw new Error(`Failed to fetch blog: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (typeof window === 'undefined') {
            console.log(`[API Success] getBlogBySlug(${slug}) retrieved blog:`, data?.blog ? 'Found' : 'Not Found');
        }
        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        if (typeof window === 'undefined') {
            console.error(`[API Exception] getBlogBySlug(${slug}):`, error instanceof Error ? error.message : error);
        }
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout - API took too long to respond');
        }
        throw error;
    }
}

// --- ADMIN BLOG APIs (Authentication Required) ---

export interface CreateBlogData {
    title: string;
    excerpt?: string;
    content: string;
    featured_image_url?: string;
    youtube_embed_url?: string;
    meta_title?: string;
    meta_description?: string;
    tags?: string;
}

export interface UpdateBlogData extends Partial<CreateBlogData> { }

/**
 * Create a new blog post (admin only)
 */
export async function createBlog(
    data: CreateBlogData,
    token: string
): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/blogs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create blog');
    }
    return response.json();
}

/**
 * Update an existing blog post (admin only)
 */
export async function updateBlog(
    blogId: number,
    data: UpdateBlogData,
    token: string
): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update blog');
    }
    return response.json();
}

/**
 * Delete a blog post (admin only)
 */
export async function deleteBlog(
    blogId: number,
    token: string
): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete blog');
    }
    return response.json();
}

/**
 * Publish a blog post (admin only)
 */
export async function publishBlog(
    blogId: number,
    token: string
): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${blogId}/publish`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish blog');
    }
    return response.json();
}

/**
 * Unpublish a blog post (admin only)
 */
export async function unpublishBlog(
    blogId: number,
    token: string
): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${blogId}/unpublish`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unpublish blog');
    }
    return response.json();
}

/**
 * Get all blogs for admin dashboard (including drafts)
 */
export async function getAdminBlogs(
    token: string,
    page: number = 1,
    perPage: number = 10,
    status?: 'draft' | 'published',
    includeDeleted: boolean = false
): Promise<BlogListResponse> {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
    });

    if (status) params.append('status', status);
    if (includeDeleted) params.append('include_deleted', 'true');

    const response = await fetch(`${API_BASE_URL}/api/admin/blogs?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch admin blogs');
    }
    return response.json();
}

/**
 * Get a single blog for admin (including drafts)
 */
export async function getAdminBlog(
    blogId: number,
    token: string
): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${blogId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch blog');
    }
    return response.json();
}