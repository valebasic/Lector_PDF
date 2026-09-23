import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Dashboard from './views/Dashboard';
import ReaderView from './components/ReaderView';
import NotesView from './views/NotesView';
import Sidebar from './components/Sidebar';

export default function App() {
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentView, setCurrentView] = useState('library'); // 'library' o 'notes'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Mapeamos para asegurarnos de que pdfUrl exista para el visor
        const formattedBooks = data.map(b => ({
          ...b,
          pdfUrl: b.pdfUrl || b.pdf_url
        }));
        setBooks(formattedBooks);
      } else {
        setBooks([
          {
            id: '1',
            title: 'Introducción a la Ingeniería de Sistemas',
            author: 'Universidad de Cundinamarca',
            progress: 0,
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          }
        ]);
      }
    } catch (error) {
      console.error('Error al cargar libros desde Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (bookId, newProgress) => {
    setBooks(prevBooks => 
      prevBooks.map(b => b.id === bookId ? { ...b, progress: newProgress } : b)
    );

    if (bookId && !bookId.toString().startsWith('default')) {
      const { error } = await supabase
        .from('books')
        .update({ progress: newProgress })
        .eq('id', bookId);

      if (error) {
        console.error('Error al actualizar progreso en la nube:', error);
      }
    }
  };

  const handleAddBook = async (newBookData) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([
          {
            title: newBookData.title,
            author: newBookData.author || 'Autor desconocido',
            pdf_url: newBookData.pdfUrl || newBookData.url,
            progress: 0
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Aseguramos que el libro recién agregado tenga la propiedad pdfUrl lista
        const newBookFormatted = {
          ...data[0],
          pdfUrl: data[0].pdfUrl || data[0].pdf_url
        };
        setBooks([newBookFormatted, ...books]);
      }
    } catch (error) {
      console.error('Error al guardar el libro en Supabase:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f9f6f0] text-[#7c7161] font-sans text-xs font-semibold animate-pulse">
        Conectando con la nube de Supabase... ☁️🍂
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f9f6f0] overflow-hidden">
      {currentBook ? (
        <div className="flex-1">
          <ReaderView 
            book={currentBook} 
            onBack={() => setCurrentBook(null)}
            onUpdateProgress={handleUpdateProgress}
          />
        </div>
      ) : (
        <>
          {/* Sidebar fijo a la izquierda que controla las vistas principales */}
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />

          {/* Contenido principal que cambia según la opción seleccionada */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {currentView === 'library' && (
              <Dashboard 
                books={books} 
                onSelectBook={(book) => setCurrentBook(book)}
                onAddBook={handleAddBook}
              />
            )}
            {currentView === 'notes' && (
  <NotesView 
    onSelectBookAndPage={(book, page) => {
      // Aseguramos el formato del enlace del PDF
      const formattedBook = {
        ...book,
        pdfUrl: book.pdfUrl || book.pdf_url
      };
      setCurrentBook(formattedBook);
      setCurrentView('library'); // Regresa a la vista del lector con el libro abierto
      // Opcional: puedes pasar la página inicial si tu lector lo soporta
    }}
  />
)}
          </main>
        </>
      )}
    </div>
  );
}