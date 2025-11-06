import React from 'react';

export type KanbanColumn = 'backlog' | 'todo' | 'in_progress' | 'done';

export interface KanbanTask {
  _id: string;
  titulo: string;
  descripcion?: string;
  estado: KanbanColumn;
}

interface Props {
  tasks: KanbanTask[];
  onMove: (taskId: string, estado: KanbanColumn) => void;
}

const columns: { key: KanbanColumn; title: string }[] = [
  { key: 'backlog', title: 'Backlog' },
  { key: 'todo', title: 'Por hacer' },
  { key: 'in_progress', title: 'En progreso' },
  { key: 'done', title: 'Terminado' },
];

export default function KanbanBoard({ tasks, onMove }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.estado === col.key);
        return (
          <div key={col.key} className="bg-gray-50 border border-gray-200 rounded p-3 min-h-[200px]">
            <h3 className="font-semibold mb-2">{col.title}</h3>
            <div className="space-y-2">
              {colTasks.length === 0 && (
                <div className="text-sm text-gray-500">Sin tareas</div>
              )}
              {colTasks.map((t) => (
                <div key={t._id} className="bg-white rounded shadow p-2">
                  <div className="text-sm font-medium">{t.titulo}</div>
                  {t.descripcion && (
                    <div className="text-xs text-gray-600">{t.descripcion}</div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {columns
                      .filter((c) => c.key !== t.estado)
                      .map((c) => (
                        <button
                          key={c.key}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                          onClick={() => onMove(t._id, c.key)}
                        >
                          Mover a {c.title}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}