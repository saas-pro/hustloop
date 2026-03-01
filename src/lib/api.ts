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
    // Blog-level social / website links
    website_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    x_url?: string;
    youtube_url?: string;
    meta_title?: string;
    meta_description?: string;
    tags?: string[];
    status: 'draft' | 'pending_review' | 'published' | 'rejected';
    delete_request_status?: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
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
    tags?: string,
    token?: string
): Promise<BlogListResponse> {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
    });

    if (search) params.append('search', search);
    if (tags) params.append('tags', tags);

    const isServer = typeof window === 'undefined';
    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (isServer) {
        Object.assign(headers, {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Not A(Alpha;68", "Chromium";121, "Google Chrome";121',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Referer': 'https://hustloop.com/',
            'Origin': 'https://hustloop.com'
        });
    }

    const response = await fetch(`${API_BASE_URL}/api/blogs?${params}`, {
        headers,
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch blogs');
    }
    return response.json();
}


/**
 * Get a single blog by slug.
 * - No token (or non-admin token): returns published blogs only.
 * - Admin token: returns blog of any status (draft, pending, rejected, published).
 */
export async function getBlogBySlug(slug: string, token?: string): Promise<BlogResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const isServer = typeof window === 'undefined';
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (isServer) {
            Object.assign(headers, {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not A(Alpha;68", "Chromium";121, "Google Chrome";121',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Referer': 'https://hustloop.com/',
                'Origin': 'https://hustloop.com'
            });
        }

        const response = await fetch(`${API_BASE_URL}/api/blogs/${slug}`, {
            signal: controller.signal,
            headers,
            cache: 'no-store'
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Blog not found');
            }
            throw new Error(`Failed to fetch blog: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout - API took too long to respond');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Upload an inline image for use inside blog content (TipTap editor)
 */
export async function uploadBlogContentImage(file: File, token: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/blogs/upload-image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return { url: data.url };
}

// --- BLOGGER APIs (Authentication + Blogger Role Required) ---

/**
 * Get all blogs for the current blogger
 */
export async function getMyBlogs(
    token: string,
    page: number = 1,
    perPage: number = 10,
    status?: string
): Promise<BlogListResponse> {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
    });
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/api/blogs/me?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch your blogs');
    }
    return response.json();
}

/**
 * Get a single blog by ID (owner only)
 */
export async function getMyBlog(blogId: number, token: string): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
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

/**
 * Create a new blog post as a blogger
 */
export async function bloggerCreateBlog(data: CreateBlogData, token: string): Promise<BlogResponse> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value instanceof File ? value : String(value));
        }
    });

    const response = await fetch(`${API_BASE_URL}/api/blogs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create blog');
    }
    return response.json();
}

/**
 * Update a blog post as a blogger
 */
export async function bloggerUpdateBlog(blogId: number, data: UpdateBlogData, token: string): Promise<BlogResponse> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value instanceof File ? value : String(value));
        }
    });

    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update blog');
    }
    return response.json();
}

/**
 * Delete a blog post as a blogger
 */
export async function bloggerDeleteBlog(blogId: number, token: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
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
 * Request blog deletion as a blogger
 */
export async function requestDeleteBlog(blogId: number, token: string): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}/request-delete`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request delete blog');
    }
    return response.json();
}

/**
 * Submit a blog for review
 */
export async function submitForReview(blogId: number, token: string): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}/submit`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit blog for review');
    }
    return response.json();
}

// --- ADMIN BLOG APIs (Authentication Required) ---

export interface CreateBlogData {
    title: string;
    excerpt?: string;
    content: string;
    featured_image_url?: string;
    featured_image?: File;
    youtube_embed_url?: string;
    website_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    x_url?: string;
    youtube_url?: string;
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
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value instanceof File ? value : String(value));
        }
    });

    const response = await fetch(`${API_BASE_URL}/api/admin/blogs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
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
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value instanceof File ? value : String(value));
        }
    });

    const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
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
 * Reject a blog post (admin only)
 */
export async function rejectBlog(
    blogId: number,
    reason: string,
    token: string
): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${blogId}/reject`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject blog');
    }
    return response.json();
}

/**
 * Approve a blog deletion request (admin only)
 */
export async function approveDeleteRequest(
    blogId: number,
    token: string
): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${blogId}/delete-requests/approve`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve delete request');
    }
    return response.json();
}

/**
 * Reject a blog deletion request (admin only)
 */
export async function rejectDeleteRequest(
    blogId: number,
    token: string
): Promise<BlogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${blogId}/delete-requests/reject`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject delete request');
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

// --- NEXT BLOG & BLOGGER PROFILE APIs ---

export interface BloggerProfileData {
    website_url?: string;
    linkedin_url?: string;
    x_url?: string;
    instagram_url?: string;
    bio?: string;
    title?: string;
}

/**
 * Get the next published blog after the given slug
 */
export async function getNextBlogs(slug: string): Promise<{ blogs: BlogPost[] } | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/blogs/${slug}/next`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store',
        });
        if (response.status === 404) return null;
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
}

/**
 * Update the current blogger's profile (social links, bio, title)
 */
export async function updateBloggerProfile(
    data: BloggerProfileData,
    token: string
): Promise<{ success: boolean; message: string; user: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}/api/blogger/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
    }
    return response.json();
}

/**
 * Get the current blogger's profile
 */
export async function getBloggerProfile(
    token: string
): Promise<{ success: boolean; user: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}/api/blogger/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
    }
    return response.json();
}