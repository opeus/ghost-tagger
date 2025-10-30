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

export interface Tag {
  id: string;
  name: string;
  isNew: boolean;
  isAI: boolean;
  selected: boolean;
}

interface TagListProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onAddCustomTag: () => void;
}

function SortableTag({
  tag,
  index,
  onToggle,
  onEdit,
}: {
  tag: Tag;
  index: number;
  onToggle: (id: string) => void;
  onEdit: (id: string, newName: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tag.name);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tag.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(tag.name);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== tag.name) {
      onEdit(tag.id, editValue.trim());
    } else {
      setEditValue(tag.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(tag.name);
    }
  };

  const bgColor = tag.isNew
    ? tag.isAI
      ? "bg-green-50 border-green-300"
      : "bg-orange-50 border-orange-300"
    : "bg-white border-gray-300";

  const textColor = tag.isNew
    ? tag.isAI
      ? "text-green-800"
      : "text-orange-800"
    : "text-gray-800";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`tag-item flex items-center gap-3 p-3 rounded-lg border-2 ${bgColor} ${textColor} ${
        !tag.selected ? "opacity-50" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={tag.selected}
        onChange={() => onToggle(tag.id)}
        className="w-5 h-5 rounded cursor-pointer"
      />

      <div
        {...attributes}
        {...listeners}
        className="cursor-move p-1 hover:bg-gray-200 rounded"
      >
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2 flex-wrap" onDoubleClick={handleDoubleClick}>
            <span className="font-semibold text-gray-500 text-sm">{index + 1}.</span>
            <span className="font-medium">{tag.name}</span>
            {index === 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                PRIMARY
              </span>
            )}
            {tag.isAI && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded">
                AI
              </span>
            )}
            {tag.isNew && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                NEW
              </span>
            )}
            {!tag.isNew && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                existing
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TagList({ tags, onTagsChange, onAddCustomTag }: TagListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tags.findIndex((tag) => tag.id === active.id);
      const newIndex = tags.findIndex((tag) => tag.id === over.id);

      onTagsChange(arrayMove(tags, oldIndex, newIndex));
    }
  };

  const handleToggle = (id: string) => {
    onTagsChange(
      tags.map((tag) => (tag.id === id ? { ...tag, selected: !tag.selected } : tag))
    );
  };

  const handleEdit = (id: string, newName: string) => {
    onTagsChange(tags.map((tag) => (tag.id === id ? { ...tag, name: newName } : tag)));
  };

  const selectAll = () => {
    onTagsChange(tags.map((tag) => ({ ...tag, selected: true })));
  };

  const selectNone = () => {
    onTagsChange(tags.map((tag) => ({ ...tag, selected: false })));
  };

  const selectNew = () => {
    onTagsChange(tags.map((tag) => ({ ...tag, selected: tag.isNew })));
  };

  const selectAI = () => {
    onTagsChange(tags.map((tag) => ({ ...tag, selected: tag.isAI })));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Manage Tags <span className="text-sm font-normal text-gray-500">(Drag to reorder, Double-click to edit)</span>
        </h2>
        <button
          onClick={onAddCustomTag}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Custom Tag
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={selectAll}
          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
        >
          ✓ All
        </button>
        <button
          onClick={selectNew}
          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition"
        >
          ✓ New Only
        </button>
        <button
          onClick={selectAI}
          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition"
        >
          ✓ AI Only
        </button>
        <button
          onClick={selectNone}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
        >
          ✗ None
        </button>
      </div>

      <div className="space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tags.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tags.map((tag, index) => (
              <SortableTag
                key={tag.id}
                tag={tag}
                index={index}
                onToggle={handleToggle}
                onEdit={handleEdit}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-4 text-sm text-gray-600 italic">
        💡 Legend: Green = AI New | Orange = Manual New | White = Existing
      </div>
    </div>
  );
}
