import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import ActivitiesPage from './components/ActivitiesPage';
import ContactsPage from './components/ContactsPage';
import DashboardPage from './components/DashboardPage';
import DealsKanban from './components/DealsKanban';
import LoginPage from './components/LoginPage';
import ProductsPage from './components/ProductsPage';
import ProspectsPage from './components/ProspectsPage';

const Home = () => (
  <div className="rounded-lg border border-pipedrive-border bg-white p-6">
    <h1 className="text-2xl font-semibold text-pipedrive-text">¡Hola, Alan Buitron!</h1>
    <p className="mt-2 text-sm text-gray-500">Usa el menú lateral para gestionar prospectos, tratos, contactos y actividades.</p>
  </div>
);

function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem('crm_access_token')));

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="prospects" element={<ProspectsPage />} />
          <Route path="deals" element={<DealsKanban />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
