import React from 'react';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  return (
    <div className="flex bg-black min-h-screen text-zinc-100 font-sans">
      {/* Menú lateral */}
      <Sidebar />

      {/* Contenido principal de la vista */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Biblioteca Personal</h2>
          <p className="text-zinc-400 text-sm mt-1">Explora, lee y gestiona tus documentos favoritos en un entorno inmersivo.</p>
        </header>

        {/* Sección temporal para las tarjetas de libros */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between h-48">
            <div>
              <span className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-[#b48ead] font-medium">Leyendo</span>
              <h3 className="text-lg font-semibold mt-3 text-zinc-200">Ejemplo de Libro o PDF</h3>
            </div>
            <p className="text-xs text-zinc-500">Progreso: 45%</p>
          </div>
        </section>
      </main>
    </div>
  );
}
