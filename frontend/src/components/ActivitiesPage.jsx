import { dateFnsLocalizer } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as BigCalendar } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createActivity, getActivities, getDeals, getPeople, getProspects, getUsers } from '../api';
import { Button, Field, inputClass, Modal, PageHeader } from './ui';

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const emptyActivity = {
  subject: '',
  type: 'task',
  due_date: '',
  duration: 30,
  status: 'planned',
  note: '',
  person: '',
  deal: '',
  prospect: '',
  owner: '',
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [catalogs, setCatalogs] = useState({ people: [], deals: [], prospects: [], users: [] });
  const [form, setForm] = useState(emptyActivity);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    const [activitiesRes, peopleRes, dealsRes, prospectsRes, usersRes] = await Promise.all([
      getActivities(),
      getPeople(),
      getDeals(),
      getProspects(),
      getUsers(),
    ]);
    setActivities(activitiesRes.data);
    setCatalogs({ people: peopleRes.data, deals: dealsRes.data, prospects: prospectsRes.data, users: usersRes.data });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const events = useMemo(
    () =>
      activities.map((activity) => {
        const start = new Date(activity.due_date);
        const end = new Date(start.getTime() + Number(activity.duration || 30) * 60000);
        return { id: activity.id, title: activity.subject, start, end, resource: activity };
      }),
    [activities]
  );

  const save = async () => {
    try {
      await createActivity({
        ...form,
        person: form.person || null,
        deal: form.deal || null,
        prospect: form.prospect || null,
        owner: form.owner || null,
      });
      setForm(emptyActivity);
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar actividad:', error);
      alert('No se pudo guardar la actividad.');
    }
  };

  return (
    <>
      <PageHeader
        title="Actividades"
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Añadir actividad</Button>}
      >
        Calendario de llamadas, reuniones, correos y tareas. Sincronización Google/Outlook pendiente de conectar.
      </PageHeader>

      <div className="mb-4 rounded-lg border border-pipedrive-border bg-white p-3 text-sm text-gray-600">
        Google Calendar y Outlook: placeholder visual listo para futura sincronización.
      </div>

      <div className="rounded-lg border border-pipedrive-border bg-white p-4">
        <BigCalendar
          localizer={localizer}
          culture="es"
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 620 }}
          messages={{ today: 'Hoy', previous: 'Anterior', next: 'Siguiente', month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda' }}
        />
      </div>

      <Modal
        title="Añadir actividad"
        open={open}
        onClose={() => setOpen(false)}
        wide
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save} disabled={!form.subject || !form.due_date}>Guardar</Button></>}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Asunto"><input className={inputClass} value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} /></Field>
          <Field label="Tipo">
            <select className={inputClass} value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
              <option value="call">Llamada</option>
              <option value="meeting">Reunión</option>
              <option value="email">Correo</option>
              <option value="task">Tarea</option>
            </select>
          </Field>
          <Field label="Fecha y hora"><input type="datetime-local" className={inputClass} value={form.due_date} onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))} /></Field>
          <Field label="Duración (min)"><input type="number" className={inputClass} value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} /></Field>
          <Field label="Estado">
            <select className={inputClass} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
              <option value="planned">Planificada</option>
              <option value="done">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </Field>
          <Field label="Propietario">
            <select className={inputClass} value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}>
              <option value="">Usuario actual</option>
              {catalogs.users.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}
            </select>
          </Field>
          <Field label="Persona">
            <select className={inputClass} value={form.person} onChange={(event) => setForm((current) => ({ ...current, person: event.target.value }))}>
              <option value="">Sin persona</option>
              {catalogs.people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </Field>
          <Field label="Trato">
            <select className={inputClass} value={form.deal} onChange={(event) => setForm((current) => ({ ...current, deal: event.target.value }))}>
              <option value="">Sin trato</option>
              {catalogs.deals.map((deal) => <option key={deal.id} value={deal.id}>{deal.title}</option>)}
            </select>
          </Field>
          <Field label="Prospecto">
            <select className={inputClass} value={form.prospect} onChange={(event) => setForm((current) => ({ ...current, prospect: event.target.value }))}>
              <option value="">Sin prospecto</option>
              {catalogs.prospects.map((prospect) => <option key={prospect.id} value={prospect.id}>{prospect.title || prospect.name}</option>)}
            </select>
          </Field>
          <label className="block text-sm md:col-span-3">
            <span className="mb-1 block font-medium text-gray-700">Nota</span>
            <textarea className={`${inputClass} min-h-24`} value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
          </label>
        </div>
      </Modal>
    </>
  );
}
