import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Sidebar({ currentView, onViewChange }) {
  const [streak, setStreak] = useState(1);

  // Calcular o cargar racha de lectura
  useEffect(() => {
    const lastActive = localStorage.getItem('lector_last_active_date');
    const today = new Date().toDateString();
    let currentStreak = Number(localStorage.getItem('lector_reading_streak') || 1);

    if (lastActive !== today) {
      if (lastActive) {
        const lastDate = new Date(lastActive);
        const diffTime = Math.abs(new Date(today) - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1; // Incrementa la racha si leyó ayer
        } else if (diffDays > 1) {
          currentStreak = 1; // Reinicia si pasó más de un día
        }
      }
      localStorage.setItem('lector_reading_streak', currentStreak);
      localStorage.setItem('lector_last_active_date', today);
    }
    setStreak(currentStreak);
  }, []);

  return (
    <aside className="w-64 bg-[#f3efe6] border-r border-[#e6decb] p-6 flex flex-col justify-between flex-shrink-0 select-none">
      <div className="flex flex-col gap-6">
        {/* Logo / Título */}
        <div className="flex items-center gap-3 px-2">
          <span className="text-2xl">🍂</span>
          <div>
            <h1 className="text-sm font-bold text-[#3d3326]">Lector Cozy</h1>
            <p className="text-[10px] text-[#7c7161]">Estudio & Lectura</p>
          </div>
        </div>

        {/* Menú de navegación */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9c9181] px-3 mb-1">Menú</span>
          
          <button
            onClick={() => onViewChange('library')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              currentView === 'library'
                ? 'bg-[#e6dbcc] text-[#3d3326] shadow-xs'
                : 'text-[#7c7161] hover:bg-[#eae3d5] hover:text-[#3d3326]'
            }`}
          >
            <span>🏠</span> Biblioteca
          </button>

          <button
            onClick={() => onViewChange('notes')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              currentView === 'notes'
                ? 'bg-[#e6dbcc] text-[#3d3326] shadow-xs'
                : 'text-[#7c7161] hover:bg-[#eae3d5] hover:text-[#3d3326]'
            }`}
          >
            <span>📓</span> Notas en la nube
          </button>
        </div>
      </div>

      {/* Widget de Racha de Lectura */}
      <div className="bg-[#faf6f0] border border-[#e6decb] p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <span className="text-2xl animate-bounce">🔥</span>
        <div>
          <h4 className="text-xs font-bold text-[#3d3326]">Racha de estudio</h4>
          <p className="text-[11px] text-[#b45309] font-semibold">{streak} {streak === 1 ? 'día consecutivo' : 'días consecutivos'}</p>
        </div>
      </div>
    </aside>
  );
}