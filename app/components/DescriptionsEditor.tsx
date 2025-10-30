"use client";

import { useState, useEffect } from "react";

interface DescriptionsEditorProps {
  postId: string;
  postTitle: string;
  postContent: string;
  existingTags: string[];
  initialDescriptions?: {
    custom_excerpt?: string;
    meta_title?: string;
    meta_description?: string;
    og_title?: string;
    og_description?: string;
    twitter_title?: string;
    twitter_description?: string;
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
  const [metaTitle, setMetaTitle] = useState(initialDescriptions.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialDescriptions.meta_description || "");
  const [ogTitle, setOgTitle] = useState(initialDescriptions.og_title || "");
  const [ogDescription, setOgDescription] = useState(initialDescriptions.og_description || "");
  const [twitterTitle, setTwitterTitle] = useState(initialDescriptions.twitter_title || "");
  const [twitterDescription, setTwitterDescription] = useState(initialDescriptions.twitter_description || "");

  // Update when post changes
  useEffect(() => {
    setCustomExcerpt(initialDescriptions.custom_excerpt || "");
    setMetaTitle(initialDescriptions.meta_title || "");
    setMetaDescription(initialDescriptions.meta_description || "");
    setOgTitle(initialDescriptions.og_title || "");
    setOgDescription(initialDescriptions.og_description || "");
    setTwitterTitle(initialDescriptions.twitter_title || "");
    setTwitterDescription(initialDescriptions.twitter_description || "");
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
      setMetaTitle(descriptions.meta_title || "");
      setMetaDescription(descriptions.meta_description || "");
      setOgTitle(descriptions.og_title || "");
      setOgDescription(descriptions.og_description || "");
      setTwitterTitle(descriptions.twitter_title || "");
      setTwitterDescription(descriptions.twitter_description || "");
    } catch (err: any) {
      setError(err.message || "Failed to generate descriptions");
    } finally {
      setGenerating(false);
    }
  };

  const saveDescriptions = async () => {
    // Only enforce hard limit on custom_excerpt (Ghost requirement)
    if (customExcerpt.length > 300) {
      setError("Custom excerpt cannot exceed 300 characters!");
      return;
    }
    // Other fields can be slightly longer - Ghost is flexible with them

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/descriptions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          custom_excerpt: customExcerpt,
          meta_title: metaTitle,
          meta_description: metaDescription,
          og_title: ogTitle,
          og_description: ogDescription,
          twitter_title: twitterTitle,
          twitter_description: twitterDescription,
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
          <span>📝 Article Metadata</span>
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
                <>🤖 Generate All Metadata</>
              )}
            </button>
            <p className="text-sm text-gray-600 italic">
              AI will generate all 7 fields (can be similar across platforms)
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
              placeholder="Brief, engaging summary (max 300 characters)"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm ${
                customExcerpt.length > 300 ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            <p className="text-xs text-gray-600 mt-1">
              Used in article cards, previews, and RSS feeds. Primary summary readers see.
            </p>
          </div>

          {/* SEO Section */}
          <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
            <h4 className="font-bold text-blue-900 mb-3">🔍 SEO (Search Engines)</h4>

            <div className="space-y-3">
              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-900">
                    Meta Title
                  </label>
                  <span className={`text-sm ${getCharCountColor(metaTitle.length, 60)}`}>
                    {metaTitle.length}/60 {metaTitle.length > 60 && "⚠️"}
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title (max 60 chars)"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                    metaTitle.length > 60 ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-900">
                    Meta Description
                  </label>
                  <span className={`text-sm ${getCharCountColor(metaDescription.length, 160)}`}>
                    {metaDescription.length}/160 {metaDescription.length > 160 && "⚠️"}
                  </span>
                </div>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO description (max 160 chars)"
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                    metaDescription.length > 160 ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Open Graph Section */}
          <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
            <h4 className="font-bold text-purple-900 mb-3">📱 Open Graph (Facebook/LinkedIn)</h4>

            <div className="space-y-3">
              {/* OG Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-900">
                    OG Title
                  </label>
                  <span className={`text-sm ${getCharCountColor(ogTitle.length, 60)}`}>
                    {ogTitle.length}/60 {ogTitle.length > 60 && "⚠️"}
                  </span>
                </div>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="Facebook/LinkedIn title (max 60 chars)"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm ${
                    ogTitle.length > 60 ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
              </div>

              {/* OG Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-900">
                    OG Description
                  </label>
                  <span className={`text-sm ${getCharCountColor(ogDescription.length, 160)}`}>
                    {ogDescription.length}/160 {ogDescription.length > 160 && "⚠️"}
                  </span>
                </div>
                <textarea
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder="Facebook/LinkedIn description (max 160 chars)"
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm ${
                    ogDescription.length > 160 ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Twitter Section */}
          <div className="border-2 border-cyan-300 rounded-lg p-4 bg-cyan-50">
            <h4 className="font-bold text-cyan-900 mb-3">🐦 Twitter Card</h4>

            <div className="space-y-3">
              {/* Twitter Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-900">
                    Twitter Title
                  </label>
                  <span className={`text-sm ${getCharCountColor(twitterTitle.length, 60)}`}>
                    {twitterTitle.length}/60 {twitterTitle.length > 60 && "⚠️"}
                  </span>
                </div>
                <input
                  type="text"
                  value={twitterTitle}
                  onChange={(e) => setTwitterTitle(e.target.value)}
                  placeholder="Twitter title (max 60 chars)"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm ${
                    twitterTitle.length > 60 ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
              </div>

              {/* Twitter Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-900">
                    Twitter Description
                  </label>
                  <span className={`text-sm ${getCharCountColor(twitterDescription.length, 200)}`}>
                    {twitterDescription.length}/200 {twitterDescription.length > 200 && "⚠️"}
                  </span>
                </div>
                <textarea
                  value={twitterDescription}
                  onChange={(e) => setTwitterDescription(e.target.value)}
                  placeholder="Twitter description (max 200 chars)"
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm ${
                    twitterDescription.length > 200 ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={saveDescriptions}
              disabled={
                saving ||
                customExcerpt.length > 300 ||
                metaTitle.length > 60 ||
                metaDescription.length > 160 ||
                ogTitle.length > 60 ||
                ogDescription.length > 160 ||
                twitterTitle.length > 60 ||
                twitterDescription.length > 200
              }
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {saving ? "Saving..." : "💾 Save All Metadata"}
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
