"use client";

import { useState, useEffect } from "react";

interface LibraryEditorProps {
  onClose: () => void;
  onSave: (library: Record<string, string>) => void;
}

export default function LibraryEditor({ onClose, onSave }: LibraryEditorProps) {
  const [library, setLibrary] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const response = await fetch("/api/library");
      const data = await response.json();
      if (response.ok) {
        setLibrary(data.library);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string, value: string) => {
    setLibrary({ ...library, [category]: value });
  };

  const handleAddCategory = () => {
    const categoryName = prompt("Enter new category name (use underscores for spaces):");
    if (categoryName && categoryName.trim()) {
      const cleanName = categoryName.trim().replace(/\s+/g, "_");
      if (!library[cleanName]) {
        setLibrary({ ...library, [cleanName]: "" });
      } else {
        alert("Category already exists!");
      }
    }
  };

  const handleDeleteCategory = (category: string) => {
    if (confirm(`Delete category "${category.replace(/_/g, " ")}"?`)) {
      const newLibrary = { ...library };
      delete newLibrary[category];
      setLibrary(newLibrary);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ library }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✓ Library saved successfully!");
        onSave(library);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-2xl font-bold text-gray-900">📚 Edit Tag Library</h2>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Error loading library</p>
              <p className="text-gray-600 text-sm mt-2">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Edit categories and tags below. Separate tags with commas.
                </p>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                >
                  + Add Category
                </button>
              </div>

              {Object.entries(library).map(([category, tags]) => (
                <div key={category} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-gray-800">
                      {category.replace(/_/g, " ")}
                    </label>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-800 transition"
                      title="Delete category"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <textarea
                    value={tags}
                    onChange={(e) => handleCategoryChange(category, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
                    rows={3}
                    placeholder="Tag1, Tag2, Tag3..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {tags.split(",").filter((t) => t.trim()).length} tags
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {saving ? "Saving..." : "💾 Save Library"}
          </button>
        </div>
      </div>
    </div>
  );
}
