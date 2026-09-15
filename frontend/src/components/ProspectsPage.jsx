import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createProspect, getProspects, getUsers } from '../api';
import { Button, DataTable, Field, inputClass, Modal, PageHeader } from './ui';

const emptyProspect = {
  title: '',
  name: '',
  organization: '',
  value: '',
  city: '',
  tags: '',
  owner: '',
  source: '',
  visibility: 'shared',
  expected_close_date: '',
  phone: '',
  email: '',
  vertical: '',
  customer_classification: '',
  specialty: '',
};

export default function ProspectsPage() {
  const [prospects, setProspects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ city: '', tags: '', owner: '', source: '' });
  const [form, setForm] = useState(emptyProspect);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    const [prospectsRes, usersRes] = await Promise.all([getProspects(filters), getUsers()]);
    setProspects(prospectsRes.data);
    setUsers(usersRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const save = async () => {
    try {
      await createProspect({
        ...form,
        value: form.value || 0,
        owner: form.owner || null,
        expected_close_date: form.expected_close_date || null,
      });
      setForm(emptyProspect);
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear prospecto:', error);
      alert('No se pudo guardar el prospecto.');
    }
  };

  const columns = [
    { key: 'title', label: 'Título', render: (row) => row.title || row.name },
    { key: 'organization', label: 'Organización' },
    { key: 'value', label: 'Valor', render: (row) => `BOB ${Number(row.value || 0).toLocaleString()}` },
    { key: 'city', label: 'Ciudad' },
    { key: 'tags', label: 'Etiquetas' },
    { key: 'owner_name', label: 'Propietario' },
    { key: 'source', label: 'Fuente' },
    { key: 'visibility', label: 'Visible para', render: (row) => (row.visibility === 'private' ? 'Solo propietario' : 'Equipo') },
    { key: 'created_at', label: 'Fecha de creación', render: (row) => new Date(row.created_at).toLocaleDateString() },
    { key: 'updated_at', label: 'Hora de actualización', render: (row) => new Date(row.updated_at).toLocaleString() },
    { key: 'creator_name', label: 'Creador' },
  ];

  return (
    <>
      <PageHeader
        title="Prospectos"
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Añadir prospecto</Button>}
      >
        Buzón comercial con filtros por ciudad, etiquetas, propietario y origen.
      </PageHeader>

      <div className="mb-4 grid gap-3 rounded-lg border border-pipedrive-border bg-white p-4 md:grid-cols-5">
        {['city', 'tags', 'source'].map((field) => (
          <input
            key={field}
            className={inputClass}
            placeholder={{ city: 'Ciudad', tags: 'Etiquetas', source: 'Origen' }[field]}
            value={filters[field]}
            onChange={(event) => setFilters((current) => ({ ...current, [field]: event.target.value }))}
          />
        ))}
        <select className={inputClass} value={filters.owner} onChange={(event) => setFilters((current) => ({ ...current, owner: event.target.value }))}>
          <option value="">Todos los propietarios</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}
        </select>
        <Button variant="secondary" onClick={fetchData}>Filtrar</Button>
      </div>

      <DataTable columns={columns} rows={prospects} empty="No hay prospectos" />

      <Modal
        title="Añadir prospecto"
        open={open}
        onClose={() => setOpen(false)}
        wide
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save} disabled={!form.title && !form.name}>Guardar</Button></>}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['title', 'Título'],
            ['name', 'Persona de contacto'],
            ['organization', 'Organización'],
            ['value', 'Valor'],
            ['city', 'Ciudad'],
            ['tags', 'Etiquetas'],
            ['source', 'Fuente'],
            ['phone', 'Teléfono'],
            ['email', 'Correo electrónico'],
            ['vertical', 'Vertical'],
            ['customer_classification', 'Clasificación de Cliente'],
            ['specialty', 'Especialidad'],
          ].map(([field, label]) => (
            <Field key={field} label={label}>
              <input
                type={field === 'value' ? 'number' : field === 'email' ? 'email' : 'text'}
                className={inputClass}
                value={form[field]}
                onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
              />
            </Field>
          ))}
          <Field label="Fecha prevista de cierre">
            <input type="date" className={inputClass} value={form.expected_close_date} onChange={(event) => setForm((current) => ({ ...current, expected_close_date: event.target.value }))} />
          </Field>
          <Field label="Propietario">
            <select className={inputClass} value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}>
              <option value="">Usuario actual</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}
            </select>
          </Field>
          <Field label="Visible para">
            <select className={inputClass} value={form.visibility} onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value }))}>
              <option value="shared">Equipo</option>
              <option value="private">Solo propietario</option>
            </select>
          </Field>
        </div>
      </Modal>
    </>
  );
}
