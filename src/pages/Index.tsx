import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { AISuggestionCard } from "@/components/dashboard/AISuggestionCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { StudyProgressCard } from "@/components/dashboard/StudyProgressCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { SubjectMastery } from "@/components/dashboard/SubjectMastery";
import { StudyPlanCards } from "@/components/dashboard/StudyPlanCards";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { FocusMode } from "@/components/dashboard/FocusMode";
import { MoodTracker } from "@/components/dashboard/MoodTracker";
import { WeakTopicsRadar } from "@/components/dashboard/WeakTopicsRadar";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AIChatWidget } from "@/components/dashboard/AIChatWidget";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { DailyMissions } from "@/components/dashboard/DailyMissions";
import { Achievements } from "@/components/dashboard/Achievements";

import {
  dashboardApi,
  studyPlanApi,
} from "@/services/api";

const Index = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [accuracyStats, setAccuracyStats] = useState<any>(null);
  const [todayPlan, setTodayPlan] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  /* ==========================================
     SAFE FETCH (429 FIX)
  ========================================== */
  const fetchAllData = async () => {
    try {
      setLoading(true);

      /* -------------------------
         STEP 1 FAST NORMAL APIs
      -------------------------- */
      const [dashData, statsData] =
        await Promise.all([
          dashboardApi.getDashboard(),
          dashboardApi.getAccuracyStats(),
        ]);

      setDashboard(dashData);
      setAccuracyStats(statsData);

      /* -------------------------
         STEP 2 CACHE CHECK
      -------------------------- */
      const cacheTime =
        localStorage.getItem(
          "study_plan_cache_time"
        );

      const now = Date.now();

      const tenMin =
        10 * 60 * 1000;

      if (
        cacheTime &&
        now -
          Number(cacheTime) <
          tenMin
      ) {
        const cachedToday =
          localStorage.getItem(
            "today_plan_cache"
          );

        const cachedPlans =
          localStorage.getItem(
            "plans_cache"
          );

        if (cachedToday) {
          setTodayPlan(
            JSON.parse(
              cachedToday
            )
          );
        }

        if (cachedPlans) {
          setPlans(
            JSON.parse(
              cachedPlans
            )
          );
        }

        setLoading(false);
        return;
      }

      /* -------------------------
         STEP 3 DELAY AI CALLS
      -------------------------- */

      setTimeout(async () => {
        try {
          const todayData =
            await studyPlanApi.getTodayPlan();

          setTodayPlan(
            todayData.data
          );

          localStorage.setItem(
            "today_plan_cache",
            JSON.stringify(
              todayData.data
            )
          );
        } catch (error) {
          console.log(
            "today plan skipped"
          );
        }
      }, 1200);

      setTimeout(async () => {
        try {
          const plansData =
            await studyPlanApi.getPlans();

          setPlans(
            plansData.data ||
              []
          );

          localStorage.setItem(
            "plans_cache",
            JSON.stringify(
              plansData.data ||
                []
            )
          );

          localStorage.setItem(
            "study_plan_cache_time",
            String(now)
          );
        } catch (error) {
          console.log(
            "plans skipped"
          );
        }
      }, 2500);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-2 lg:hidden">
            <SidebarTrigger />
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-5 pb-24 md:pb-8">
            <GreetingHeader
              dashboard={
                dashboard
              }
              loading={
                loading
              }
            />

            <AISuggestionCard
              dashboard={
                dashboard
              }
            />

            <StatsCards
              dashboard={
                dashboard
              }
              accuracyStats={
                accuracyStats
              }
            />

            <QuickActions />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StudyProgressCard />

              <PerformanceChart
                accuracyStats={
                  accuracyStats
                }
              />

              <SubjectMastery
                accuracyStats={
                  accuracyStats
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyMissions />
              <FocusMode />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              

              <AIInsightsCard
                dashboard={
                  dashboard
                }
              />
            </div>

            {/* <Achievements /> */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FocusMode />

              <WeakTopicsRadar />

              <div className="space-y-4">
                <MoodTracker />
                <Leaderboard />
              </div>
            </div>
          </main>
        </div>
      </div>

      <AIChatWidget />
      <MobileNav />
    </SidebarProvider>
  );
};

export default Index;