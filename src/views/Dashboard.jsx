import React, { useState } from 'react';
import BookCard from '../components/BookCard';
import AddBookModal from '../components/AddBookModal';

export default function Dashboard({ books, onSelectBook, onAddBook, onDeleteBook }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('Todos');

  // Filtrar libros según la categoría seleccionada
  const filteredBooks = books.filter(book => {
    if (currentFilter === 'Leyendo') return book.progress > 0 && book.progress < 100;
    if (currentFilter === 'Terminados') return book.progress === 100;
    return true; // 'Todos'
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#f9f6f0]">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Encabezado con saludo cozy */}
        <div className="bg-[#f3efe6] border border-[#e6decb] p-6 rounded-3xl flex justify-between items-center shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-[#3d3326]">¡Hola, Laura! 🍂</h2>
            <p className="text-xs text-[#7c7161] mt-1">Tu espacio personal para leer, aprender y soñar.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#3d3326] text-[#f9f6f0] px-4 py-2.5 rounded-2xl text-xs font-semibold hover:bg-[#5c5346] transition-colors cursor-pointer shadow-xs"
          >
            + Añadir libro
          </button>
        </div>

        {/* Sección de la biblioteca */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#3d3326]">Mi biblioteca ({books.length}) 🤍</h3>
            <div className="flex gap-2">
              {['Todos', 'Leyendo', 'Terminados'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCurrentFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer ${
                    currentFilter === filter
                      ? 'bg-[#3d3326] text-[#f9f6f0]'
                      : 'bg-[#e6dbcc] text-[#5c5346] hover:bg-[#d8ccbc]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-[#f3efe6] rounded-3xl border border-[#e6decb]">
                <p className="text-xs text-[#7c7161]">No hay libros en esta categoría todavía.</p>
              </div>
            ) : (
              filteredBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onRead={() => onSelectBook(book)} 
                  onDelete={onDeleteBook}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddBookModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)} 
          onAddBook={onAddBook} 
        />
      )}
    </div>
  );
}
