import React from 'react';

export default function ReaderView({ book, onBack }) {
  return (
    <div className="flex flex-col h-screen bg-[#f9f6f0] text-[#4a4033]">
      {/* Barra superior del visor */}
      <header className="flex justify-between items-center px-8 py-4 bg-[#f3efe6] border-b border-[#e6decb] shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-[#e6dbcc] hover:bg-[#d8ccbc] text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <span>←</span> Volver a la biblioteca
          </button>
          <div>
            <h2 className="text-base font-bold text-[#3d3326] line-clamp-1">{book.title}</h2>
            <p className="text-xs text-[#7c7161]">{book.author}</p>
          </div>
        </div>
        <div className="text-xs font-medium text-[#7c7161]">
          Estado: <span className="text-[#a07855] font-bold">{book.status}</span>
        </div>
      </header>

      {/* Área de lectura central */}
      <main className="flex-1 p-6 flex justify-center items-center bg-[#f3efe6]/40 overflow-hidden">
        {book.pdfUrl ? (
          <iframe 
            src={book.pdfUrl} 
            title={book.title}
            className="w-full h-full rounded-2xl border border-[#e6decb] shadow-sm bg-white"
          />
        ) : (
          <div className="text-center p-10 bg-[#f3efe6] rounded-3xl border border-[#e6decb] max-w-md shadow-sm">
            <span className="text-4xl mb-3 block">📖</span>
            <h3 className="text-lg font-bold text-[#3d3326] mb-2">Libro de muestra</h3>
            <p className="text-xs text-[#7c7161] mb-5 leading-relaxed">
              Este es un título de ejemplo precargado. Sube tu propio archivo PDF utilizando el botón "Agregar libro" en el menú principal para visualizarlo aquí en tiempo real.
            </p>
            <button 
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39263] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              Regresar a la biblioteca
            </button>
          </div>
        )}
      </main>
    </div>
  );
}