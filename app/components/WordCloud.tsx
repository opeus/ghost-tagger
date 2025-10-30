"use client";

interface Keyword {
  word: string;
  count: number;
}

interface WordCloudProps {
  keywords: Keyword[];
  onKeywordClick: (word: string) => void;
}

export default function WordCloud({ keywords, onKeywordClick }: WordCloudProps) {
  if (keywords.length === 0) {
    return null;
  }

  const getFontSize = (count: number) => {
    const minSize = 12;
    const maxSize = 24;
    const size = Math.min(maxSize, minSize + count * 2);
    return `${size}px`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h2 className="text-xl font-bold text-blue-900">
          Click Keywords to Add as Tags
        </h2>
      </div>

      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2">
        {keywords.map((keyword, index) => (
          <button
            key={`${keyword.word}-${index}`}
            onClick={() => onKeywordClick(keyword.word)}
            className="keyword-btn px-4 py-2 bg-blue-100 text-blue-700 border-2 border-blue-300 rounded-full font-semibold hover:bg-blue-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            style={{ fontSize: getFontSize(keyword.count) }}
          >
            {keyword.word} <span className="text-xs opacity-75">({keyword.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
