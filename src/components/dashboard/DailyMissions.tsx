import {
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  missionApi,
  studyPlanApi,

} from "@/services/api";

export function DailyMissions() {

  const navigate =
    useNavigate();

  const [missions, setMissions] =
    useState<any[]>([]);

  const loadData = async () => {

    try {

      const res =
        await studyPlanApi.getTodayPlan();

      setMissions(
        res?.data?.activities || []
      );

     console.log(
  JSON.stringify(
    res?.data?.activities,
    null,
    2
  )
);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    loadData();

  }, []);

  const handleComplete =
    async (id: string) => {

      try {

        await missionApi.completeMission(
          id
        );

        loadData();

      } catch (error) {

        console.log(error);
      }
    };

  // =========================
  // AUTO NAVIGATION
  // =========================

  const handleNavigate =
    (mission: any) => {
      console.log(
        "Navigating for mission:",
        mission
      );

      if (
        !mission.title ||
        !mission.type
      ) {
        return;
      }
   console.log("mission topic", mission.type)
   console.log("mission", mission.title)
      navigate(
        `/practice/${
          mission.type
        }/${
          encodeURIComponent(
            mission.title
          )
        }`
      );
    };

  return (

    <div className="glass p-5">

      <h3 className="text-sm font-semibold mb-4">
        Today's Missions
      </h3>

      <div className="space-y-3">

      {missions.map((m) => (

  <div
    key={m.id}
    
    onClick={() =>
      handleNavigate(m)
    }
    className="
      flex
      justify-between
      items-center
      bg-muted/40
      p-3
      rounded-lg
      cursor-pointer
      hover:bg-muted/60
      transition
    "
  >

    <div>

      <p className="text-sm font-medium">
        {m.title}
      </p>

      <p className="text-xs text-muted-foreground">
        +{m.xp} XP
      </p>

      <p className="text-xs text-primary mt-1 capitalize">
        {m.type}
      </p>

    </div>

    <button
      disabled={m.completed}
      onClick={(e) => {

        e.stopPropagation();
         handleNavigate(m)

       handleComplete(m._id);

      }}
      className="
        text-xs
        px-3
        py-1
        rounded
        bg-primary
        text-white
      "
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