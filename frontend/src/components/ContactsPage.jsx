import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createOrganization, createPerson, getOrganizations, getPeople, getUsers } from '../api';
import { Button, DataTable, Field, inputClass, Modal, PageHeader } from './ui';

const emptyPerson = { name: '', organization: '', email: '', phone: '', owner: '' };
const emptyOrganization = { name: '', email: '', phone: '', city: '', owner: '' };

export default function ContactsPage() {
  const [people, setPeople] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('people');
  const [personForm, setPersonForm] = useState(emptyPerson);
  const [organizationForm, setOrganizationForm] = useState(emptyOrganization);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    const [peopleRes, organizationsRes, usersRes] = await Promise.all([getPeople(), getOrganizations(), getUsers()]);
    setPeople(peopleRes.data);
    setOrganizations(organizationsRes.data);
    setUsers(usersRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const save = async () => {
    try {
      if (activeTab === 'people') {
        await createPerson({ ...personForm, organization: personForm.organization || null, owner: personForm.owner || null });
        setPersonForm(emptyPerson);
      } else {
        await createOrganization({ ...organizationForm, owner: organizationForm.owner || null });
        setOrganizationForm(emptyOrganization);
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar contacto:', error);
      alert('No se pudo guardar el contacto.');
    }
  };

  const personColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'organization_name', label: 'Organización' },
    { key: 'email', label: 'Correo' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'closed_deals', label: 'Tratos cerrados' },
    { key: 'open_deals', label: 'Tratos abiertos' },
  ];

  const organizationColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'city', label: 'Ciudad' },
    { key: 'email', label: 'Correo' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'closed_deals', label: 'Tratos cerrados' },
    { key: 'open_deals', label: 'Tratos abiertos' },
  ];

  return (
    <>
      <PageHeader
        title="Contactos"
        actions={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Añadir</Button>}
      >
        Personas y organizaciones vinculadas a tratos y actividades.
      </PageHeader>

      <div className="mb-4 inline-flex rounded-md border border-pipedrive-border bg-white p-1">
        <button className={`rounded px-3 py-2 text-sm ${activeTab === 'people' ? 'bg-pipedrive-blue text-white' : 'text-gray-600'}`} onClick={() => setActiveTab('people')} type="button">
          Personas
        </button>
        <button className={`rounded px-3 py-2 text-sm ${activeTab === 'organizations' ? 'bg-pipedrive-blue text-white' : 'text-gray-600'}`} onClick={() => setActiveTab('organizations')} type="button">
          Organizaciones
        </button>
      </div>

      {activeTab === 'people' ? (
        <DataTable columns={personColumns} rows={people} empty="No hay personas" />
      ) : (
        <DataTable columns={organizationColumns} rows={organizations} empty="No hay organizaciones" />
      )}

      <Modal
        title={activeTab === 'people' ? 'Añadir persona' : 'Añadir organización'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={save}>Guardar</Button></>}
      >
        {activeTab === 'people' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre"><input className={inputClass} value={personForm.name} onChange={(event) => setPersonForm((current) => ({ ...current, name: event.target.value }))} /></Field>
            <Field label="Organización">
              <select className={inputClass} value={personForm.organization} onChange={(event) => setPersonForm((current) => ({ ...current, organization: event.target.value }))}>
                <option value="">Sin organización</option>
                {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
              </select>
            </Field>
            <Field label="Correo"><input type="email" className={inputClass} value={personForm.email} onChange={(event) => setPersonForm((current) => ({ ...current, email: event.target.value }))} /></Field>
            <Field label="Teléfono"><input className={inputClass} value={personForm.phone} onChange={(event) => setPersonForm((current) => ({ ...current, phone: event.target.value }))} /></Field>
            <Field label="Propietario">
              <select className={inputClass} value={personForm.owner} onChange={(event) => setPersonForm((current) => ({ ...current, owner: event.target.value }))}>
                <option value="">Usuario actual</option>
                {users.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}
              </select>
            </Field>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre"><input className={inputClass} value={organizationForm.name} onChange={(event) => setOrganizationForm((current) => ({ ...current, name: event.target.value }))} /></Field>
            <Field label="Ciudad"><input className={inputClass} value={organizationForm.city} onChange={(event) => setOrganizationForm((current) => ({ ...current, city: event.target.value }))} /></Field>
            <Field label="Correo"><input type="email" className={inputClass} value={organizationForm.email} onChange={(event) => setOrganizationForm((current) => ({ ...current, email: event.target.value }))} /></Field>
            <Field label="Teléfono"><input className={inputClass} value={organizationForm.phone} onChange={(event) => setOrganizationForm((current) => ({ ...current, phone: event.target.value }))} /></Field>
            <Field label="Propietario">
              <select className={inputClass} value={organizationForm.owner} onChange={(event) => setOrganizationForm((current) => ({ ...current, owner: event.target.value }))}>
                <option value="">Usuario actual</option>
                {users.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}
              </select>
            </Field>
          </div>
        )}
      </Modal>
    </>
  );
}
