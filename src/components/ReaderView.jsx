import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import BookIndexModal from './BookIndexModal';
import { supabase } from '../supabaseClient';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// --- Helpers de almacenamiento local (respaldo) ---
const loadFromStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Error al guardar en localStorage', e);
    return false;
  }
};

export default function ReaderView({ book, onBack, onUpdateProgress }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [showIndex, setShowIndex] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showHighlights, setShowHighlights] = useState(true);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });

  const bookKey = book?.id || encodeURIComponent(book?.title || 'default_book');

  // Notas (Sincronizadas con Supabase + Respaldo local), Subrayados y Marcadores
  const [notes, setNotes] = useState([]);
  const [highlights, setHighlights] = useState(() => loadFromStorage(`lector_pdf_highlights_${bookKey}`, []));
  const [bookmarks, setBookmarks] = useState(() => loadFromStorage(`lector_pdf_bookmarks_${bookKey}`, []));

  // Índice nativo del PDF
  const [outline, setOutline] = useState([]);
  const [outlineLoading, setOutlineLoading] = useState(true);

  const [currentNoteText, setCurrentNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#fef08a');

  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const containerRef = useRef(null);

  // --- Validación de Racha de Lectura Real ---
  const registrarActividadLectura = () => {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem('lector_last_active_date');
    let currentStreak = Number(localStorage.getItem('lector_reading_streak') || 1);

    if (lastActive !== today) {
      if (lastActive) {
        const lastDate = new Date(lastActive);
        const diffTime = Math.abs(new Date(today) - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1; // Incrementa la racha si leyó ayer y hoy avanzó página
        } else if (diffDays > 1) {
          currentStreak = 1; // Se reinicia si dejó pasar más de un día sin leer
        }
      } else {
        currentStreak = 1;
      }
      localStorage.setItem('lector_reading_streak', currentStreak);
      localStorage.setItem('lector_last_active_date', today);
    }
  };

  // Cargar notas desde Supabase o almacenamiento local si cambia el libro
  useEffect(() => {
    const fetchNotes = async () => {
      if (book?.id && !book.id.toString().startsWith('default')) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('book_id', book.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setNotes(data);
          return;
        }
      }
      setNotes(loadFromStorage(`lector_pdf_notes_${bookKey}`, []));
    };

    fetchNotes();
    setHighlights(loadFromStorage(`lector_pdf_highlights_${bookKey}`, []));
    setBookmarks(loadFromStorage(`lector_pdf_bookmarks_${bookKey}`, []));
  }, [bookKey, book?.id]);

  useEffect(() => {
    const source = book?.pdfUrl || book?.url;
    if (!source) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const loadingTask = pdfjsLib.getDocument(source);
    loadingTask.promise.then(
      (doc) => {
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      },
      (error) => {
        console.error('Error al cargar el PDF:', error);
        setLoading(false);
      }
    );
  }, [book]);

  // Extraer el índice nativo del PDF
  useEffect(() => {
    if (!pdfDoc) {
      setOutline([]);
      return;
    }

    let isCancelled = false;
    setOutlineLoading(true);

    const resolveItem = async (item) => {
      let page = null;
      try {
        let dest = item.dest;
        if (typeof dest === 'string') {
          dest = await pdfDoc.getDestination(dest);
        }
        if (dest && dest[0] != null) {
          const pageIndex = await pdfDoc.getPageIndex(dest[0]);
          page = pageIndex + 1;
        }
      } catch (e) {
        page = null;
      }

      const children = item.items && item.items.length > 0
        ? await Promise.all(item.items.map(resolveItem))
        : [];

      return { title: item.title, page, items: children };
    };

    pdfDoc.getOutline()
      .then(async (rawOutline) => {
        if (isCancelled) return;
        if (!rawOutline || rawOutline.length === 0) {
          setOutline([]);
          setOutlineLoading(false);
          return;
        }
        const resolved = await Promise.all(rawOutline.map(resolveItem));
        if (isCancelled) return;
        setOutline(resolved);
        setOutlineLoading(false);
      })
      .catch(() => {
        if (isCancelled) return;
        setOutline([]);
        setOutlineLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc]);

  // Renderizado de página y capa de texto
  useEffect(() => {
    if (!pdfDoc) return;
    let isCancelled = false;
    let renderTask = null;
    let textLayerTask = null;

    pdfDoc.getPage(currentPage).then((page) => {
      if (isCancelled) return;
      const canvas = canvasRef.current;
      const textLayerDiv = textLayerRef.current;
      if (!canvas || !textLayerDiv) return;
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: (zoom / 100) * 1.2 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      setPageDimensions({ width: viewport.width, height: viewport.height });

      textLayerDiv.innerHTML = '';
      textLayerDiv.style.width = `${viewport.width}px`;
      textLayerDiv.style.height = `${viewport.height}px`;

      renderTask = page.render({ canvasContext: context, viewport });
      renderTask.promise.catch(() => {});

      page.getTextContent().then((textContent) => {
        if (isCancelled) return;
        if (typeof pdfjsLib.renderTextLayer === 'function') {
          textLayerTask = pdfjsLib.renderTextLayer({
            textContentSource: textContent,
            container: textLayerDiv,
            viewport,
            textDivs: []
          });
          textLayerTask.promise?.catch(() => {});
        }
      });
    });

    return () => {
      isCancelled = true;
      renderTask?.cancel?.();
      textLayerTask?.cancel?.();
    };
  }, [pdfDoc, currentPage, zoom]);

  const changePage = (newPage) => {
    const maxPages = totalPages > 0 ? totalPages : 1;
    if (newPage >= 1 && newPage <= maxPages) {
      setCurrentPage(newPage);
      
      // Valida y suma racha de estudio al avanzar de página de forma activa
      registrarActividadLectura();

      const calculatedProgress = Math.round((newPage / maxPages) * 100);
      if (onUpdateProgress && book?.id) {
        onUpdateProgress(book.id, calculatedProgress);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        changePage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        changePage(currentPage - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // --- Notas con Supabase ---
  const handleAddNote = async () => {
    if (!currentNoteText.trim()) return;

    // Registrar actividad en la racha también al guardar notas
    registrarActividadLectura();

    const newNotePayload = {
      book_id: book?.id && !book.id.toString().startsWith('default') ? book.id : null,
      page: currentPage,
      text: currentNoteText.trim(),
      color: selectedColor
    };

    if (newNotePayload.book_id) {
      const { data, error } = await supabase
        .from('notes')
        .insert([newNotePayload])
        .select();

      if (!error && data) {
        setNotes([data[0], ...notes]);
      } else {
        console.error('Error al guardar nota en Supabase:', error);
      }
    } else {
      const localNote = { id: Date.now(), date: new Date().toLocaleDateString(), ...newNotePayload };
      const updated = [localNote, ...notes];
      setNotes(updated);
      saveToStorage(`lector_pdf_notes_${bookKey}`, updated);
    }

    setCurrentNoteText('');
  };

  const handleDeleteNote = async (id) => {
    if (book?.id && !book.id.toString().startsWith('default')) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (!error) {
        setNotes(notes.filter((n) => n.id !== id));
      }
    } else {
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      saveToStorage(`lector_pdf_notes_${bookKey}`, updated);
    }
  };

  // --- Subrayados ---
  const handleTextLayerMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
    const text = selection.toString().trim();
    if (!text) return;

    const containerEl = containerRef.current;
    if (!containerEl) return;
    const containerRect = containerEl.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) return;

    const range = selection.getRangeAt(0);
    const clientRects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
    if (clientRects.length === 0) return;

    const rects = clientRects.map((r) => ({
      left: (r.left - containerRect.left) / containerRect.width,
      top: (r.top - containerRect.top) / containerRect.height,
      width: r.width / containerRect.width,
      height: r.height / containerRect.height
    }));

    const newHighlight = {
      id: Date.now(),
      page: currentPage,
      text,
      color: selectedColor,
      rects
    };

    const updated = [newHighlight, ...highlights];
    setHighlights(updated);
    saveToStorage(`lector_pdf_highlights_${bookKey}`, updated);
    selection.removeAllRanges();
  };

  const handleDeleteHighlight = (id) => {
    const updated = highlights.filter((h) => h.id !== id);
    setHighlights(updated);
    saveToStorage(`lector_pdf_highlights_${bookKey}`, updated);
  };

  // --- Marcadores manuales ---
  const handleAddBookmark = (title) => {
    const label = (title && title.trim()) || `Página ${currentPage}`;
    const newBookmark = { id: Date.now(), title: label, page: currentPage };
    const updated = [...bookmarks, newBookmark].sort((a, b) => a.page - b.page);
    setBookmarks(updated);
    saveToStorage(`lector_pdf_bookmarks_${bookKey}`, updated);
  };

  const handleDeleteBookmark = (id) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    saveToStorage(`lector_pdf_bookmarks_${bookKey}`, updated);
  };

  const currentPageHighlights = highlights.filter((h) => h.page === currentPage);
  const sortedHighlights = [...highlights].sort((a, b) => a.page - b.page);

  return (
    <div className="flex flex-col h-screen bg-[#f9f6f0] text-[#4a4033] font-sans select-none overflow-hidden">
      <style>{`
        .lector-text-layer {
          line-height: 1;
          overflow: hidden;
        }
        .lector-text-layer span,
        .lector-text-layer br {
          color: transparent;
          position: absolute;
          white-space: pre;
          cursor: text;
          transform-origin: 0% 0%;
        }
        .lector-text-layer ::selection {
          background: rgba(212, 163, 115, 0.35);
        }
      `}</style>

      {/* Barra superior */}
      <header className="flex justify-between items-center px-6 py-3 bg-[#f3efe6] border-b border-[#e6decb] shadow-xs flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-[#e6dbcc] hover:bg-[#d8ccbc] text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>←</span> Mi biblioteca
          </button>
          <span className="text-xs text-[#7c7161]">/</span>
          <span className="text-xs font-bold text-[#3d3326] truncate max-w-[300px]">{book?.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHighlights(!showHighlights)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${showHighlights ? 'bg-[#e6dbcc] border-[#d8ccbc]' : 'bg-transparent border-[#e6decb]'}`}
          >
            🎨 Subrayados ({highlights.length})
          </button>
          <button 
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${showNotes ? 'bg-[#e6dbcc] border-[#d8ccbc]' : 'bg-transparent border-[#e6decb]'}`}
          >
            📓 Cuaderno ({notes.length})
          </button>
        </div>
      </header>

      {/* Área central */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Panel izquierdo: Subrayados y Colores */}
        {showHighlights && (
          <aside className="w-72 bg-[#f3efe6]/70 border-r border-[#e6decb] p-4 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c7161]">Paleta de Subrayado</h3>
            <div className="flex gap-3">
              {[
                { color: '#efbb4b', border: 'border-yellow-300' },
                { color: '#87A6BD', border: 'border-green-300' },
                { color: '#c6b3d0', border: 'border-blue-300' },
                { color: '#c1b177', border: 'border-pink-300' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(item.color)}
                  style={{ backgroundColor: item.color }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${selectedColor === item.color ? 'scale-125 shadow-sm border-[#3d3326]' : item.border}`}
                ></button>
              ))}
            </div>
            <div className="text-[11px] text-[#7c7161] bg-[#faf6f0] p-3 rounded-xl border border-[#e6decb] leading-relaxed">
              Selecciona texto en el documento para subrayarlo con este color.
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c7161] mt-2">Mis subrayados</h3>
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[40vh]">
              {sortedHighlights.length === 0 ? (
                <p className="text-[11px] text-[#8c8171] text-center italic py-4">Aún no has subrayado nada.</p>
              ) : (
                sortedHighlights.map((h) => (
                  <div key={h.id} className="bg-[#faf6f0] border border-[#e6decb] p-3 rounded-xl flex flex-col gap-1.5 shadow-xs">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => changePage(h.page)}
                        title="Ir a esta página"
                        className="text-[10px] font-bold bg-[#e6dbcc] text-[#5c5346] px-2 py-0.5 rounded-md cursor-pointer hover:bg-[#d8ccbc]"
                      >
                        Pág. {h.page}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: h.color }}></span>
                        <button
                          onClick={() => handleDeleteHighlight(h.id)}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#3d3326] leading-relaxed line-clamp-3">"{h.text}"</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Visor central de PDF */}
        <main className="flex-1 p-6 flex justify-center items-start bg-[#f3efe6]/30 overflow-auto relative">
          {loading ? (
            <div className="text-xs font-semibold text-[#7c7161] animate-pulse">Cargando documento... 🍂</div>
          ) : (book?.pdfUrl || book?.url) ? (
            <div className="bg-white p-4 rounded-2xl border border-[#e6decb] shadow-md inline-block">
              <div
                ref={containerRef}
                className="relative select-text"
                style={{ width: pageDimensions.width || undefined, height: pageDimensions.height || undefined }}
              >
                <canvas ref={canvasRef} className="rounded-lg shadow-sm block" />
                <div
                  ref={textLayerRef}
                  onMouseUp={handleTextLayerMouseUp}
                  className="lector-text-layer absolute inset-0"
                />
                {showHighlights && currentPageHighlights.map((h) => (
                  <React.Fragment key={h.id}>
                    {h.rects.map((r, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'absolute',
                          left: `${r.left * 100}%`,
                          top: `${r.top * 100}%`,
                          width: `${r.width * 100}%`,
                          height: `${r.height * 100}%`,
                          backgroundColor: h.color,
                          opacity: 0.45,
                          mixBlendMode: 'multiply',
                          pointerEvents: 'none'
                        }}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-10 bg-[#f3efe6] rounded-3xl border border-[#e6decb] max-w-md shadow-sm">
              <span className="text-4xl mb-3 block">📖</span>
              <h3 className="text-lg font-bold text-[#3d3326] mb-2">Sin archivo adjunto</h3>
              <p className="text-xs text-[#7c7161] mb-5">Este libro de ejemplo no contiene un PDF vinculado.</p>
              <button onClick={onBack} className="px-5 py-2.5 rounded-xl bg-[#d4a373] text-white text-xs font-semibold cursor-pointer">
                Regresar a la biblioteca
              </button>
            </div>
          )}
        </main>

        {/* Panel derecho: Notas y Cuaderno en la nube */}
        {showNotes && (
          <aside className="w-80 bg-[#f3efe6]/70 border-l border-[#e6decb] p-4 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
            <div className="flex justify-between items-center border-b border-[#e6decb] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c7161]">Notas en la nube</h3>
              <span className="text-[10px] bg-[#e6dbcc] px-2 py-0.5 rounded-md font-medium text-[#5c5346]">Pág. {currentPage}</span>
            </div>

            <div className="flex flex-col gap-2">
              <textarea 
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="Escribe tus notas o reflexiones aquí..."
                className="w-full h-28 bg-[#faf6f0] border border-[#e6decb] rounded-xl p-3 text-xs text-[#3d3326] focus:outline-none focus:border-[#d4a373] resize-none shadow-inner"
              ></textarea>
              <button 
                onClick={handleAddNote}
                className="w-full py-2 bg-[#d4a373] hover:bg-[#c39263] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                + Guardar nota
              </button>
            </div>

            {/* Listado de notas */}
            <div className="flex flex-col gap-2.5 mt-2 overflow-y-auto max-h-[45vh]">
              {notes.length === 0 ? (
                <p className="text-[11px] text-[#8c8171] text-center italic py-4">No hay notas guardadas todavía.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-[#faf6f0] border border-[#e6decb] p-3 rounded-xl flex flex-col gap-1.5 shadow-xs relative group">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => changePage(note.page)}
                        title="Ir a esta página"
                        className="text-[10px] font-bold bg-[#e6dbcc] text-[#5c5346] px-2 py-0.5 rounded-md cursor-pointer hover:bg-[#d8ccbc]"
                      >
                        Pág. {note.page}
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-[#3d3326] whitespace-pre-wrap leading-relaxed">{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Barra inferior */}
      <footer className="flex justify-center items-center py-3 bg-[#f3efe6] border-t border-[#e6decb] shadow-sm flex-shrink-0">
        <div className="flex items-center gap-6 bg-[#faf6f0] px-5 py-2 rounded-2xl border border-[#e6decb] shadow-xs">
          <button 
            onClick={() => setShowIndex(true)}
            className="px-3 py-1.5 rounded-xl bg-[#e6dbcc] hover:bg-[#d8ccbc] text-xs font-semibold text-[#3d3326] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>☰</span> Índice del libro
          </button>

          <div className="h-4 w-[1px] bg-[#e6decb]"></div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7c7161]">Página</span>
            <input 
              type="number" 
              value={currentPage}
              onChange={(e) => changePage(Number(e.target.value))}
              className="w-12 text-center bg-white border border-[#e6decb] rounded-lg py-1 text-xs font-bold text-[#3d3326] focus:outline-none"
            />
            <span className="text-xs text-[#7c7161]">de {totalPages || 1}</span>
          </div>

          <div className="h-4 w-[1px] bg-[#e6decb]"></div>

          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(prev => Math.max(prev - 15, 60))} className="w-7 h-7 rounded-lg bg-[#e6dbcc] hover:bg-[#d8ccbc] text-xs font-bold cursor-pointer">-</button>
            <span className="text-xs font-medium text-[#3d3326] min-w-[40px] text-center">{zoom}%</span>
            <button onClick={() => setZoom(prev => Math.min(prev + 15, 160))} className="w-7 h-7 rounded-lg bg-[#e6dbcc] hover:bg-[#d8ccbc] text-xs font-bold cursor-pointer">+</button>
          </div>
        </div>
      </footer>

      <BookIndexModal 
        isOpen={showIndex}
        onClose={() => setShowIndex(false)}
        onSelectPage={(page) => changePage(page)}
        bookTitle={book?.title}
        currentPage={currentPage}
        outline={outline}
        outlineLoading={outlineLoading}
        bookmarks={bookmarks}
        onAddBookmark={handleAddBookmark}
        onDeleteBookmark={handleDeleteBookmark}
      />
    </div>
  );
}