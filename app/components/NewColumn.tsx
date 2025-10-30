"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NewColumnProps {
  tags: string[];
  onReorder: (tags: string[]) => void;
  onRemove: (tag: string) => void;
  onClear: () => void;
  onAdd: (tag: string) => void;
}

function SortableTag({ tag, index, onRemove }: { tag: string; index: number; onRemove: (tag: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-2 bg-green-50 border border-green-300 rounded text-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move p-0.5 hover:bg-green-200 rounded"
      >
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <span className="font-semibold text-green-700 mr-1.5">{index + 1}.</span>
        <span className="font-medium text-green-900">{tag}</span>
        {index === 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
            👑 PRIMARY
          </span>
        )}
      </div>

      <button
        onClick={() => onRemove(tag)}
        className="p-0.5 hover:bg-red-100 rounded text-red-600 hover:text-red-800 transition"
        title="Remove tag"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function NewColumn({ tags, onReorder, onRemove, onClear, onAdd }: NewColumnProps) {
  const [newTag, setNewTag] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tags.indexOf(active.id as string);
      const newIndex = tags.indexOf(over.id as string);

      onReorder(arrayMove(tags, oldIndex, newIndex));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag) {
      onAdd(trimmedTag);
      setNewTag("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTag();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border-2 border-green-400">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">
            New
            <span className="ml-2 text-sm font-normal text-gray-600">({tags.length})</span>
          </h3>
          {tags.length > 0 && (
            <button
              onClick={onClear}
              className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded hover:bg-red-200 transition"
            >
              Clear All
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 italic mb-3">
          Drag to reorder • First tag is PRIMARY
        </p>

        {/* Add Custom Tag Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a custom tag..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Tags List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm italic mb-2">No tags selected</p>
            <p className="text-gray-400 text-xs">Click tags from other columns to add them here</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tags} strategy={verticalListSortingStrategy}>
              {tags.map((tag, index) => (
                <SortableTag key={tag} tag={tag} index={index} onRemove={onRemove} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
