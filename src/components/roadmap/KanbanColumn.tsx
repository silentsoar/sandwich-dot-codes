"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCard, type KanbanCardData } from "./KanbanCard";

export interface SwimlaneConfig {
  id: string;
  title: string;
}

export interface ColumnConfig {
  id: string;
  title: string;
  color: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  rotation: number;
}

interface KanbanColumnProps {
  column: { id: string; title: string; cards: KanbanCardData[] };
  config: ColumnConfig;
  swimlanes: SwimlaneConfig[];
  isAuthenticated: boolean;
  onMoveCard: (cardId: string, fromColumn: string, toColumn: string, toIndex: number, toLane: string) => void;
  onAddCard: (columnId: string, title: string, details: string, laneId: string) => void;
  onDeleteCard: (cardId: string, columnId: string) => void;
  onEditCard: (cardId: string, columnId: string, title: string, details: string) => void;
}

export function KanbanColumn({
  column,
  config,
  swimlanes,
  isAuthenticated,
  onMoveCard,
  onAddCard,
  onDeleteCard,
  onEditCard,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const [dropTarget, setDropTarget] = useState<{ laneId: string; index: number } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addingLane, setAddingLane] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");

  function getLaneCards(laneId: string) {
    return column.cards.filter((card) => (card.lane ?? swimlanes[0]?.id) === laneId);
  }

  function getColumnInsertIndex(laneId: string, laneIndex: number) {
    const laneCardIds = new Set(getLaneCards(laneId).map((card) => card.id));
    let seenInLane = 0;

    for (let i = 0; i < column.cards.length; i++) {
      if (!laneCardIds.has(column.cards[i].id)) continue;
      if (seenInLane === laneIndex) return i;
      seenInLane++;
    }

    return column.cards.length;
  }

  function handleDragOver(e: React.DragEvent, laneId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);

    const laneCards = getLaneCards(laneId);
    const cardsContainer = e.currentTarget.querySelector("[data-cards]");
    if (!cardsContainer) {
      setDropTarget({ laneId, index: laneCards.length });
      return;
    }

    const cardElements = Array.from(cardsContainer.querySelectorAll("[data-card-item]"));
    let insertIndex = cardElements.length;

    for (let i = 0; i < cardElements.length; i++) {
      const rect = cardElements[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        insertIndex = i;
        break;
      }
    }

    setDropTarget({ laneId, index: insertIndex });
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false);
      setDropTarget(null);
    }
  }

  function handleDrop(e: React.DragEvent, laneId: string) {
    e.preventDefault();
    setIsOver(false);

    const cardId = e.dataTransfer.getData("text/plain");
    const sourceColumnId = e.dataTransfer.getData("application/column");

    if (cardId && sourceColumnId) {
      const targetLane = dropTarget?.laneId ?? laneId;
      const targetLaneIndex = dropTarget?.index ?? getLaneCards(targetLane).length;
      const targetIndex = getColumnInsertIndex(targetLane, targetLaneIndex);
      onMoveCard(cardId, sourceColumnId, column.id, targetIndex, targetLane);
    }

    setDropTarget(null);
  }

  function handleAddCard(laneId: string) {
    const trimmedTitle = newTitle.trim();
    const trimmedDetails = newDetails.trim();
    if (trimmedTitle) {
      onAddCard(column.id, trimmedTitle, trimmedDetails, laneId);
      setNewTitle("");
      setNewDetails("");
      setIsAdding(false);
      setAddingLane(null);
    }
  }

  const colorClasses = { bg: config.cardBg, border: config.cardBorder };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={cn(
        "flex min-w-[260px] flex-col rounded-lg border-3 border-border paper-grain",
        "transition-all duration-200",
        isOver && "shadow-tactile-lg scale-[1.01]",
      )}
      style={{ transform: `rotate(${config.rotation}deg)` }}
      onDragLeave={handleDragLeave}
    >
      <div className={cn("border-b-3 border-border px-4 py-3", config.headerBg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("h-3 w-3 rounded-full", config.color)} />
            <h3 className="font-heading text-sm font-black uppercase tracking-wider">
              {column.title}
            </h3>
          </div>
          <span className="rounded-full border-2 border-border px-2 py-0.5 font-heading text-xs font-bold">
            {column.cards.length}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {swimlanes.map((lane) => {
          const laneCards = getLaneCards(lane.id);
          return (
            <section
              key={lane.id}
              className="rounded-md border-2 border-border/25 bg-background/35 p-2 dark:bg-background-dark/35"
              onDragOver={(e) => handleDragOver(e, lane.id)}
              onDrop={(e) => handleDrop(e, lane.id)}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="font-heading text-[0.65rem] font-black uppercase tracking-widest text-muted">
                  {lane.title}
                </h4>
                <span className="font-heading text-[0.65rem] font-bold text-muted">{laneCards.length}</span>
              </div>

              <div data-cards className="flex min-h-10 flex-col gap-2">
                <AnimatePresence mode="popLayout">
                  {laneCards.map((card, index) => (
                    <div key={card.id} data-card-item>
                      {dropTarget?.laneId === lane.id && dropTarget.index === index && (
                        <motion.div
                          layoutId="drop-indicator"
                          className={cn("mb-2 h-1 rounded-full border-2 border-dashed border-border", config.color)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                      <KanbanCard
                        card={card}
                        columnId={column.id}
                        laneId={lane.id}
                        colorClasses={colorClasses}
                        isAuthenticated={isAuthenticated}
                        onDragStart={() => {}}
                        onDelete={onDeleteCard}
                        onEdit={onEditCard}
                        index={index}
                      />
                    </div>
                  ))}
                </AnimatePresence>

                {dropTarget?.laneId === lane.id && dropTarget.index >= laneCards.length && (
                  <div className={cn("h-1 rounded-full border-2 border-dashed border-border", config.color)} />
                )}

                {isOver && laneCards.length === 0 && dropTarget?.laneId === lane.id && (
                  <div className={cn("flex h-16 items-center justify-center rounded border-2 border-dashed border-border/50", config.color)}>
                    <span className="font-heading text-xs text-muted">Drop here</span>
                  </div>
                )}
              </div>

              {isAuthenticated && (
                <div className="pt-2">
                  {isAdding && addingLane === lane.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddCard(lane.id);
                          if (e.key === "Escape") {
                            setNewTitle("");
                            setNewDetails("");
                            setIsAdding(false);
                            setAddingLane(null);
                          }
                        }}
                        placeholder="Title"
                        className="w-full border-3 border-border bg-background p-2 font-body text-sm text-foreground outline-none focus:shadow-tactile-sm"
                        autoFocus
                      />
                      <textarea
                        value={newDetails}
                        onChange={(e) => setNewDetails(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddCard(lane.id);
                          if (e.key === "Escape") {
                            setNewTitle("");
                            setNewDetails("");
                            setIsAdding(false);
                            setAddingLane(null);
                          }
                        }}
                        placeholder={`Details for ${lane.title}`}
                        className="min-h-20 w-full resize-y border-3 border-border bg-background p-2 font-body text-sm text-foreground outline-none focus:shadow-tactile-sm"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAddCard(lane.id)}
                          className="flex-1 border-2 border-border bg-mustard/30 px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition-colors hover:bg-mustard/50"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setNewTitle(""); setNewDetails(""); setIsAdding(false); setAddingLane(null); }}
                          className="border-2 border-border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition-colors hover:bg-salmon/30"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setIsAdding(true); setAddingLane(lane.id); }}
                      className={cn(
                        "flex w-full items-center justify-center gap-1 border-2 border-dashed border-border/40 py-2",
                        "font-heading text-xs font-bold uppercase tracking-wider text-muted",
                        "transition-all hover:border-border hover:bg-mustard/10 hover:text-foreground",
                      )}
                    >
                      <Plus size={14} />
                      Add card
                    </button>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </motion.div>
  );
}
