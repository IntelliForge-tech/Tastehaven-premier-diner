import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { LiveFloorView } from "@/components/admin/floors/LiveFloorView";
import { TableAssignmentDialog } from "@/components/admin/tables/TableAssignmentDialog";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { useTableAssignments } from "@/hooks/useTableAssignments";
import { useReservations } from "@/hooks/useReservations";
import type { RestaurantTable } from "@/services/tables.service";

export const Route = createFileRoute("/admin/_authenticated/tables/live")({
  component: AdminLiveFloorPage,
  head: () => ({
    meta: [{ title: "Live Floor — Admin — Taste Haven" }],
  }),
});

function AdminLiveFloorPage() {
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  const { items: reservations } = useReservations();
  const { refetch: refetchAssignments } = useTableAssignments();

  function handleTableSelect(table: RestaurantTable) {
    setSelectedTable(table);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Live Floor" />
      <PageHeader
        title="Live Floor View"
        description="Real-time view of all tables, occupancy, and reservations. Click any table to assign or update."
      />

      <SectionContainer>
        <LiveFloorView
          onTableSelect={handleTableSelect}
          selectedFloorId={selectedFloorId}
          onFloorChange={setSelectedFloorId}
        />
      </SectionContainer>

      <TableAssignmentDialog
        table={selectedTable}
        reservations={reservations}
        onClose={() => setSelectedTable(null)}
        onSuccess={() => { setSelectedTable(null); refetchAssignments(); }}
        currentUserId={null}
      />
    </div>
  );
}
