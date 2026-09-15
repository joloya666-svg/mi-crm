import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { getDashboard, getUsers } from '../api';
import { Field, inputClass, PageHeader } from './ui';

const colors = ['#2b73ff', '#16a34a', '#ef4444', '#f59e0b'];

export default function DashboardPage() {
  const [data, setData] = useState({ deals_by_owner: [], pipeline_health: {}, activities_month: [], revenue: [] });
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ period: 'all', owner: '' });

  const fetchData = async () => {
    const [dashboardRes, usersRes] = await Promise.all([getDashboard(filters), getUsers()]);
    setData(dashboardRes.data);
    setUsers(usersRes.data);
  };

  useEffect(() => {
    fetchData();
  }, [filters.period, filters.owner]);

  const pipelineData = [
    { name: 'Abiertos', value: data.pipeline_health.abiertos || 0 },
    { name: 'Ganados', value: data.pipeline_health.ganados || 0 },
    { name: 'Perdidos', value: data.pipeline_health.perdidos || 0 },
  ];

  return (
    <>
      <PageHeader title="Avances">
        Indicadores comerciales actualizados desde la API.
      </PageHeader>

      <div className="mb-4 grid gap-3 rounded-lg border border-pipedrive-border bg-white p-4 md:grid-cols-2">
        <Field label="Período">
          <select className={inputClass} value={filters.period} onChange={(event) => setFilters((current) => ({ ...current, period: event.target.value }))}>
            <option value="all">Todo</option>
            <option value="month">Este mes</option>
          </select>
        </Field>
        <Field label="Usuario">
          <select className={inputClass} value={filters.owner} onChange={(event) => setFilters((current) => ({ ...current, owner: event.target.value }))}>
            <option value="">Todos</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Estado de tratos por representante">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.deals_by_owner}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="owner" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Tratos" fill="#2b73ff" />
              <Bar dataKey="value" name="Valor" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Salud del embudo">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pipelineData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} label>
                {pipelineData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Actividades del mes">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.activities_month}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" name="Actividades" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Ingresos ganados">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" name="Ingresos" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </>
  );
}

function ChartPanel({ title, children }) {
  return (
    <section className="rounded-lg border border-pipedrive-border bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-pipedrive-text">{title}</h2>
      {children}
    </section>
  );
}
