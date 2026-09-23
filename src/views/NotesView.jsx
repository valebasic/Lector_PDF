import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function NotesView() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*, books(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setNotes(data);
    } catch (error) {
      console.error('Error al cargar notas de la nube:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center text-xs font-semibold text-[#7c7161] animate-pulse">
        Cargando notas desde la nube... ☁️
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#f9f6f0]">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-[#3d3326]">Cuaderno General de Notas</h2>
          <p className="text-xs text-[#7c7161] mt-1">Todas tus reflexiones y apuntes sincronizados en Supabase.</p>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-16 bg-[#f3efe6] rounded-3xl border border-[#e6decb]">
            <span className="text-4xl mb-3 block">📓</span>
            <p className="text-xs text-[#7c7161]">Aún no tienes notas guardadas en la base de datos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-[#f3efe6] border border-[#e6decb] p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold bg-[#e6dbcc] text-[#5c5346] px-2.5 py-1 rounded-lg">
                      Libro: {note.books?.title || 'General'}
                    </span>
                    <span className="ml-2 text-[10px] text-[#7c7161]">Pág. {note.page}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(note.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-[#3d3326] leading-relaxed whitespace-pre-wrap">{note.text}</p>
                <span className="text-[10px] text-[#9c9181] self-end">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
