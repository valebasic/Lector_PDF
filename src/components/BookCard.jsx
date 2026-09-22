import React from 'react';

export default function BookCard({ title, progress, status, author }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between h-52 group">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-[#b48ead] font-medium">
            {status}
          </span>
          <span className="text-xs text-zinc-500">{progress}%</span>
        </div>
        <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-[#ebcb8b] transition-colors line-clamp-2">
          {title}
        </h3>
      </div>

      {/* Barra de progreso interactiva */}
      <div>
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-4">
          <div 
            className="bg-[#b48ead] h-full rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <button className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors">
          Continuar leyendo
        </button>
      </div>
    </div>
  );
}
