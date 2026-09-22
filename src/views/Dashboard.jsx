import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import BookCard from '../components/BookCard';
import AddBookModal from '../components/AddBookModal';
import ReaderView from '../components/ReaderView';

export default function Dashboard() {
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem('lector_pdf_books');
    if (savedBooks) {
      try {
        return JSON.parse(savedBooks);
      } catch (e) {
        console.error("Error al leer localStorage", e);
      }
    }
    return [
      { id: 1, title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', progress: 65, status: 'Leyendo' },
      { id: 2, title: 'Arquitectura Limpia: Guía para el diseño y desarrollo software', author: 'Robert C. Martin', progress: 30, status: 'Leyendo' },
      { id: 3, title: 'Ingeniería de Software (Pressman 7ota Ed.)', author: 'Roger S. Pressman', progress: 10, status: 'Por leer' },
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBook, setActiveBook] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState(''); // Estado para la barra de búsqueda

  useEffect(() => {
    localStorage.setItem('lector_pdf_books', JSON.stringify(books));
  }, [books]);

  const handleAddBook = (newBook) => {
    setBooks([newBook, ...books]);
  };

  // Filtrar libros por categoría y por texto de búsqueda
  const filteredBooks = books.filter((book) => {
    const matchesCategory = currentFilter === 'Todos' || book.status === currentFilter;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (activeBook) {
    return <ReaderView book={activeBook} onBack={() => setActiveBook(null)} />;
  }

  return (
    <div className="flex bg-[#f9f6f0] min-h-screen text-[#4a4033] font-sans">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        {/* Cabecera con barra de búsqueda funcional */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-[#f3efe6] p-6 rounded-3xl border border-[#e6decb]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#3d3326] flex items-center gap-2">
              ¡Hola, Laura! <span>🍂</span>
            </h2>
            <p className="text-[#7c7161] text-xs mt-1">Tu espacio personal para leer, aprender y soñar.</p>
          </div>

          {/* Input de Búsqueda */}
          <div className="w-full md:w-72 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7c7161]">🔍</span>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar libros, autores..."
              className="w-full bg-[#faf6f0] border border-[#e6decb] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#3d3326] focus:outline-none focus:border-[#d4a373] transition-colors shadow-sm"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#d4a373] hover:bg-[#c39263] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
          >
            <span>➕</span> Agregar libro
          </button>
        </header>

        {/* Sección de Mi Biblioteca con pestañas de filtro */}
        <section className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#3d3326] flex items-center gap-2">
            Mi biblioteca ({filteredBooks.length}) <span>♡</span>
          </h3>
          
          <div className="flex gap-2 bg-[#f3efe6] p-1.5 rounded-2xl border border-[#e6decb]">
            {['Todos', 'Leyendo', 'Por leer', 'Terminados'].map((filter) => (
              <button
                key={filter}
                onClick={() => setCurrentFilter(filter)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentFilter === filter 
                    ? 'bg-[#d4a373] text-white shadow-sm' 
                    : 'text-[#7c7161] hover:text-[#3d3326]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Cuadrícula de libros filtrados */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book}
                onRead={(selectedBook) => setActiveBook(selectedBook)} 
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-[#f3efe6] rounded-3xl border border-[#e6decb]">
              <p className="text-sm text-[#7c7161]">No se encontraron libros que coincidan con tu búsqueda.</p>
            </div>
          )}
        </section>
      </main>

      <AddBookModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddBook={handleAddBook} 
      />
    </div>
  );
}