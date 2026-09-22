import React from 'react';
import Sidebar from '../components/Sidebar';
import BookCard from '../components/BookCard';

export default function Dashboard() {
  // Lista temporal de ejemplo para simular tus lecturas
  const sampleBooks = [
    { id: 1, title: 'Clean Code: A Handbook of Agile Software Craftsmanship', progress: 65, status: 'Leyendo' },
    { id: 2, title: 'Arquitectura Limpia: Guía para el diseño y desarrollo software', progress: 30, status: 'Leyendo' },
    { id: 3, title: 'Ingeniería de Software (Pressman 7ota Ed.)', progress: 10, status: 'Por leer' },
  ];

  return (
    <div className="flex bg-black min-h-screen text-zinc-100 font-sans">
      {/* Menú lateral */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Biblioteca Personal</h2>
          <p className="text-zinc-400 text-sm mt-1">Explora, lee y gestiona tus documentos favoritos en un entorno inmersivo.</p>
        </header>

        {/* Cuadrícula de libros */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleBooks.map((book) => (
            <BookCard 
              key={book.id} 
              title={book.title} 
              progress={book.progress} 
              status={book.status} 
            />
          ))}
        </section>
      </main>
    </div>
  );
}
