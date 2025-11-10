import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Block, RawBlock } from "../../../types/typeEditor";
import { apiService } from "../../../services/ApiService";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";

const PAGE_W = 793;
const PAGE_H = 1122;

const PAD = 8;
const MIN_BLOCK_WIDTH = 140;
const MIN_BLOCK_HEIGHT = PAD * 2 + 20;

type DragState = { id: string; dx: number; dy: number } | null;
type ResizeState =
  | { id: string; startX: number; startY: number; startW: number; startH: number; mode: "horizontal" | "corner" }
  | null;

const Editor = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [zCounter, setZCounter] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const dragRef = useRef<DragState>(null);
  const resizeRef = useRef<ResizeState>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRefs = useMemo(() => new Map<string, HTMLDivElement | null>(), []);
  const setContentRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => { contentRefs.set(id, el); },
    [contentRefs]
  );

  const { notebookId = "", pageId = "" } = useParams<{ notebookId: string; pageId: string }>();

  // live mirrors + hydration guard
  const blocksRef = useRef<Block[]>([]);
  const hydratedOnceRef = useRef(false);

  const syncBlocks = useCallback((next: Block[] | ((prev: Block[]) => Block[])) => {
    setBlocks(prev => {
      const v = typeof next === "function" ? (next as (p: Block[]) => Block[])(prev) : next;
      blocksRef.current = v;
      return v;
    });
  }, []);

  const normalizeBlock = (raw: RawBlock | null | undefined): Block | null => {
    if (!raw) return null;
    const id = (raw as any).id ?? (raw as any)._id;
    if (!id) return null;
    const p: any = (raw as any).position ?? {};
    return {
      id,
      x: Number(p.x ?? (raw as any).x ?? 0),
      y: Number(p.y ?? (raw as any).y ?? 0),
      width: Number(p.width ?? (raw as any).width ?? MIN_BLOCK_WIDTH),
      height: Number(p.height ?? (raw as any).height ?? MIN_BLOCK_HEIGHT),
      z: Number(p.zIndex ?? (raw as any).z ?? 1),
      content: (raw as any).content ?? "",
    };
  };

  const getBlocksArray = (resp: any): RawBlock[] => {
    const d = resp?.data?.data ?? resp?.data ?? resp;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.blocks)) return d.blocks;
    if (Array.isArray(d?.data)) return d.data;
    if (d?.block) return [d.block];
    return [];
  };

  const getSingleBlock = (resp: any): RawBlock | null => {
    const d = resp?.data?.data?.block ?? resp?.data?.block ?? resp?.data ?? resp;
    if (!d) return null;
    if (Array.isArray(d)) return (d[0] as RawBlock) ?? null;
    return d as RawBlock;
  };

  const persistBlock = useCallback(async (block: Block) => {
    if (!notebookId || !pageId || !block.id) return;
    try {
      await apiService({
        url: `/users/notebook/${notebookId}/page/${pageId}/block/${block.id}`,
        method: "PUT",
        data: {
          blockId: block.id,
          notebookId,
          pageId,
          content: block.content,
          position: {
            x: block.x,
            y: block.y,
            width: block.width,
            height: block.height,
            zIndex: block.z,
          },
        },
      });
    } catch {
      toast.error("Failed to save changes.");
    }
  }, [notebookId, pageId]);

  const applyBlockUpdate = useCallback((id: string, updater: (b: Block) => Block | null | undefined) => {
    let updated: Block | null = null;
    syncBlocks(prev =>
      prev.map(b => {
        if (b.id !== id) return b;
        const next = updater(b);
        if (!next || next === b) return b;
        updated = next;
        return next;
      })
    );
    return updated;
  }, [syncBlocks]);

  // find topmost block under a click
  const blockAtClick = (e: React.MouseEvent) => {
    const rect = pageRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const sorted = [...blocksRef.current].sort((a, b) => b.z - a.z);
    return sorted.find(b => px >= b.x && px <= b.x + b.width && py >= b.y && py <= b.y + b.height) || null;
  };

  // sanitize html so empty states truly shrink
  const sanitizeHtml = (html: string): string => {
    if (typeof window === "undefined") return html;
    const scratch = document.createElement("div");
    scratch.innerHTML = html.replace(/<\/?span[^>]*>/gi, "").replace(/&nbsp;/gi, " ");
    const hasMedia = !!scratch.querySelector("img,svg,video,audio,iframe");

    // strip trailing meaningless nodes
    let child = scratch.lastChild;
    const isMeaningful = (n: Node) => {
      if (n.nodeType === Node.TEXT_NODE) return (n.textContent ?? "").replace(/\u00A0/g, "").trim().length > 0;
      if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as HTMLElement;
        if (el.querySelector("img,svg,video,audio,iframe")) return true;
        const inner = el.innerHTML.replace(/<br\s*\/?>(?=\s*<br\s*\/?>(\s|$))/gi, "");
        const stripped = inner.replace(/<br\s*\/?>/gi, "").replace(/\u00A0/g, "").trim();
        return stripped.length > 0 || (el.textContent ?? "").replace(/\u00A0/g, "").trim().length > 0;
      }
      return false;
    };
    while (child && !isMeaningful(child)) {
      const prev = child.previousSibling;
      scratch.removeChild(child);
      child = prev;
    }
    const text = scratch.textContent?.replace(/\u00A0/g, "").trim() ?? "";
    if (!hasMedia && text === "") scratch.innerHTML = "";
    return scratch.innerHTML;
  };

  // shrink exactly to content (overlay outline outside)
  const fitBlockToContent = useCallback((id: string) => {
    queueMicrotask(() => {
      const el = contentRefs.get(id);
      if (!el) return;
      const bk = blocksRef.current.find(b => b.id === id);
      if (!bk) return;
      el.style.height = "auto";
      const natural = el.scrollHeight;

      const desired = Math.max(natural, MIN_BLOCK_HEIGHT);
      const maxH = PAGE_H - bk.y;
      const height = Math.min(desired, maxH);

      el.style.height = `${height}px`;
      el.style.overflowY = "hidden";

      // reflect in state if changed
      if (height !== bk.height) {
        applyBlockUpdate(id, cur => ({ ...cur, height }));
      }
    });
  }, [applyBlockUpdate, contentRefs]);

  const commitBlock = useCallback((id: string | null | undefined) => {
    if (!id) return;
    const latest = blocksRef.current.find(b => b.id === id);
    if (latest) void persistBlock(latest);
  }, [persistBlock]);

  const exitEditMode = useCallback((opts?: { id?: string; persist?: boolean }) => {
    const targetId = opts?.id ?? editingId;
    if (!targetId) return;
    setEditingId(prev => (prev === targetId ? null : prev));
    fitBlockToContent(targetId);
    if (opts?.persist !== false) commitBlock(targetId);
    const el = contentRefs.get(targetId);
    if (el && typeof document !== "undefined" && document.activeElement === el) el.blur();
  }, [commitBlock, contentRefs, editingId, fitBlockToContent]);

  const enterEditMode = useCallback((id: string, focusPoint?: { x: number; y: number }) => {
    setSelectedId(id);
    setEditingId(id);
    requestAnimationFrame(() => {
      const el = contentRefs.get(id);
      if (!el) return;
      el.focus();
      if (focusPoint) placeCaret(el, focusPoint.x, focusPoint.y);
      else {
        const sel = window.getSelection();
        sel?.selectAllChildren(el);
        sel?.collapseToEnd();
      }
      fitBlockToContent(id);
    });
  }, [contentRefs, fitBlockToContent]);

  const bringToFront = useCallback((id: string) => {
    let nextZ = zCounter;
    const updated = applyBlockUpdate(id, b => {
      const z = Math.max(zCounter + 1, b.z + 1);
      nextZ = z;
      return b.z === z ? b : { ...b, z };
    });
    if (updated && nextZ !== zCounter) setZCounter(nextZ);
  }, [applyBlockUpdate, zCounter]);


  const fetchPageContent = useCallback(async () => {
    if (!notebookId || !pageId) return;
    setIsLoading(true);
    try {
      const response = await apiService({ url: `/users/notebook/${notebookId}/page/${pageId}`, method: "GET" });
      const raw = getBlocksArray(response);
      const normalized = raw.map(normalizeBlock).filter(Boolean) as Block[];
      hydratedOnceRef.current = false;
      syncBlocks(normalized);
      const maxZ = normalized.reduce((acc, b) => Math.max(acc, b.z ?? 1), 1);
      setZCounter(maxZ > 0 ? maxZ : 1);
    } catch {
      toast.error("Failed to load page content.");
    } finally {
      setIsLoading(false);
    }
  }, [notebookId, pageId, syncBlocks]);

  useEffect(() => { void fetchPageContent(); }, [fetchPageContent]);

  // Hydrate once, then snap sizes
  useEffect(() => {
    if (hydratedOnceRef.current) return;
    for (const b of blocks) {
      const el = contentRefs.get(b.id);
      if (el && el.innerHTML !== (b.content ?? "")) {
        el.innerHTML = b.content ?? "";
        queueMicrotask(() => fitBlockToContent(b.id));
      }
    }
    hydratedOnceRef.current = true;
  }, [blocks, contentRefs, fitBlockToContent]);

  // close editing when clicking outside the canvas
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = (ev: PointerEvent) => {
      if (!editingId) return;
      const pageEl = pageRef.current;
      if (!pageEl) return;
      if (ev.composedPath().includes(pageEl)) return;
      exitEditMode({ persist: true });
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [editingId, exitEditMode]);

  const updateContent = useCallback((id: string, htmlRaw: string) => {
    const html = sanitizeHtml(htmlRaw);
    applyBlockUpdate(id, b => (b.content === html ? b : { ...b, content: html }));
    fitBlockToContent(id);
  }, [applyBlockUpdate, fitBlockToContent]);

  const handlePageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget !== e.target) return;
    if (selectedId) setSelectedId(null);
    exitEditMode();
  }, [exitEditMode, selectedId]);

  const handlePageDoubleClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    exitEditMode();
    const hit = blockAtClick(e);
    if (hit) {
      bringToFront(hit.id);
      enterEditMode(hit.id, { x: e.clientX, y: e.clientY });
      return;
    }

    // empty area → create new block
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = 240;
    const height = MIN_BLOCK_HEIGHT;
    const newZ = zCounter + 1;

    try {
      const response = await apiService({
        url: `/users/notebook/${notebookId}/page/${pageId}/block`,
        method: "POST",
        data: {
          position: {
            x: clamp(x - width / 2, 0, PAGE_W - width),
            y: clamp(y - 20, 0, PAGE_H - height),
            width,
            height,
            zIndex: newZ,
          },
          content: "",
        },
      });

      const raw = getSingleBlock(response);
      const b = normalizeBlock(raw);
      if (b) {
        syncBlocks(prev => [...prev, b]);
        setZCounter(prev => Math.max(prev, b.z, newZ));
        enterEditMode(b.id, { x: e.clientX, y: e.clientY });
      }
    } catch {
      toast.error("Failed to create block.");
    }
  }, [enterEditMode, exitEditMode, getSingleBlock, notebookId, pageId, syncBlocks, zCounter, bringToFront]);

  // Drag
  const startDrag = (e: React.PointerEvent, b: Block) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    bringToFront(b.id);
    setSelectedId(b.id);
    if (editingId) exitEditMode();
    const rect = pageRef.current!.getBoundingClientRect();
    dragRef.current = { id: b.id, dx: e.clientX - (rect.left + b.x), dy: e.clientY - (rect.top + b.y) };
  };

  const onDragMove = (e: React.PointerEvent) => {
    const st = dragRef.current;
    if (!st || !pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    applyBlockUpdate(st.id, b => {
      let nx = e.clientX - rect.left - st.dx;
      let ny = e.clientY - rect.top - st.dy;
      nx = clamp(nx, 0, PAGE_W - b.width);
      ny = clamp(ny, 0, PAGE_H - b.height);
      if (nx === b.x && ny === b.y) return b;
      return { ...b, x: nx, y: ny };
    });
  };

  const endDrag = (e: React.PointerEvent) => {
    const st = dragRef.current;
    if (!st) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    const block = blocksRef.current.find(b => b.id === st.id);
    if (block) void persistBlock(block);
    dragRef.current = null;
  };

  // Resize
  const startResize = (e: React.PointerEvent, b: Block, mode: "horizontal" | "corner" = "corner") => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    bringToFront(b.id);
    setSelectedId(b.id);
    if (editingId) exitEditMode();
    resizeRef.current = { id: b.id, startX: e.clientX, startY: e.clientY, startW: b.width, startH: b.height, mode };
  };

  const onResizeMove = (e: React.PointerEvent) => {
    const st = resizeRef.current;
    if (!st) return;
    applyBlockUpdate(st.id, b => {
      let newW = st.startW + (e.clientX - st.startX);
      let newH = st.startH + (e.clientY - st.startY);
      if (st.mode === "horizontal") {
        newW = clamp(Math.max(MIN_BLOCK_WIDTH, newW), MIN_BLOCK_WIDTH, PAGE_W - b.x);
        if (newW === b.width) return b;
        return { ...b, width: newW };
      }
      // corner resize (keep min + within page)
      newW = Math.min(Math.max(MIN_BLOCK_WIDTH, newW), PAGE_W - b.x);
      newH = Math.min(Math.max(MIN_BLOCK_HEIGHT, newH), PAGE_H - b.y);
      if (newW === b.width && newH === b.height) return b;
      return { ...b, width: newW, height: newH };
    });
  };

  const endResize = (e: React.PointerEvent) => {
    const st = resizeRef.current;
    if (!st) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    const id = st.id;
    queueMicrotask(() => { fitBlockToContent(id); commitBlock(id); });
    resizeRef.current = null;
  };

  // Save button — bulk, fallback per-block
  const handleSaveAll = useCallback(async () => {
    if (!notebookId || !pageId) return;
    const latest = blocksRef.current;
    if (!latest.length) {
      toast.info("Nothing to save.");
      return;
    }
    setIsBulkSaving(true);
    try {
      try {
        await apiService({
          url: `/users/notebook/${notebookId}/page/${pageId}/blocks`,
          method: "PUT",
          data: {
            blocks: latest.map(b => ({
              blockId: b.id,
              content: b.content,
              position: { x: b.x, y: b.y, width: b.width, height: b.height, zIndex: b.z },
            })),
          },
        });
      } catch {
        await Promise.all(latest.map(b => persistBlock(b)));
      }
      toast.success("All blocks saved.");
    } catch {
      toast.error("Failed to save all blocks.");
    } finally {
      setIsBulkSaving(false);
    }
  }, [notebookId, pageId, persistBlock]);


  return (
    <div className="w-full h-full flex flex-col items-center py-10 bg-background text-foreground overflow-auto">
      <div className="w-full flex justify-end mb-4 px-4" style={{ maxWidth: PAGE_W }}>
        <Button variant="outline" onClick={handleSaveAll} disabled={isBulkSaving || isLoading}>
          {isBulkSaving ? "Saving…" : "Save"}
        </Button>
      </div>

      <div
        ref={pageRef}
        onClick={handlePageClick}
        onDoubleClick={handlePageDoubleClick}
        className="relative bg-card border border-border shadow-sm shrink-0"
        style={{
          width: PAGE_W,
          height: PAGE_H,
          cursor: "crosshair",
          userSelect: dragRef.current || resizeRef.current ? "none" : "auto",
          zIndex: 0,
        }}
        onPointerMove={(e) => { onDragMove(e); onResizeMove(e); }}
        onPointerUp={(e) => { endDrag(e); endResize(e); }}
      >
        {blocks.map((b) => {
          const isActive =
            selectedId === b.id ||
            dragRef.current?.id === b.id ||
            resizeRef.current?.id === b.id;
          const isEditing = editingId === b.id;

          return (
            <div
              key={b.id}
              className="absolute"
              style={{
                left: b.x,
                top: b.y,
                width: b.width,
                height: b.height,
                zIndex: b.z,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(b.id);
                if (!isEditing) bringToFront(b.id);
                if (editingId && editingId !== b.id) exitEditMode({ persist: true });
              }}
            >
              {/* Selection OUTLINE overlay (outside the layout) */}
              {isActive && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ border: "2px solid rgba(59,130,246,1)", borderRadius: 2 }}
                />
              )}

              {/* Drag overlay when not editing */}
              {isActive && !isEditing && (
                <div
                  className="absolute inset-0 cursor-move"
                  style={{ touchAction: "none" }}
                  onPointerDown={(e) => startDrag(e, b)}
                />
              )}

              {/* Delete bubble (hidden while editing) */}
              {isActive && !isEditing && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={async (e) => {
                    e.stopPropagation();
                    syncBlocks(prev => prev.filter(x => x.id !== b.id));
                    try {
                      await apiService({ url: `/users/notebook/${notebookId}/page/${pageId}/block/${b.id}`, method: "DELETE" });
                    } catch {
                      toast.error("Failed to delete block.");
                      void fetchPageContent();
                    }
                  }}
                  className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-md text-xs leading-none"
                  title="Delete"
                >
                  ×
                </button>
              )}

              {/* CONTENT (measurement target) */}
              <div
                ref={setContentRef(b.id)}
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={`w-full h-full p-2 text-sm outline-none whitespace-pre-wrap wrap-break-words ${
                  isEditing ? "cursor-text caret-blue-500" : "cursor-default"
                }`}
                style={{
                  boxSizing: "border-box", 
                  userSelect: isEditing ? "text" : "none",
                  overflowY: "hidden",
                }}
                onPointerDown={(e) => { e.stopPropagation(); setSelectedId(b.id); }}
                onDoubleClick={(e) => { e.stopPropagation(); bringToFront(b.id); enterEditMode(b.id, { x: e.clientX, y: e.clientY }); }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  const html = sanitizeHtml(el.innerHTML);
                  if (html === "" && el.innerHTML !== "") el.innerHTML = "";
                  updateContent(b.id, html);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    exitEditMode({ id: b.id });
                  }
                }}
                onBlur={() => exitEditMode({ id: b.id })}
              />

              {/* Horizontal resize handle (hidden while editing) */}
              {isActive && !isEditing && (
                <div
                  onPointerDown={(e) => { e.stopPropagation(); startResize(e, b, "horizontal"); }}
                  className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 h-6 w-4 border border-border bg-accent/70 cursor-ew-resize flex items-center justify-center rounded-r"
                  style={{ touchAction: "none" }}
                  title="Resize horizontally"
                >
                  <span className="text-[10px] leading-none">→</span>
                </div>
              )}
            </div>
          );
        })}
        {isLoading && <div className="absolute inset-0 pointer-events-none" />}
      </div>
    </div>
  );
};

// caret placement at click point
function placeCaret(el: HTMLElement, clientX: number, clientY: number) {
  const anyDoc = document as any;
  const range =
    anyDoc.caretRangeFromPoint
      ? anyDoc.caretRangeFromPoint(clientX, clientY)
      : anyDoc.caretPositionFromPoint
        ? (() => {
            const pos = anyDoc.caretPositionFromPoint(clientX, clientY);
            if (!pos) return null;
            const r = document.createRange();
            r.setStart(pos.offsetNode, pos.offset);
            r.setEnd(pos.offsetNode, pos.offset);
            return r;
          })()
        : null;

  const sel = window.getSelection();
  if (range && sel) {
    sel.removeAllRanges();
    sel.addRange(range);
    return;
  }

  el.focus();
  sel?.selectAllChildren(el);
  sel?.collapseToEnd();
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default Editor;
