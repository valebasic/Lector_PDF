import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ReaderView({ book, onBack, onUpdateProgress }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!book.pdfUrl) return;

    setLoading(true);
    const loadingTask = pdfjsLib.getDocument(book.pdfUrl);
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
  }, [book.pdfUrl]);

  useEffect(() => {
    if (!pdfDoc) return;

    let isCancelled = false;

    pdfDoc.getPage(currentPage).then((page) => {
      if (isCancelled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: (zoom / 100) * 1.2 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      page.render(renderContext);
    });

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, zoom]);

  // Cambiar de página y actualizar el porcentaje automáticamente
  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      
      // Calcular porcentaje de avance
      const calculatedProgress = Math.round((newPage / totalPages) * 100);
      if (onUpdateProgress) {
        onUpdateProgress(book.id, calculatedProgress);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f9f6f0] text-[#4a4033] font-sans select-none overflow-hidden">
      <header className="flex justify-between items-center px-8 py-4 bg-[#f3efe6] border-b border-[#e6decb] shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-[#e6dbcc] hover:bg-[#d8ccbc] text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>←</span> Volver a la biblioteca
          </button>
          <div>
            <h2 className="text-base font-bold text-[#3d3326] line-clamp-1">{book.title}</h2>
            <p className="text-xs text-[#7c7161]">{book.author || 'Autor desconocido'}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-[#faf6f0] px-4 py-2 rounded-2xl border border-[#e6decb]">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="w-8 h-8 rounded-xl bg-[#e6dbcc] hover:bg-[#d8ccbc] disabled:opacity-30 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            >
              ◀
            </button>
            <span className="text-xs font-semibold text-[#3d3326] min-w-[90px] text-center">
              Pág. {currentPage} / {totalPages || 1}
            </span>
            <button 
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="w-8 h-8 rounded-xl bg-[#e6dbcc] hover:bg-[#d8ccbc] disabled:opacity-30 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            >
              ▶
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#e6decb]"></div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 15, 60))}
              className="w-7 h-7 rounded-lg bg-[#e6dbcc] hover:bg-[#d8ccbc] text-xs font-bold transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-medium text-[#7c7161] min-w-[40px] text-center">{zoom}%</span>
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 15, 160))}
              className="w-7 h-7 rounded-lg bg-[#e6dbcc] hover:bg-[#d8ccbc] text-xs font-bold transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-xs font-medium text-[#7c7161]">
          Estado: <span className="text-[#a07855] font-bold">{book.status}</span>
        </div>
      </header>

      <main className="flex-1 p-6 flex justify-center items-center bg-[#f3efe6]/40 overflow-auto">
        {loading ? (
          <div className="text-xs font-semibold text-[#7c7161] animate-pulse">
            Cargando documento... 🍂
          </div>
        ) : book.pdfUrl ? (
          <div className="bg-white p-4 rounded-2xl border border-[#e6decb] shadow-md flex justify-center items-center max-h-full overflow-hidden">
            <canvas ref={canvasRef} className="rounded-lg max-h-[75vh] object-contain shadow-sm" />
          </div>
        ) : (
          <div className="text-center p-10 bg-[#f3efe6] rounded-3xl border border-[#e6decb] max-w-md shadow-sm">
            <span className="text-4xl mb-3 block">📖</span>
            <h3 className="text-lg font-bold text-[#3d3326] mb-2">Documento de ejemplo</h3>
            <p className="text-xs text-[#7c7161] mb-5 leading-relaxed">
              Este libro no tiene un archivo PDF adjunto. Sube uno propio para visualizarlo.
            </p>
            <button 
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39263] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Regresar a la biblioteca
            </button>
          </div>
        )}
      </main>
    </div>
  );
}