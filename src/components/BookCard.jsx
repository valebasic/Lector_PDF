///
/// Componente para mostrar información de un libro en la biblioteca.
/// </summary>
/// <param name="title">Título del libro</param>
/// <param name="progress">Progreso de lectura en porcentaje</param>
/// <param name="status">Estado del libro (por leer, leyendo, etc.)</param>
/// <param name="author">Autor del libro</param>

import React from 'react';

export default function BookCard({ book, onRead }) {
  return (
    <div className="p-5 rounded-2xl bg-[#faf6f0] border border-[#e6decb] hover:shadow-md transition-all flex flex-col justify-between h-56 group">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
            book.status === 'Leyendo' ? 'bg-[#fff3e0] text-[#ef6c00]' : 'bg-[#e8f5e9] text-[#2e7d32]'
          }`}>
            {book.status}
          </span>
          <span className="text-xs font-medium text-[#8c8273]">{book.progress}%</span>
        </div>
        <h3 className="text-base font-bold text-[#3d3326] group-hover:text-[#a07855] transition-colors line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-[#7c7161] mt-1">{book.author}</p>
      </div>

      <div>
        {/* Barra de progreso estilo papel */}
        <div className="w-full bg-[#e6decb] h-2 rounded-full overflow-hidden mb-4">
          <div 
            className="bg-[#d4a373] h-full rounded-full transition-all duration-500" 
            style={{ width: `${book.progress}%` }}
          ></div>
        </div>
        
        <button 
          onClick={() => onRead(book)}
          className="w-full py-2 rounded-xl bg-[#eef2ed] hover:bg-[#e2e8df] text-[#3d3326] text-xs font-semibold transition-colors"
        >
          Continuar leyendo
        </button>
      </div>
    </div>
  );
}
