import React, { useState } from 'react';

function OutlineItem({ item, onJump, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = item.items && item.items.length > 0;

  return (
    <div>
      <div className="flex items-center gap-1.5 py-1.5" style={{ paddingLeft: depth * 14 }}>
        {hasChildren ? (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-[10px] w-4 text-[#7c7161] cursor-pointer flex-shrink-0"
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}
        <button
          onClick={() => item.page && onJump(item.page)}
          disabled={!item.page}
          className={`text-left text-xs flex-1 truncate ${
            item.page
              ? 'text-[#3d3326] hover:text-[#d4a373] cursor-pointer'
              : 'text-[#a89f8e] cursor-default'
          }`}
        >
          {item.title}
        </button>
        {item.page && <span className="text-[10px] text-[#a89f8e] flex-shrink-0">{item.page}</span>}
      </div>
      {hasChildren && expanded && (
        <div>
          {item.items.map((child, i) => (
            <OutlineItem key={i} item={child} onJump={onJump} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookIndexModal({
  isOpen,
  onClose,
  onSelectPage,
  bookTitle,
  currentPage,
  outline = [],
  outlineLoading = false,
  bookmarks = [],
  onAddBookmark,
  onDeleteBookmark
}) {
  const [bookmarkLabel, setBookmarkLabel] = useState('');

  if (!isOpen) return null;

  const jump = (page) => {
    onSelectPage(page);
    onClose();
  };

  const hasOutline = outline && outline.length > 0;

  const handleAddBookmark = () => {
    onAddBookmark?.(bookmarkLabel);
    setBookmarkLabel('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#f9f6f0] w-full max-w-md max-h-[80vh] rounded-2xl border border-[#e6decb] shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#e6decb] flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#3d3326] truncate">Índice del libro</h2>
            {bookTitle && <p className="text-[11px] text-[#7c7161] truncate">{bookTitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#7c7161] hover:text-[#3d3326] text-sm font-bold cursor-pointer flex-shrink-0 ml-3"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {outlineLoading ? (
            <p className="text-[11px] text-[#8c8171] text-center italic py-6 animate-pulse">
              Cargando índice...
            </p>
          ) : hasOutline ? (
            <div className="flex flex-col">
              {outline.map((item, i) => (
                <OutlineItem key={i} item={item} onJump={jump} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-[11px] text-[#8c8171] leading-relaxed">
                Este PDF no incluye un índice incorporado. Puedes crear tus propios marcadores
                mientras lees.
              </p>

              <div className="flex gap-2">
                <input
                  value={bookmarkLabel}
                  onChange={(e) => setBookmarkLabel(e.target.value)}
                  placeholder={`Marcador en pág. ${currentPage}`}
                  className="flex-1 min-w-0 bg-[#faf6f0] border border-[#e6decb] rounded-xl px-3 py-2 text-xs text-[#3d3326] focus:outline-none focus:border-[#d4a373]"
                />
                <button
                  onClick={handleAddBookmark}
                  className="px-3 py-2 bg-[#d4a373] hover:bg-[#c39263] text-white rounded-xl text-xs font-semibold cursor-pointer flex-shrink-0"
                >
                  + Marcar
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {bookmarks.length === 0 ? (
                  <p className="text-[11px] text-[#8c8171] text-center italic py-3">
                    No has agregado marcadores todavía.
                  </p>
                ) : (
                  bookmarks.map((b) => (
                    <div
                      key={b.id}
                      className="flex justify-between items-center bg-[#faf6f0] border border-[#e6decb] rounded-xl px-3 py-2"
                    >
                      <button
                        onClick={() => jump(b.page)}
                        className="text-xs text-left text-[#3d3326] hover:text-[#d4a373] flex-1 truncate cursor-pointer"
                      >
                        {b.title}
                      </button>
                      <span className="text-[10px] text-[#a89f8e] mx-2 flex-shrink-0">{b.page}</span>
                      <button
                        onClick={() => onDeleteBookmark?.(b.id)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}