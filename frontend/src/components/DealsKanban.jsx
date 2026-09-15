import { useEffect, useState } from 'react';
import {
  closestCorners,
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { changeDealStage, getDeals, getStages } from '../api';
import DealForm from './DealForm';
import { Button, PageHeader } from './ui';

function DealCard({ deal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: {
      type: 'deal',
      stageId: deal.stage,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-md border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      <h4 className="text-sm font-semibold text-gray-800">{deal.title}</h4>
      <p className="mt-1 text-xs text-gray-500">{deal.person_display_name || deal.person_name || 'Sin contacto'}</p>
      {deal.organization_name && <p className="mt-1 text-xs text-gray-500">{deal.organization_name}</p>}
      <p className="mt-2 text-sm font-bold text-pipedrive-blue">
        BOB {Number(deal.value || 0).toLocaleString()}
      </p>
    </div>
  );
}

function Column({ stage, deals, highlighted }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      type: 'stage',
      stageId: stage.id,
    },
  });

  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
  const active = highlighted || isOver;

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[calc(100vh-210px)] w-80 flex-shrink-0 flex-col rounded-lg border p-4 transition-colors ${
        active ? 'border-pipedrive-blue bg-blue-50 ring-2 ring-pipedrive-blue/30' : 'border-transparent bg-gray-100'
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">{stage.name}</h3>
        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
          BOB {totalValue.toLocaleString()}
        </span>
      </div>
      <SortableContext items={deals.map((deal) => deal.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3 rounded-md">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
          {deals.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-400">
              Suelta tratos aquí
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function DealsKanban() {
  const [stages, setStages] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overStageId, setOverStageId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stagesRes, dealsRes] = await Promise.all([getStages(), getDeals()]);
      setStages(stagesRes.data);
      setDeals(dealsRes.data);
    } catch (error) {
      console.error('Error al cargar tratos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const resolveStageId = (over) => {
    if (!over) return null;
    if (over.data?.current?.type === 'deal') {
      return over.data.current.stageId;
    }
    if (over.data?.current?.type === 'stage') {
      return over.data.current.stageId;
    }
    const parsed = parseInt(over.id, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
    const matchingStage = stages.find((stage) => stage.name.toLowerCase() === String(over.id).toLowerCase());
    return matchingStage?.id ?? null;
  };

  const handleDragOver = ({ over }) => {
    setOverStageId(resolveStageId(over));
  };

  const handleDragEnd = async ({ active, over }) => {
    setOverStageId(null);
    if (!over) return;

    const dealId = active.id;
    const newStageId = resolveStageId(over);
    if (!newStageId) return;

    const dealToMove = deals.find((deal) => deal.id === dealId);
    if (!dealToMove || dealToMove.stage === newStageId) return;

    const previousStageId = dealToMove.stage;
    setDeals((currentDeals) =>
      currentDeals.map((deal) => (deal.id === dealId ? { ...deal, stage: newStageId } : deal))
    );

    try {
      await changeDealStage(dealId, newStageId);
    } catch (error) {
      console.error('Error al guardar el cambio de etapa:', error);
      setDeals((currentDeals) =>
        currentDeals.map((deal) => (deal.id === dealId ? { ...deal, stage: previousStageId } : deal))
      );
      alert('Error al mover el trato. Por favor, intenta de nuevo.');
    }
  };

  const dealsByStage = stages.map((stage) => ({
    ...stage,
    deals: deals.filter((deal) => deal.stage === stage.id),
  }));

  return (
    <>
      <PageHeader
        title="Tratos"
        actions={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Añadir trato</Button>}
      >
        Gestiona oportunidades por etapa del embudo.
      </PageHeader>

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500">Cargando tratos...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setOverStageId(null)}
        >
          <div className="flex gap-5 overflow-x-auto pb-4">
            {dealsByStage.map((stage) => (
              <Column key={stage.id} stage={stage} deals={stage.deals} highlighted={overStageId === stage.id} />
            ))}
          </div>
        </DndContext>
      )}

      <DealForm open={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchData} />
    </>
  );
}
