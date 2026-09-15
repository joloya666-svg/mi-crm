import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createProduct, getProducts } from '../api';
import { Button, DataTable, Field, inputClass, Modal, PageHeader } from './ui';

const emptyProduct = { name: '', code: '', price: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    const response = await getProducts();
    setProducts(response.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const save = async () => {
    try {
      await createProduct({ ...form, price: form.price || 0 });
      setForm(emptyProduct);
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('No se pudo guardar el producto.');
    }
  };

  return (
    <>
      <PageHeader
        title="Productos"
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Añadir producto</Button>}
      >
        Catálogo para asociar cantidades y precios a los tratos.
      </PageHeader>
      <DataTable
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'code', label: 'Código' },
          { key: 'price', label: 'Precio', render: (row) => `BOB ${Number(row.price || 0).toLocaleString()}` },
        ]}
        rows={products}
        empty="No hay productos"
      />
      <Modal
        title="Añadir producto"
        open={open}
        onClose={() => setOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save} disabled={!form.name}>Guardar</Button></>}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nombre"><input className={inputClass} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Field>
          <Field label="Código"><input className={inputClass} value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></Field>
          <Field label="Precio"><input type="number" className={inputClass} value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} /></Field>
        </div>
      </Modal>
    </>
  );
}
