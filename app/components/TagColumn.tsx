"use client";

interface TagColumnProps {
  title: string;
  tags: string[];
  selectedTags: string[];
  onTagClick: (tag: string) => void;
  showAddAll?: boolean;
  onAddAll?: () => void;
  count?: number;
  headerButton?: React.ReactNode;
}

export default function TagColumn({
  title,
  tags,
  selectedTags,
  onTagClick,
  showAddAll = false,
  onAddAll,
  count,
  headerButton,
}: TagColumnProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">
            {title}
            {count !== undefined && (
              <span className="ml-2 text-sm font-normal text-gray-600">({count})</span>
            )}
          </h3>
          {headerButton}
        </div>
        {showAddAll && onAddAll && (
          <button
            onClick={onAddAll}
            disabled={tags.length === 0}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            + Add All
          </button>
        )}
      </div>

      {/* Tags List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tags.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-8">No tags</p>
        ) : (
          tags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={`${tag}-${index}`}
                onClick={() => onTagClick(tag)}
                disabled={isSelected}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                  isSelected
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                    : "bg-blue-50 text-blue-900 hover:bg-blue-100 hover:shadow-sm cursor-pointer"
                }`}
              >
                <span className="font-medium">{tag}</span>
                {!isSelected && (
                  <span className="ml-2 text-blue-500">→</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
