import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  UserRound, 
  CalendarDays, 
  Package, 
  BarChart3,
  Settings,
  CircleUser,
  Search
} from 'lucide-react';

// Los módulos exactos que vimos en tus capturas
const menuItems = [
  { name: 'Inicio', icon: LayoutDashboard, path: '/' },
  { name: 'Prospectos', icon: Users, path: '/prospects' },
  { name: 'Tratos', icon: HandCoins, path: '/deals' },
  { name: 'Contactos', icon: UserRound, path: '/contacts' },
  { name: 'Actividades', icon: CalendarDays, path: '/activities' },
  { name: 'Productos', icon: Package, path: '/products' },
  { name: 'Avances', icon: BarChart3, path: '/dashboard' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR - Igual al de Pipedrive */}
      <aside className="w-[72px] md:w-[230px] bg-pipedrive-sidebar text-white flex flex-col shrink-0 transition-all duration-300">
        {/* Logo o título */}
        <div className="h-16 flex items-center justify-center md:justify-start px-4 border-b border-pipedrive-hover">
          <span className="text-xl font-bold hidden md:block">Mi CRM</span>
          <span className="text-xl font-bold md:hidden">M</span>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-pipedrive-blue text-white' 
                    : 'text-gray-300 hover:bg-pipedrive-hover hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium hidden md:block">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Configuración abajo */}
        <div className="border-t border-pipedrive-hover p-4">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-pipedrive-hover rounded-lg p-2">
            <CircleUser className="w-8 h-8 text-gray-400" />
            <div className="hidden md:block">
              <p className="text-sm font-medium">Alan Buitron</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER (Barra superior) */}
        <header className="h-16 bg-white border-b border-pipedrive-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 w-full max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en Pipedrive..."
                className="w-full pl-10 pr-4 py-2 bg-pipedrive-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pipedrive-blue/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-pipedrive-text">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">814/25,000</span>
            <button className="bg-pipedrive-blue text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition">
              + Añadir
            </button>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO (Aquí se renderizan las páginas) */}
        <main className="flex-1 overflow-y-auto bg-pipedrive-gray p-6">
          <Outlet /> {/* React Router renderiza aquí las vistas */}
        </main>
      </div>
    </div>
  );
}