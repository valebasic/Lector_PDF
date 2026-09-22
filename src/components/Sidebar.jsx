import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#f3efe6] border-r border-[#e6decb] flex flex-col justify-between p-6 text-[#5c5346] shadow-sm">
      {/* Sección Superior: Logo y Navegación */}
      <div>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 rounded-xl bg-[#e6dbcc] flex items-center justify-center text-[#4a4033] shadow-sm">
            <span className="text-lg">📚</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide text-[#3d3326]">
            LectorPDF
          </h1>
        </div>

        <nav className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold tracking-wider text-[#9e917d] uppercase px-4 mb-1">Menú</span>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#e6dbcc]/60 text-[#3d3326] font-semibold transition-all">
            <span>🏠</span> Biblioteca
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#e6dbcc]/30 text-[#6e6252] transition-all">
            <span>📖</span> Leyendo
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#e6dbcc]/30 text-[#6e6252] transition-all">
            <span>⏳</span> Por leer
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#e6dbcc]/30 text-[#6e6252] transition-all">
            <span>✅</span> Terminados
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#e6dbcc]/30 text-[#6e6252] transition-all">
            <span>📝</span> Notas
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#e6dbcc]/30 text-[#6e6252] transition-all">
            <span>⭐</span> Favoritos
          </a>
        </nav>
      </div>

      {/* Sección Inferior: Perfil de Usuario tipo tarjeta */}
      <div className="p-3 rounded-2xl bg-[#eef5e9] border border-[#d6ebd0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#c8e6c9] flex items-center justify-center font-bold text-[#2e7d32]">
            LB
          </div>
          <div>
            <p className="text-xs font-bold text-[#2e7d32]">Laura B.</p>
            <p className="text-[10px] text-[#558b2f]">Amante de los libros</p>
          </div>
        </div>
      </div>
    </aside>
  );
}