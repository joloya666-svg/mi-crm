import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createDeal, getOrganizations, getPeople, getProducts, getStages, getUsers } from '../api';
import { Button, Field, inputClass, Modal } from './ui';

const emptyDeal = {
  title: '',
  organization: '',
  person: '',
  person_name: '',
  value: '',
  pipeline: 'Ventas',
  stage: '',
  tags: '',
  expected_close_date: '',
  owner: '',
  source_channel_id: '',
  contact_source: '',
  visibility: 'shared',
  phone: '',
  email: '',
  vertical: '',
  customer_classification: '',
  specialty: '',
};

export default function DealForm({ open, onClose, onSaved }) {
  const [form, setForm] = useState(emptyDeal);
  const [products, setProducts] = useState([{ product: '', name: '', quantity: 1, unit_price: '' }]);
  const [catalogs, setCatalogs] = useState({ stages: [], organizations: [], people: [], products: [], users: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    Promise.all([getStages(), getOrganizations(), getPeople(), getProducts(), getUsers()]).then(
      ([stages, organizations, people, productList, users]) => {
        setCatalogs({
          stages: stages.data,
          organizations: organizations.data,
          people: people.data,
          products: productList.data,
          users: users.data,
        });
        setForm((current) => ({ ...current, stage: current.stage || stages.data[0]?.id || '' }));
      }
    );
  }, [open]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const updateProduct = (index, field, value) => {
    setProducts((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const next = { ...item, [field]: value };
        if (field === 'product') {
          const selected = catalogs.products.find((product) => product.id === Number(value));
          next.name = selected?.name || '';
          next.unit_price = selected?.price || '';
        }
        return next;
      })
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: form.value || 0,
        organization: form.organization || null,
        person: form.person || null,
        stage: form.stage || null,
        owner: form.owner || null,
        expected_close_date: form.expected_close_date || null,
        products: products
          .filter((product) => product.product || product.name)
          .map((product) => ({
            product: product.product || null,
            name: product.name,
            quantity: product.quantity || 1,
            unit_price: product.unit_price || 0,
          })),
      };
      await createDeal(payload);
      setForm(emptyDeal);
      setProducts([{ product: '', name: '', quantity: 1, unit_price: '' }]);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error al crear trato:', error);
      alert('No se pudo guardar el trato.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Añadir trato"
      open={open}
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving || !form.title}>Guardar</Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Título">
          <input className={inputClass} value={form.title} onChange={(event) => updateField('title', event.target.value)} />
        </Field>
        <Field label="Organización">
          <select className={inputClass} value={form.organization} onChange={(event) => updateField('organization', event.target.value)}>
            <option value="">Sin organización</option>
            {catalogs.organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>
        <Field label="Persona de contacto">
          <select className={inputClass} value={form.person} onChange={(event) => updateField('person', event.target.value)}>
            <option value="">Sin persona</option>
            {catalogs.people.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>
        <Field label="Valor">
          <input type="number" className={inputClass} value={form.value} onChange={(event) => updateField('value', event.target.value)} />
        </Field>
        <Field label="Embudo">
          <input className={inputClass} value={form.pipeline} onChange={(event) => updateField('pipeline', event.target.value)} />
        </Field>
        <Field label="Etapa">
          <select className={inputClass} value={form.stage} onChange={(event) => updateField('stage', event.target.value)}>
            {catalogs.stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
          </select>
        </Field>
        <Field label="Etiquetas">
          <input className={inputClass} value={form.tags} onChange={(event) => updateField('tags', event.target.value)} />
        </Field>
        <Field label="Fecha prevista de cierre">
          <input type="date" className={inputClass} value={form.expected_close_date} onChange={(event) => updateField('expected_close_date', event.target.value)} />
        </Field>
        <Field label="Propietario">
          <select className={inputClass} value={form.owner} onChange={(event) => updateField('owner', event.target.value)}>
            <option value="">Usuario actual</option>
            {catalogs.users.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}
          </select>
        </Field>
        <Field label="ID del canal de la fuente">
          <input className={inputClass} value={form.source_channel_id} onChange={(event) => updateField('source_channel_id', event.target.value)} />
        </Field>
        <Field label="Fuente del contacto">
          <input className={inputClass} value={form.contact_source} onChange={(event) => updateField('contact_source', event.target.value)} />
        </Field>
        <Field label="Visible para">
          <select className={inputClass} value={form.visibility} onChange={(event) => updateField('visibility', event.target.value)}>
            <option value="shared">Equipo</option>
            <option value="private">Solo propietario</option>
          </select>
        </Field>
        <Field label="Teléfono">
          <input className={inputClass} value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
        </Field>
        <Field label="Correo electrónico">
          <input type="email" className={inputClass} value={form.email} onChange={(event) => updateField('email', event.target.value)} />
        </Field>
        <Field label="Vertical">
          <input className={inputClass} value={form.vertical} onChange={(event) => updateField('vertical', event.target.value)} />
        </Field>
        <Field label="Clasificación de Cliente">
          <input className={inputClass} value={form.customer_classification} onChange={(event) => updateField('customer_classification', event.target.value)} />
        </Field>
        <Field label="Especialidad">
          <input className={inputClass} value={form.specialty} onChange={(event) => updateField('specialty', event.target.value)} />
        </Field>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-pipedrive-text">Productos</h3>
          <Button variant="secondary" onClick={() => setProducts((current) => [...current, { product: '', name: '', quantity: 1, unit_price: '' }])}>
            <Plus className="h-4 w-4" /> Añadir producto
          </Button>
        </div>
        <div className="space-y-2">
          {products.map((product, index) => (
            <div key={index} className="grid gap-2 rounded-md border border-pipedrive-border p-3 md:grid-cols-[1fr_1fr_120px_140px_40px]">
              <select className={inputClass} value={product.product} onChange={(event) => updateProduct(index, 'product', event.target.value)}>
                <option value="">Producto del catálogo</option>
                {catalogs.products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <input className={inputClass} placeholder="Nombre" value={product.name} onChange={(event) => updateProduct(index, 'name', event.target.value)} />
              <input type="number" className={inputClass} placeholder="Cantidad" value={product.quantity} onChange={(event) => updateProduct(index, 'quantity', event.target.value)} />
              <input type="number" className={inputClass} placeholder="Precio" value={product.unit_price} onChange={(event) => updateProduct(index, 'unit_price', event.target.value)} />
              <button className="rounded-md text-gray-500 hover:bg-gray-100" type="button" onClick={() => setProducts((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                <Trash2 className="mx-auto h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
