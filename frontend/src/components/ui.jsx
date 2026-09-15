import { X } from 'lucide-react';

export function PageHeader({ title, actions, children }) {
  return (
    <div className="mb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pipedrive-text">{title}</h1>
          {children && <div className="mt-2 text-sm text-gray-500">{children}</div>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-pipedrive-blue text-white hover:bg-blue-600',
    secondary: 'bg-white text-pipedrive-text border border-pipedrive-border hover:bg-gray-50',
    ghost: 'bg-transparent text-pipedrive-text hover:bg-gray-100',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full rounded-md border border-pipedrive-border bg-white px-3 py-2 text-sm text-pipedrive-text outline-none focus:border-pipedrive-blue focus:ring-2 focus:ring-pipedrive-blue/20';

export function Modal({ title, open, onClose, children, footer, wide = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`max-h-[92vh] w-full overflow-hidden rounded-lg bg-white shadow-xl ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <div className="flex items-center justify-between border-b border-pipedrive-border px-5 py-4">
          <h2 className="text-lg font-semibold text-pipedrive-text">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100" type="button">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-pipedrive-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function DataTable({ columns, rows, empty = 'Sin datos' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-pipedrive-border bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-pipedrive-border text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pipedrive-border text-pipedrive-text">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-4 py-3">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={columns.length}>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
