"use client";

import { useState, useEffect } from "react";

interface DescriptionsEditorProps {
  postId: string;
  postTitle: string;
  postContent: string;
  existingTags: string[];
  initialDescriptions?: {
    custom_excerpt?: string;
    meta_description?: string;
    og_description?: string;
  };
}

export default function DescriptionsEditor({
  postId,
  postTitle,
  postContent,
  existingTags,
  initialDescriptions = {},
}: DescriptionsEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [customExcerpt, setCustomExcerpt] = useState(initialDescriptions.custom_excerpt || "");
  const [metaDescription, setMetaDescription] = useState(initialDescriptions.meta_description || "");
  const [ogDescription, setOgDescription] = useState(initialDescriptions.og_description || "");

  // Update when post changes
  useEffect(() => {
    setCustomExcerpt(initialDescriptions.custom_excerpt || "");
    setMetaDescription(initialDescriptions.meta_description || "");
    setOgDescription(initialDescriptions.og_description || "");
  }, [postId, initialDescriptions]);

  const generateDescriptions = async () => {
    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/descriptions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          existingTags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate descriptions");
        return;
      }

      const { descriptions } = data;
      setCustomExcerpt(descriptions.custom_excerpt || "");
      setMetaDescription(descriptions.meta_description || "");
      setOgDescription(descriptions.og_description || "");
    } catch (err: any) {
      setError(err.message || "Failed to generate descriptions");
    } finally {
      setGenerating(false);
    }
  };

  const saveDescriptions = async () => {
    // Validate character limits
    if (customExcerpt.length > 300) {
      setError("Custom excerpt cannot exceed 300 characters!");
      return;
    }
    if (metaDescription.length > 160) {
      setError("Meta description cannot exceed 160 characters!");
      return;
    }
    if (ogDescription.length > 160) {
      setError("OG description cannot exceed 160 characters!");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/descriptions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          custom_excerpt: customExcerpt,
          meta_description: metaDescription,
          og_description: ogDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save descriptions");
        return;
      }

      alert("✓ Descriptions saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save descriptions");
    } finally {
      setSaving(false);
    }
  };

  const getCharCountColor = (current: number, max: number) => {
    if (current > max) return "text-red-600 font-bold";
    if (current > max * 0.9) return "text-orange-600 font-semibold";
    return "text-gray-600";
  };

  if (!postId) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-blue-600 transition"
        >
          <span>{isExpanded ? "▼" : "▶"}</span>
          <span>📝 Article Descriptions</span>
          <span className="text-sm font-normal text-gray-500">(SEO & Social Media)</span>
        </button>
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Expand
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Generate Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={generateDescriptions}
              disabled={generating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
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
                <>🤖 Generate Descriptions</>
              )}
            </button>
            <p className="text-sm text-gray-600 italic">
              AI will generate optimized descriptions for this article
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Custom Excerpt - MOST IMPORTANT */}
          <div className="border-2 border-yellow-400 rounded-lg p-4 bg-yellow-50">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-900">
                ⭐ Custom Excerpt (MOST IMPORTANT)
              </label>
              <span className={`text-sm ${getCharCountColor(customExcerpt.length, 300)}`}>
                {customExcerpt.length}/300 {customExcerpt.length > 300 && "⚠️ EXCEEDS LIMIT!"}
              </span>
            </div>
            <textarea
              value={customExcerpt}
              onChange={(e) => setCustomExcerpt(e.target.value)}
              placeholder="Brief, engaging summary of the article (max 300 characters)"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm ${
                customExcerpt.length > 300 ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            <p className="text-xs text-gray-600 mt-1">
              Used in article cards, previews, and RSS feeds. This is the primary summary readers see.
            </p>
          </div>

          {/* Meta Description */}
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                🔍 Meta Description - SEO
              </label>
              <span className={`text-sm ${getCharCountColor(metaDescription.length, 160)}`}>
                {metaDescription.length}/160 {metaDescription.length > 160 && "⚠️ TOO LONG"}
              </span>
            </div>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="SEO-optimized description for search engines (max 160 characters)"
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                metaDescription.length > 160 ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            <p className="text-xs text-gray-600 mt-1">
              Appears in Google search results. Include keywords naturally.
            </p>
          </div>

          {/* OG Description */}
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                📱 OG Description - Social Media
              </label>
              <span className={`text-sm ${getCharCountColor(ogDescription.length, 160)}`}>
                {ogDescription.length}/160 {ogDescription.length > 160 && "⚠️ TOO LONG"}
              </span>
            </div>
            <textarea
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="Engaging description for social media sharing (max 160 characters)"
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                ogDescription.length > 160 ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            <p className="text-xs text-gray-600 mt-1">
              Used when sharing on Facebook, LinkedIn, etc. Make it compelling!
            </p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={saveDescriptions}
              disabled={saving || customExcerpt.length > 300 || metaDescription.length > 160 || ogDescription.length > 160}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {saving ? "Saving..." : "💾 Save Descriptions"}
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
