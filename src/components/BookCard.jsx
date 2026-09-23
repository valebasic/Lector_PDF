///
/// Componente para mostrar información de un libro en la biblioteca.
/// </summary>
/// <param name="title">Título del libro</param>
/// <param name="progress">Progreso de lectura en porcentaje</param>
/// <param name="status">Estado del libro (por leer, leyendo, etc.)</param>
/// <param name="author">Autor del libro</param>

import React from 'react';

export default function BookCard({ book, onRead, onDelete }) {
  return (
    <div className="bg-[#f3efe6] border border-[#e6decb] p-5 rounded-3xl flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-shadow relative group">
      {/* Botón de eliminar en la esquina superior derecha */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Evita que se abra el libro al hacer clic en eliminar
          if (window.confirm(`¿Seguro que deseas eliminar "${book.title}"?`)) {
            onDelete(book.id);
          }
        }}
        className="absolute top-4 right-4 text-xs text-[#a89f91] hover:text-red-600 font-bold bg-[#faf6f0] border border-[#e6decb] w-7 h-7 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
        title="Eliminar libro"
      >
        ✕
      </button>

      <div className="flex flex-col gap-1 pr-8">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9c9181]">
          {book.status || 'Por leer'}
        </span>
        <h4 className="text-sm font-bold text-[#3d3326] line-clamp-2">{book.title}</h4>
        <p className="text-xs text-[#7c7161]">{book.author || 'Autor desconocido'}</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[11px] text-[#7c7161]">
          <span>Progreso</span>
          <span className="font-semibold">{book.progress || 0}%</span>
        </div>
        <div className="w-full bg-[#e6dbcc] h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#d4a373] h-full transition-all duration-300" 
            style={{ width: `${book.progress || 0}%` }}
          ></div>
        </div>
      </div>

      <button
        onClick={onRead}
        className="w-full py-2.5 rounded-2xl bg-[#d4a373] hover:bg-[#c39263] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer text-center"
      >
        Leer documento 📖
      </button>
    </div>
  );
}
