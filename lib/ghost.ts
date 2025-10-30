import jwt from "jsonwebtoken";
import axios from "axios";

const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY!;
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY!;
const GHOST_API_URL = process.env.GHOST_API_URL!;

export interface GhostPost {
  id: string;
  title: string;
  slug: string;
  tags?: GhostTag[];
  html?: string;
  plaintext?: string;
  updated_at?: string;
  custom_excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  twitter_title?: string;
  twitter_description?: string;
}

export interface GhostTag {
  name: string;
  slug?: string;
}

/**
 * Generate JWT token for Ghost Admin API
 */
function generateJWT(): string {
  const [keyId, keySecret] = GHOST_ADMIN_API_KEY.split(":");

  // Get current time
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 5 * 60; // 5 minutes expiry

  const payload = {
    iat,
    exp,
    aud: "/admin/",
  };

  const token = jwt.sign(payload, Buffer.from(keySecret, "hex"), {
    algorithm: "HS256",
    header: {
      alg: "HS256",
      typ: "JWT",
      kid: keyId,
    },
  });

  return token;
}

/**
 * Fetch all posts from Ghost
 */
export async function getAllPosts(): Promise<GhostPost[]> {
  try {
    const response = await axios.get(`${GHOST_API_URL}/ghost/api/content/posts/`, {
      params: {
        key: GHOST_CONTENT_API_KEY,
        limit: "all",
        fields: "id,title,slug,html,custom_excerpt,meta_title,meta_description,og_title,og_description,twitter_title,twitter_description",
        include: "tags",
      },
      headers: {
        "Accept-Version": "v5.0",
      },
    });

    return response.data.posts || [];
  } catch (error: any) {
    console.error("Error fetching posts:", error.response?.data || error.message);
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
}

/**
 * Fetch full post content
 */
export async function getPostContent(postId: string): Promise<GhostPost> {
  try {
    const token = generateJWT();
    const response = await axios.get(`${GHOST_API_URL}/ghost/api/admin/posts/${postId}/`, {
      params: {
        formats: "html,plaintext",
      },
      headers: {
        Authorization: `Ghost ${token}`,
        "Accept-Version": "v5.0",
      },
    });

    return response.data.posts[0];
  } catch (error: any) {
    console.error("Error fetching post content:", error.response?.data || error.message);
    throw new Error(`Failed to fetch post content: ${error.message}`);
  }
}

/**
 * Update post tags
 */
export async function updatePostTags(postId: string, tagNames: string[]): Promise<boolean> {
  try {
    // First, get current post to get updated_at
    const token = generateJWT();
    const getResponse = await axios.get(`${GHOST_API_URL}/ghost/api/admin/posts/${postId}/`, {
      headers: {
        Authorization: `Ghost ${token}`,
        "Accept-Version": "v5.0",
      },
    });

    const currentPost = getResponse.data.posts[0];
    const currentUpdatedAt = currentPost.updated_at;

    // Update with new tags
    const tags = tagNames.map((name) => ({ name }));
    const payload = {
      posts: [
        {
          id: postId,
          tags,
          updated_at: currentUpdatedAt,
        },
      ],
    };

    const newToken = generateJWT();
    await axios.put(`${GHOST_API_URL}/ghost/api/admin/posts/${postId}/`, payload, {
      headers: {
        Authorization: `Ghost ${newToken}`,
        "Accept-Version": "v5.0",
        "Content-Type": "application/json",
      },
    });

    return true;
  } catch (error: any) {
    console.error("Error updating post tags:", error.response?.data || error.message);
    throw new Error(`Failed to update post tags: ${error.message}`);
  }
}

/**
 * Update post with custom data (descriptions, metadata, etc)
 */
export async function updateGhostPost(postId: string, updateData: any): Promise<GhostPost> {
  try {
    // First, get current post to get updated_at
    const token = generateJWT();
    const getResponse = await axios.get(`${GHOST_API_URL}/ghost/api/admin/posts/${postId}/`, {
      headers: {
        Authorization: `Ghost ${token}`,
        "Accept-Version": "v5.0",
      },
    });

    const currentPost = getResponse.data.posts[0];
    const currentUpdatedAt = currentPost.updated_at;

    // Update with new data
    const payload = {
      posts: [
        {
          id: postId,
          ...updateData,
          updated_at: currentUpdatedAt,
        },
      ],
    };

    const newToken = generateJWT();
    const updateResponse = await axios.put(`${GHOST_API_URL}/ghost/api/admin/posts/${postId}/`, payload, {
      headers: {
        Authorization: `Ghost ${newToken}`,
        "Accept-Version": "v5.0",
        "Content-Type": "application/json",
      },
    });

    return updateResponse.data.posts[0];
  } catch (error: any) {
    console.error("Error updating post:", error.response?.data || error.message);
    throw new Error(`Failed to update post: ${error.message}`);
  }
}
