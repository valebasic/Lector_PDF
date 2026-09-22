import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-black border-r border-zinc-800 flex flex-col justify-between p-6 text-zinc-300">
      {/* Sección Superior: Logo y Navegación */}
      <div>
        <div className="flex items-center gap-3 mb-10">
          <span className="text-2xl">📚</span>
          <h1 className="text-xl font-bold tracking-wide text-zinc-100">LectorPDF</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 text-[#b48ead] font-medium transition-colors">
            <span>📖</span> Leyendo
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900/60 hover:text-zinc-100 transition-colors">
            <span>⏳</span> Por leer
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900/60 hover:text-zinc-100 transition-colors">
            <span>✅</span> Terminados
          </a>
        </nav>
      </div>

      {/* Sección Inferior: Alerta o Estado de Racha */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
        <p className="text-xs text-zinc-400 mb-1">Racha de lectura</p>
        <p className="text-sm font-semibold text-[#ebcb8b]">🔥 ¡Vas muy bien!</p>
      </div>
    </aside>
  );
}
