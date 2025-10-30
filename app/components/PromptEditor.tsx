"use client";

import { useState, useEffect } from "react";

interface PromptEditorProps {
  onClose: () => void;
}

export default function PromptEditor({ onClose }: PromptEditorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPrompt();
  }, []);

  const loadPrompt = async () => {
    try {
      const response = await fetch("/api/prompt");
      const data = await response.json();
      if (response.ok) {
        setPrompt(data.prompt);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✓ AI Prompt saved successfully!");
        onClose();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset to default prompt? This cannot be undone.")) {
      setPrompt(`Analyze the following blog article and suggest relevant tags.

Title: {title}

Content: {content}

Existing tags: {existing_tags}

Please provide a list of 10-20 relevant tags for this article. Consider:
- Main topics and themes (most important)
- Target audience and context
- Key concepts and terminology
- Related subjects and categories
- Educational context if applicable
- Industry-specific terms
- Broader topical areas

Think deeply about the article's content, purpose, and audience. Consider both specific and general tags that would help readers discover this content.

Return ONLY the tag names, one per line, without numbering or bullet points. Order them by relevance, with the most important/primary tag first.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🤖 Edit AI Prompt</h2>
            <p className="text-sm text-gray-600 mt-1">Model: Gemini 2.5 Pro</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Close editor"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Error loading prompt</p>
              <p className="text-gray-600 text-sm mt-2">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">📝 Available Variables:</h3>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p><code className="bg-yellow-100 px-2 py-0.5 rounded">{"{title}"}</code> - Article title</p>
                  <p><code className="bg-yellow-100 px-2 py-0.5 rounded">{"{content}"}</code> - Article content (first 5000 chars)</p>
                  <p><code className="bg-yellow-100 px-2 py-0.5 rounded">{"{existing_tags}"}</code> - Current tags (comma-separated)</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-800 mb-2">
                  AI Prompt Template
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  rows={20}
                  placeholder="Enter your AI prompt template..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {prompt.length} characters
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            🔄 Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !prompt.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {saving ? "Saving..." : "💾 Save Prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
