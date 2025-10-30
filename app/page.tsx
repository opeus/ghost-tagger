"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NewColumn from "./components/NewColumn";
import TagColumn from "./components/TagColumn";
import LibraryColumn from "./components/LibraryColumn";
import ArticlePreview from "./components/ArticlePreview";

interface Post {
  id: string;
  title: string;
  slug: string;
  tags?: Array<{ name: string }>;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Column states
  const [newTags, setNewTags] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [aiTags, setAiTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadPosts();
    }
  }, [status, router]);

  const loadPosts = async () => {
    setLoading(true);
    setStatusMessage("Loading articles...");

    try {
      const response = await fetch("/api/posts");
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts);
        setStatusMessage(`Loaded ${data.posts.length} articles. Select one to begin.`);
      } else {
        setStatusMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSelect = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    setSelectedPost(post);

    // Reset columns
    setNewTags([]);
    setAiTags([]);

    // Set existing tags
    const postTags = post.tags?.map((t) => t.name) || [];
    setExistingTags(postTags);

    setStatusMessage(
      postTags.length > 0
        ? `Article has ${postTags.length} existing tags. Add tags to the New column.`
        : "No existing tags. Add tags from Library or generate AI suggestions."
    );
  };

  const generateAITags = async () => {
    if (!selectedPost) return;

    setGenerating(true);
    setStatusMessage("🤖 Generating AI tag suggestions...");

    try {
      const response = await fetch("/api/tags/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: selectedPost.id,
          existingTags,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const { suggestedTags } = data;
        setAiTags(suggestedTags);
        setStatusMessage(`✓ Generated ${suggestedTags.length} AI tag suggestions!`);
      } else {
        setStatusMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Tag movement handlers
  const addTagToNew = (tag: string) => {
    if (!newTags.includes(tag)) {
      setNewTags([...newTags, tag]);
    }
  };

  const removeTagFromNew = (tag: string) => {
    setNewTags(newTags.filter((t) => t !== tag));
  };

  const clearNewTags = () => {
    setNewTags([]);
  };

  const addAllExisting = () => {
    const tagsToAdd = existingTags.filter((tag) => !newTags.includes(tag));
    setNewTags([...newTags, ...tagsToAdd]);
  };

  const addAllAI = () => {
    const tagsToAdd = aiTags.filter((tag) => !newTags.includes(tag));
    setNewTags([...newTags, ...tagsToAdd]);
  };

  const updateArticle = async () => {
    if (!selectedPost) return;

    if (newTags.length === 0) {
      alert("Please add at least one tag to the New column.");
      return;
    }

    const tagList = newTags
      .map((tag, i) => `  ${i + 1}. ${tag}${i === 0 ? " ← PRIMARY" : ""}`)
      .join("\n");

    const confirmed = confirm(
      `Update article with these ${newTags.length} tags in this order?\n\n${tagList}`
    );

    if (!confirmed) return;

    setUpdating(true);
    setStatusMessage("Updating article...");

    try {
      const response = await fetch("/api/tags/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: selectedPost.id,
          tags: newTags,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage("✓ Article updated successfully!");
        alert("Article tags have been updated successfully!");

        // Reload posts
        await loadPosts();

        // Clear selection
        setSelectedPost(null);
        setNewTags([]);
        setExistingTags([]);
        setAiTags([]);
      } else {
        setStatusMessage(`Error: ${data.error}`);
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Ghost Article Tagger
              </h1>
              <p className="text-gray-600">AI-powered tagging for your blog articles</p>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Article Selection & Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Article
              </label>
              <select
                value={selectedPost?.id || ""}
                onChange={(e) => handlePostSelect(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select an article --</option>
                {posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title} [{post.tags?.length || 0} tags]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(true)}
                disabled={!selectedPost}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2 whitespace-nowrap"
              >
                👁️ Preview
              </button>

              <button
                onClick={generateAITags}
                disabled={!selectedPost || generating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2 whitespace-nowrap"
              >
                {generating ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>🤖 Generate AI Tags</>
                )}
              </button>

              <button
                onClick={updateArticle}
                disabled={!selectedPost || newTags.length === 0 || updating}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2 whitespace-nowrap"
              >
                {updating ? "Saving..." : "💾 Save Tags"}
              </button>
            </div>
          </div>

          {statusMessage && (
            <p className="mt-4 text-sm text-gray-600 italic">{statusMessage}</p>
          )}
        </div>

        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ minHeight: "600px" }}>
          {/* New Column */}
          <NewColumn
            tags={newTags}
            onReorder={setNewTags}
            onRemove={removeTagFromNew}
            onClear={clearNewTags}
          />

          {/* Existing Column */}
          <TagColumn
            title="Existing"
            tags={existingTags}
            selectedTags={newTags}
            onTagClick={addTagToNew}
            showAddAll={true}
            onAddAll={addAllExisting}
            count={existingTags.length}
          />

          {/* Library Column */}
          <LibraryColumn selectedTags={newTags} onTagClick={addTagToNew} />

          {/* AI Column */}
          <TagColumn
            title="AI"
            tags={aiTags}
            selectedTags={newTags}
            onTagClick={addTagToNew}
            showAddAll={true}
            onAddAll={addAllAI}
            count={aiTags.length}
          />
        </div>

        {/* Article Preview Modal */}
        {showPreview && selectedPost && (
          <ArticlePreview
            postId={selectedPost.id}
            postTitle={selectedPost.title}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  );
}
