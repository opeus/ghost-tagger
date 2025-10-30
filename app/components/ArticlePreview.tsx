"use client";

import { useEffect, useState } from "react";

interface ArticlePreviewProps {
  postId: string;
  postTitle: string;
  onClose: () => void;
}

interface PostContent {
  title: string;
  html: string;
  plaintext: string;
  feature_image?: string;
  published_at?: string;
}

export default function ArticlePreview({ postId, postTitle, onClose }: ArticlePreviewProps) {
  const [content, setContent] = useState<PostContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/posts/${postId}`);
        const data = await response.json();

        if (response.ok) {
          setContent(data.post);
        } else {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [postId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Article Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Close preview"
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
              <p className="text-red-600 font-medium">Error loading article</p>
              <p className="text-gray-600 text-sm mt-2">{error}</p>
            </div>
          ) : content ? (
            <div className="prose prose-lg max-w-none">
              {/* Feature Image */}
              {content.feature_image && (
                <img
                  src={content.feature_image}
                  alt={content.title}
                  className="w-full rounded-lg mb-6"
                />
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>

              {/* Published Date */}
              {content.published_at && (
                <p className="text-sm text-gray-500 mb-6">
                  Published: {new Date(content.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}

              {/* HTML Content */}
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: content.html }}
              />
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Close Preview
          </button>
        </div>
      </div>

      <style jsx global>{`
        .article-content {
          font-family: Georgia, serif;
          line-height: 1.8;
        }
        .article-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }
        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #374151;
        }
        .article-content p {
          margin-bottom: 1.25rem;
          color: #4b5563;
        }
        .article-content ul,
        .article-content ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .article-content li {
          margin-bottom: 0.5rem;
        }
        .article-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .article-content a:hover {
          color: #1d4ed8;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .article-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
          margin: 1.5rem 0;
        }
        .article-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: monospace;
        }
        .article-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .article-content pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
      `}</style>
    </div>
  );
}
