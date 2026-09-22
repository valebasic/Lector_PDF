/// Componente para agregar un nuevo libro a la biblioteca. BOTON
import React, { useState } from 'react';

export default function AddBookModal({ isOpen, onClose, onAddBook }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      // Si el título está vacío, usamos el nombre del archivo sin la extensión .pdf por comodidad
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setTitle(cleanName);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Creamos una URL temporal local para el archivo PDF seleccionado
    const pdfUrl = pdfFile ? URL.createObjectURL(pdfFile) : null;

    const newBook = {
      id: Date.now(),
      title,
      author: author || 'Autor desconocido',
      progress: 0,
      status: 'Por leer',
      pdfUrl: pdfUrl, // Guardamos la referencia al PDF
      fileName: pdfFile ? pdfFile.name : 'Documento.pdf'
    };

    onAddBook(newBook);
    setTitle('');
    setAuthor('');
    setPdfFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#f3efe6] border border-[#e6decb] rounded-3xl w-full max-w-md p-6 text-[#4a4033] shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#3d3326]">Agregar Nuevo PDF</h3>
          <button 
            onClick={onClose}
            className="text-[#7c7161] hover:text-[#3d3326] text-xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#7c7161] mb-1">Seleccionar archivo PDF</label>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full text-xs text-[#7c7161] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#e6dbcc] file:text-[#3d3326] hover:file:bg-[#d8ccbc] transition-all cursor-pointer bg-[#faf6f0] border border-[#e6decb] rounded-xl p-2"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7c7161] mb-1">Título del Libro o Documento</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Introducción a la Ingeniería..." 
              className="w-full bg-[#faf6f0] border border-[#e6decb] rounded-xl px-4 py-3 text-sm text-[#3d3326] focus:outline-none focus:border-[#d4a373] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7c7161] mb-1">Autor (Opcional)</label>
            <input 
              type="text" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ej. Autor o profesor" 
              className="w-full bg-[#faf6f0] border border-[#e6decb] rounded-xl px-4 py-3 text-sm text-[#3d3326] focus:outline-none focus:border-[#d4a373] transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#e6dbcc] hover:bg-[#d8ccbc] text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39263] text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Guardar PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
