// ===================================
// 8. COMPONENT DailyMissions.tsx
// ===================================

import { useEffect, useState } from "react";
import {  missionApi,studyPlanApi } from "@/services/api";

export function DailyMissions() {
  const [missions, setMissions] =
    useState<any[]>([]);

  const loadData = async () => {
   const res = await studyPlanApi.getTodayPlan();

    setMissions(res?.data?.activities || []);
    console.log(res?.data?.activities
    );

  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (
    id: string
  ) => {
    await missionApi.completeMission(id);
    loadData();
  };

  return (
    <div className="glass p-5">
      <h3 className="text-sm font-semibold mb-4">
        Today's Missions
      </h3>

      <div className="space-y-3">
        {missions.map((m) => (
          <div
            key={m._id}
            className="flex justify-between items-center bg-muted/40 p-3 rounded-lg"
          >
            <div>
              <p className="text-sm">
                {m.title}
              </p>

              <p className="text-xs text-muted-foreground">
                +{m.xp} XP
              </p>
            </div>

            <button
              disabled={m.completed}
              onClick={() =>
                handleComplete(m._id)
              }
              className="text-xs px-3 py-1 rounded bg-primary text-white"
            >
              {m.completed
                ? "Done"
                : "Complete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}