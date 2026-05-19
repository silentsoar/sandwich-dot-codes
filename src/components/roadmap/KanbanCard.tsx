"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { GripVertical, X, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KanbanCardData {
  id: string;
  title?: string;
  details?: string;
  text?: string;
  lane?: string;
}

interface KanbanCardProps {
  card: KanbanCardData;
  columnId: string;
  laneId: string;
  colorClasses: { bg: string; border: string };
  isAuthenticated: boolean;
  onDragStart: (cardId: string, columnId: string) => void;
  onDelete: (cardId: string, columnId: string) => void;
  onEdit: (cardId: string, columnId: string, title: string, details: string) => void;
  index: number;
}

export function KanbanCard({
  card,
  columnId,
  laneId,
  colorClasses,
  isAuthenticated,
  onDragStart,
  onDelete,
  onEdit,
  index,
}: KanbanCardProps) {
  const title = card.title ?? card.text ?? "Untitled";
  const details = card.details ?? "";
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDetails, setEditDetails] = useState(details);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const rotation = ((index * 7 + 3) % 5) - 2;

  function handleSave() {
    const trimmedTitle = editTitle.trim();
    const trimmedDetails = editDetails.trim();
    if (trimmedTitle) {
      onEdit(card.id, columnId, trimmedTitle, trimmedDetails);
    } else {
      setEditTitle(title);
      setEditDetails(details);
    }
    setIsEditing(false);
  }

  function handleNativeDragStart(e: React.DragEvent<HTMLDivElement>) {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.setData("application/column", columnId);
    e.dataTransfer.setData("application/lane", laneId);
    onDragStart(card.id, columnId);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div
        draggable={isAuthenticated}
        onDragStart={handleNativeDragStart}
        onDragEnd={() => setIsDragging(false)}
        className={cn(
          "group relative border-3 border-border p-3 paper-grain",
          "transition-all duration-200",
          "hover:shadow-tactile-sm",
          colorClasses.bg,
          colorClasses.border,
          isAuthenticated ? "cursor-grab active:cursor-grabbing" : "cursor-default",
          isDragging && "shadow-tactile-lg z-50 opacity-80",
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {isAuthenticated && (
          <div className="absolute -top-1.5 -left-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <GripVertical size={14} className="text-muted" />
          </div>
        )}

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
                if (e.key === "Escape") {
                  setEditTitle(title);
                  setEditDetails(details);
                  setIsEditing(false);
                }
              }}
              placeholder="Title"
              className="w-full border-b-2 border-border bg-transparent font-heading text-sm font-bold text-foreground outline-none"
              autoFocus
            />
            <textarea
              value={editDetails}
              onChange={(e) => setEditDetails(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
                if (e.key === "Escape") {
                  setEditTitle(title);
                  setEditDetails(details);
                  setIsEditing(false);
                }
              }}
              placeholder="Details"
              className="min-h-20 w-full resize-y border-2 border-border/50 bg-background/60 p-2 font-body text-sm text-foreground outline-none focus:border-border dark:bg-background-dark/60"
            />
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-1 border-2 border-border bg-mustard/30 px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition-colors hover:bg-mustard/50"
            >
              <Check size={14} />
              Save
            </button>
          </div>
        ) : (
          <div className="pr-8">
            <h5 className="font-heading text-sm font-black leading-snug text-foreground">
              {title}
            </h5>
            {details && (
              <p className="mt-2 whitespace-pre-wrap font-body text-sm leading-relaxed text-foreground/80">
                {details}
              </p>
            )}
          </div>
        )}

        {isAuthenticated && !isEditing && (
          <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => {
                setEditTitle(title);
                setEditDetails(details);
                setIsEditing(true);
              }}
              className="rounded p-1 transition-colors hover:bg-mustard/30"
              aria-label="Edit card"
            >
              <Pencil size={12} className="text-muted" />
            </button>
            <button
              onClick={() => onDelete(card.id, columnId)}
              className="rounded p-1 transition-colors hover:bg-salmon/30"
              aria-label="Delete card"
            >
              <X size={12} className="text-muted" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
