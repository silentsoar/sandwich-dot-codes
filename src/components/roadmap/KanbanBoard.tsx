"use client";

import { useState } from "react";
import { DoodleAccent } from "@/components/decorative/DoodleAccent";
import { KanbanColumn, type ColumnConfig } from "./KanbanColumn";
import type { KanbanCardData } from "./KanbanCard";

interface KanbanBoardData {
  columns: { id: string; title: string; cards: KanbanCardData[] }[];
}

const COLUMN_CONFIGS: Record<string, ColumnConfig> = {
  idea: {
    id: "idea",
    title: "Idea",
    color: "bg-lavender",
    bg: "bg-lavender/10",
    cardBg: "bg-lavender/25",
    cardBorder: "border-lavender/50",
    headerBg: "bg-lavender/20",
    rotation: -1,
  },
  todo: {
    id: "todo",
    title: "To Do",
    color: "bg-sky",
    bg: "bg-sky/10",
    cardBg: "bg-sky/25",
    cardBorder: "border-sky/50",
    headerBg: "bg-sky/20",
    rotation: 0.5,
  },
  doing: {
    id: "doing",
    title: "Doing",
    color: "bg-mustard",
    bg: "bg-mustard/10",
    cardBg: "bg-mustard/25",
    cardBorder: "border-mustard/50",
    headerBg: "bg-mustard/20",
    rotation: -0.5,
  },
  parked: {
    id: "parked",
    title: "Parked",
    color: "bg-muted",
    bg: "bg-muted/10",
    cardBg: "bg-muted/15",
    cardBorder: "border-muted/40",
    headerBg: "bg-muted/15",
    rotation: 0.8,
  },
  done: {
    id: "done",
    title: "Done",
    color: "bg-slime",
    bg: "bg-slime/10",
    cardBg: "bg-slime/25",
    cardBorder: "border-slime/50",
    headerBg: "bg-slime/20",
    rotation: -0.3,
  },
};

interface KanbanBoardProps {
  initialBoard: KanbanBoardData;
  isAuthenticated: boolean;
}

export function KanbanBoard({ initialBoard, isAuthenticated }: KanbanBoardProps) {
  const [board, setBoard] = useState<KanbanBoardData>(initialBoard);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  function persistBoard(newBoard: KanbanBoardData) {
    if (!isAuthenticated) return;

    setSaveStatus("saving");
    fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBoard),
    })
      .then((res) => res.json())
      .then((data) => {
        setSaveStatus(data.success ? "saved" : "error");
        setSaveMessage(data.success ? "Saved" : data.error || "Save failed");
      })
      .catch(() => {
        setSaveStatus("error");
        setSaveMessage("Network error");
      })
      .finally(() => {
        setTimeout(() => {
          setSaveStatus("idle");
          setSaveMessage("");
        }, 2000);
      });
  }

  function updateBoard(fn: (prev: KanbanBoardData) => KanbanBoardData) {
    setBoard((prev) => {
      const next = fn(prev);
      persistBoard(next);
      return next;
    });
  }

  function moveCard(cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) {
    updateBoard((prev) => {
      const newBoard = { ...prev, columns: prev.columns.map((c) => ({ ...c, cards: [...c.cards] })) };

      const fromCol = newBoard.columns.find((c) => c.id === fromColumnId);
      const toCol = newBoard.columns.find((c) => c.id === toColumnId);
      if (!fromCol || !toCol) return prev;

      const cardIndex = fromCol.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prev;

      const [card] = fromCol.cards.splice(cardIndex, 1);

      const adjustedIndex = fromColumnId === toColumnId && cardIndex < toIndex
        ? toIndex - 1
        : toIndex;

      toCol.cards.splice(adjustedIndex, 0, card);
      return newBoard;
    });
  }

  function addCard(columnId: string, text: string) {
    updateBoard((prev) => {
      const newBoard = { ...prev, columns: prev.columns.map((c) => ({ ...c, cards: [...c.cards] })) };
      const col = newBoard.columns.find((c) => c.id === columnId);
      if (!col) return prev;

      const id = `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      col.cards.push({ id, text });
      return newBoard;
    });
  }

  function deleteCard(cardId: string, columnId: string) {
    updateBoard((prev) => {
      const newBoard = { ...prev, columns: prev.columns.map((c) => ({ ...c, cards: [...c.cards] })) };
      const col = newBoard.columns.find((c) => c.id === columnId);
      if (!col) return prev;

      col.cards = col.cards.filter((c) => c.id !== cardId);
      return newBoard;
    });
  }

  function editCard(cardId: string, columnId: string, newText: string) {
    updateBoard((prev) => {
      const newBoard = { ...prev, columns: prev.columns.map((c) => ({ ...c, cards: [...c.cards] })) };
      const col = newBoard.columns.find((c) => c.id === columnId);
      if (!col) return prev;

      const card = col.cards.find((c) => c.id === cardId);
      if (!card) return prev;

      card.text = newText;
      return newBoard;
    });
  }

  return (
    <div className="relative">
      <div className="absolute -top-8 -right-4 rotate-12 sm:right-8">
        <DoodleAccent variant="star" color="#D6B347" size={36} />
      </div>
      <div className="absolute -top-4 left-8 rotate-[-6deg] hidden sm:block">
        <DoodleAccent variant="squiggle" color="#6F9D9A" size={48} />
      </div>

      {isAuthenticated && saveStatus !== "idle" && (
        <div className="mb-3 h-5">
          {saveStatus === "saving" && (
            <span className="font-heading text-xs font-bold text-muted">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="font-heading text-xs font-bold text-slime">{saveMessage}</span>
          )}
          {saveStatus === "error" && (
            <span className="font-heading text-xs font-bold text-salmon">{saveMessage}</span>
          )}
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {board.columns.map((column) => {
          const config = COLUMN_CONFIGS[column.id];
          if (!config) return null;
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              config={config}
              isAuthenticated={isAuthenticated}
              onMoveCard={moveCard}
              onAddCard={addCard}
              onDeleteCard={deleteCard}
              onEditCard={editCard}
            />
          );
        })}
      </div>

      <div className="absolute -bottom-6 left-1/3 rotate-3 hidden sm:block">
        <DoodleAccent variant="dot-cluster" color="#D98B73" size={32} />
      </div>
      <div className="absolute -bottom-8 right-1/4 rotate-[-5deg] hidden md:block">
        <DoodleAccent variant="circle" color="#B8A7CC" size={28} />
      </div>
    </div>
  );
}
