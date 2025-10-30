"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TagList, { Tag } from "./components/TagList";
import WordCloud from "./components/WordCloud";

interface Post {
  id: string;
  title: string;
  slug: string;
  tags?: Array<{ name: string }>;
}

interface Keyword {
  word: string;
  count: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);

  const [tocChecked, setTocChecked] = useState(false);
  const [sidebarChecked, setSidebarChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

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
    setKeywords([]);

    const postTags = post.tags?.map((t) => t.name) || [];
    setExistingTags(postTags);

    const tagItems: Tag[] = postTags.map((name, index) => ({
      id: `existing-${index}`,
      name,
      isNew: false,
      isAI: false,
      selected: true,
    }));

    setTags(tagItems);
    setStatusMessage(
      postTags.length > 0
        ? `Article has ${postTags.length} existing tags. Click 'Generate AI Tags' or add custom tags.`
        : "No existing tags. Click 'Generate AI Tags' or add custom tags."
    );
  };

  const generateTags = async () => {
    if (!selectedPost) return;

    setGenerating(true);
    setStatusMessage("🤖 Generating AI tags and extracting keywords...");

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
        const { suggestedTags, keywords: extractedKeywords } = data;

        // Merge AI tags with existing
        const allTags: Tag[] = [];

        // First, add existing tags
        existingTags.forEach((tagName, index) => {
          allTags.push({
            id: `existing-${index}`,
            name: tagName,
            isNew: false,
            isAI: false,
            selected: true,
          });
        });

        // Then add AI-suggested tags that aren't already in the list
        suggestedTags.forEach((tagName: string, index: number) => {
          if (!allTags.find((t) => t.name === tagName)) {
            allTags.push({
              id: `ai-${index}`,
              name: tagName,
              isNew: true,
              isAI: true,
              selected: true,
            });
          }
        });

        setTags(allTags);
        setKeywords(extractedKeywords);

        const newCount = allTags.filter((t) => t.isNew).length;
        setStatusMessage(
          `✓ Generated ${newCount} AI suggestions + ${extractedKeywords.length} keywords. Click keywords to add as tags!`
        );
      } else {
        setStatusMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddCustomTag = () => {
    const tagName = prompt("Enter custom tag name:");
    if (!tagName || !tagName.trim()) return;

    const trimmedName = tagName.trim();

    // Check if already exists
    if (tags.find((t) => t.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert(`Tag '${trimmedName}' already exists in the list.`);
      return;
    }

    const isNew = !existingTags.includes(trimmedName);
    const newTag: Tag = {
      id: `manual-${Date.now()}`,
      name: trimmedName,
      isNew,
      isAI: false,
      selected: true,
    };

    setTags([...tags, newTag]);
    setStatusMessage(`✓ Added custom tag: ${trimmedName}`);
  };

  const handleKeywordClick = (word: string) => {
    const tagName = word.charAt(0).toUpperCase() + word.slice(1);

    // Check if already exists
    if (tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase())) {
      alert(`Tag '${tagName}' already exists in the list.`);
      return;
    }

    const isNew = !existingTags.includes(tagName);
    const newTag: Tag = {
      id: `keyword-${Date.now()}`,
      name: tagName,
      isNew,
      isAI: false,
      selected: true,
    };

    setTags([...tags, newTag]);
    setStatusMessage(`✓ Added keyword as tag: ${tagName}`);
  };

  const updateArticle = async () => {
    if (!selectedPost) return;

    const selectedTags = tags.filter((t) => t.selected).map((t) => t.name);

    if (selectedTags.length === 0) {
      alert("Please select at least one tag.");
      return;
    }

    // Add special tags
    const finalTags = [...selectedTags];
    if (tocChecked && !finalTags.includes("#toc")) {
      finalTags.push("#toc");
    }
    if (sidebarChecked && !finalTags.includes("#sidebar")) {
      finalTags.push("#sidebar");
    }

    const tagList = finalTags
      .map((tag, i) => `  ${i + 1}. ${tag}${i === 0 ? " ← PRIMARY" : ""}`)
      .join("\n");

    const confirmed = confirm(
      `Update article with these ${finalTags.length} tags in this order?\n\n${tagList}`
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
          tags: finalTags,
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
        setTags([]);
        setKeywords([]);
        setTocChecked(false);
        setSidebarChecked(false);
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
      <div className="max-w-6xl mx-auto">
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

        {/* Article Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. Select Article</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedPost?.id || ""}
              onChange={(e) => handlePostSelect(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select an article --</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title} [{post.tags?.length || 0} tags]
                </option>
              ))}
            </select>

            <button
              onClick={generateTags}
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
          </div>

          {statusMessage && (
            <p className="mt-4 text-sm text-gray-600 italic">{statusMessage}</p>
          )}
        </div>

        {/* Word Cloud */}
        {keywords.length > 0 && (
          <WordCloud keywords={keywords} onKeywordClick={handleKeywordClick} />
        )}

        {/* Tag List */}
        {tags.length > 0 && (
          <TagList tags={tags} onTagsChange={setTags} onAddCustomTag={handleAddCustomTag} />
        )}

        {/* Special Tags */}
        {tags.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Special Ghost Tags</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tocChecked}
                  onChange={(e) => setTocChecked(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="font-medium">#toc (Table of Contents)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sidebarChecked}
                  onChange={(e) => setSidebarChecked(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="font-medium">#sidebar (Add to sidebar)</span>
              </label>
            </div>
          </div>
        )}

        {/* Update Button */}
        {tags.length > 0 && (
          <button
            onClick={updateArticle}
            disabled={updating}
            className="w-full mt-6 px-6 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg"
          >
            {updating ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-6 w-6"
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
                Updating...
              </span>
            ) : (
              "📝 Update Article Tags"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
