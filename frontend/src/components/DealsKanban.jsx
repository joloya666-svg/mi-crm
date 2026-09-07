import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getDeals, getStages, changeDealStage } from '../api';

// --- Componente de tarjeta (arrastrable) ---
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
      dealId: deal.id,
      stageId: deal.stage, // importante para saber su etapa actual
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      <h4 className="font-semibold text-gray-800 text-sm">{deal.title}</h4>
      <p className="text-xs text-gray-500 mt-1">{deal.person_name}</p>
      <p className="text-blue-600 font-bold text-sm mt-2">
        BOB{Number(deal.value).toLocaleString()}
      </p>
    </div>
  );
}

// --- Componente de columna (contenedor que recibe tarjetas) ---
function Column({ stage, deals }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      type: 'stage',
      stageId: stage.id,
    },
  });

  const totalValue = deals.reduce((sum, d) => sum + Number(d.value), 0);

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-100 rounded-xl p-4 w-80 flex-shrink-0 min-h-[400px] transition-colors ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
          {stage.name}
        </h3>
        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
          BOB{totalValue.toLocaleString()}
        </span>
      </div>
      <SortableContext
        items={deals.map((d) => d.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
          {deals.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Sin tratos</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// --- Componente principal ---
export default function DealsKanban() {
  const [stages, setStages] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Cargando datos desde la API...');
        const [stagesRes, dealsRes] = await Promise.all([getStages(), getDeals()]);
        console.log('✅ Etapas:', stagesRes.data);
        console.log('✅ Tratos:', dealsRes.data);
        setStages(stagesRes.data);
        setDeals(dealsRes.data);
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // --- MANEJO DEL ARRASTRE ---
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    console.log('🖱️ Evento de arrastre:', { activeId: active.id, overId: over?.id, overData: over?.data });

    if (!over) {
      console.warn('⚠️ No se soltó sobre ningún contenedor');
      return;
    }

    const dealId = active.id;
    let newStageId = null;

    // 1. Si el over es una tarjeta (tiene data.type === 'deal'), usamos su stageId
    if (over.data?.current?.type === 'deal') {
      newStageId = over.data.current.stageId;
      console.log('📌 Stage ID desde tarjeta destino:', newStageId);
    }
    // 2. Si el over es una columna (tiene data.type === 'stage'), usamos su stageId
    else if (over.data?.current?.type === 'stage') {
      newStageId = over.data.current.stageId;
      console.log('📌 Stage ID desde columna destino:', newStageId);
    }
    // 3. Si no tiene data, intentamos parsear el ID directamente
    else {
      const parsed = parseInt(over.id);
      if (!isNaN(parsed)) {
        newStageId = parsed;
        console.log('📌 Stage ID parseado desde over.id:', newStageId);
      }
    }

    // 4. Fallback: buscar por nombre o ID en la lista de etapas
    if (newStageId === null || isNaN(newStageId)) {
      const overIdStr = String(over.id);
      const matchingStage = stages.find(
        (s) => s.id.toString() === overIdStr || s.name.toLowerCase() === overIdStr.toLowerCase()
      );
      if (matchingStage) {
        newStageId = matchingStage.id;
        console.log('📌 Stage ID encontrado por nombre/ID:', newStageId);
      }
    }

    // Si no se pudo determinar, error
    if (newStageId === null || isNaN(newStageId)) {
      console.error('❌ No se pudo determinar el stage ID:', { overId: over.id, overData: over.data });
      return;
    }

    // Verificar que el trato existe
    const dealToMove = deals.find((d) => d.id === dealId);
    if (!dealToMove) {
      console.error('❌ Trato no encontrado:', dealId);
      return;
    }

    // Si ya está en esa etapa, no hacer nada
    if (dealToMove.stage === newStageId) {
      console.log('ℹ️ El trato ya está en la etapa destino');
      return;
    }

    console.log(`🔄 Moviendo trato ${dealId} de "${dealToMove.stage}" a "${newStageId}"`);

    const previousStageId = dealToMove.stage;

    // --- ACTUALIZAR OPTIMISTAMENTE (frontend) ---
    setDeals((prevDeals) =>
      prevDeals.map((deal) =>
        deal.id === dealId ? { ...deal, stage: newStageId } : deal
      )
    );
    console.log('✅ Estado local actualizado');

    // --- PERSISTIR EN EL BACKEND ---
    try {
      await changeDealStage(dealId, newStageId);
      console.log('✅ Cambio guardado en el backend');
    } catch (error) {
      console.error('❌ Error al guardar en el backend:', error);
      // Revertir al estado anterior
      setDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.id === dealId ? { ...deal, stage: previousStageId } : deal
        )
      );
      console.log('🔄 Estado revertido por error');
      alert('Error al mover el trato. Por favor, intenta de nuevo.');
    }
  };

  // --- RENDER ---
  if (loading) {
    return <div className="p-6 text-center text-gray-500">Cargando tratos...</div>;
  }

  if (stages.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay etapas configuradas. Por favor, crea etapas en el admin.
      </div>
    );
  }

  const dealsByStage = stages.map((stage) => ({
    ...stage,
    deals: deals.filter((deal) => deal.stage === stage.id),
  }));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto p-4 bg-[#f5f6f8] min-h-screen">
        {dealsByStage.map((stage) => (
          <Column key={stage.id} stage={stage} deals={stage.deals} />
        ))}
      </div>
    </DndContext>
  );
}