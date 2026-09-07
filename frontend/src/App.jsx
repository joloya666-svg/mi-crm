import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import DealsKanban from './components/DealsKanban';

const Home = () => <h1 className="text-2xl font-bold text-[#3b434e]">¡Hola, Alan Buitron!</h1>;
const Prospects = () => <h1 className="text-2xl font-bold text-[#3b434e]">Buzón de prospectos</h1>;
const Deals = () => <DealsKanban />;
const Contacts = () => <h1 className="text-2xl font-bold text-[#3b434e]">Personas / Contactos</h1>;
const Activities = () => <h1 className="text-2xl font-bold text-[#3b434e]">Calendario / Actividades</h1>;
const Products = () => <h1 className="text-2xl font-bold text-[#3b434e]">Productos</h1>;
const Dashboard = () => <h1 className="text-2xl font-bold text-[#3b434e]">Avances / Gráficos</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="prospects" element={<Prospects />} />
          <Route path="deals" element={<Deals />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="activities" element={<Activities />} />
          <Route path="products" element={<Products />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;