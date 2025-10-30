"use client";

import { useState } from "react";
import tagLibrary from "@/lib/tag-library.json";

interface LibraryColumnProps {
  selectedTags: string[];
  onTagClick: (tag: string) => void;
}

export default function LibraryColumn({ selectedTags, onTagClick }: LibraryColumnProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(tagLibrary))
  );

  // Parse library into categories
  const categories = Object.entries(tagLibrary).map(([category, tagsString]) => ({
    name: category.replace(/_/g, " "),
    tags: tagsString.split(",").map((t) => t.trim()),
  }));

  // Filter tags by search
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      tags: category.tags.filter((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.tags.length > 0);

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const totalTags = categories.reduce((sum, cat) => sum + cat.tags.length, 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Library
          <span className="ml-2 text-sm font-normal text-gray-600">({totalTags})</span>
        </h3>
        <input
          type="text"
          placeholder="Search library..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredCategories.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-8">No tags found</p>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition"
              >
                <span className="font-semibold text-sm text-gray-700">
                  {category.name}
                  <span className="ml-2 text-xs text-gray-500">({category.tags.length})</span>
                </span>
                <span className="text-gray-500">
                  {expandedCategories.has(category.name) ? "▼" : "▶"}
                </span>
              </button>

              {/* Category Tags */}
              {expandedCategories.has(category.name) && (
                <div className="p-2 space-y-1 bg-white">
                  {category.tags.map((tag, index) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={`${tag}-${index}`}
                        onClick={() => onTagClick(tag)}
                        disabled={isSelected}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                          isSelected
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                            : "bg-purple-50 text-purple-900 hover:bg-purple-100 hover:shadow-sm cursor-pointer"
                        }`}
                      >
                        <span className="font-medium">{tag}</span>
                        {!isSelected && (
                          <span className="ml-2 text-purple-500">→</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
