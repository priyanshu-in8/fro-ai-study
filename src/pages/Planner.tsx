import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BookOpen,
  Code,
  FlaskConical,
  Calculator,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Target,
  Zap,
  Search,
  TrendingUp,
  Flame,
  ChevronDown,
  
} from "lucide-react";

import { studyPlanApi } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type TodayPlan = {
  focusArea: ReactNode;
  shortTermTopic: ReactNode;
  longTermTopic: ReactNode;
  title: string;
  day: number;
  focus: string;
  tasks: string[];
  planId?: string;
};

type Day = {
  day: number;
  topic: string | { name: string; concept?: string; practical?: string };
};

type Week = {
  week: number;
  summary: string;
  focus: string;
  topics: string[];
  milestone: string;
  days: Day[];
};

type Month = {
  month: number;
  summary: string;
  focus: string;
  topics: string[];
  milestone: string;
  weeks: Week[];
};

type LongTermPlan = {
  title: string;
  goal: string;
  level: string;
  duration: string;
  totalMonths: number;
  months: Month[];
};

type ShortTermPlan = {
  title: string;
  goal: string;
  level: string | number;
  duration: string;
  topics: Day[];
};

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  maths: Calculator,
  mathematics: Calculator,
  physics: FlaskConical,
  chemistry: FlaskConical,
  dsa: Code,
  coding: Code,
  c: Code,
  dbms: BookOpen,
  os: BookOpen,
  ml: Sparkles,
  machine: Sparkles,
  learning: Sparkles,
  semiconductor: FlaskConical,
  microcontroller: Code,
};

function detectSubject(text = "") {
  const lower = text.toLowerCase();

  if (lower.includes("math")) return "maths";
  if (lower.includes("physics")) return "physics";
  if (lower.includes("chem")) return "chemistry";
  if (lower.includes("dbms")) return "dbms";
  if (lower.includes("os")) return "os";
  if (lower.includes("ml") || lower.includes("machine")) return "ml";
  if (lower.includes("semiconductor")) return "semiconductor";
  if (lower.includes("microcontroller")) return "microcontroller";

  if (
    lower.includes("array") ||
    lower.includes("stack") ||
    lower.includes("queue") ||
    lower.includes("tree") ||
    lower.includes("linked") ||
    lower.includes("graph") ||
    lower.includes("dsa")
  ) {
    return "dsa";
  }

  return "coding";
}

const Planner = () => {
  const [todayPlan, setTodayPlan] =
    useState<TodayPlan | null>(null);

  const [longTermPlan, setLongTermPlan] =
    useState<LongTermPlan | null>(null);

  const [shortTermPlan, setShortTermPlan] =
    useState<ShortTermPlan | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [completed, setCompleted] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("today");

  const [searchQuery, setSearchQuery] = useState("");
  const [duration, setDuration] = useState("30");
  const [level, setLevel] = useState("beginner");
  const [planType, setPlanType] = useState("short");
  const [storePlan, setStorePlan] = useState(null);

  
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      
      // Try to fetch today's plan
      try {
        const res = await studyPlanApi.getTodayPlan();
        setTodayPlan(res?.data || null);
        console.log("Today's plan fetched:", res?.data?.activities);
      } catch (error) {
        console.log("Today plan not available");
      }

      // Try to fetch long-term plan
      try {
        const res = await studyPlanApi.getPlans();
        if (res?.data && Array.isArray(res.data)) {
          setLongTermPlan(res.data[0].datalongTermPlan);
        } else if (res?.data) {
          setLongTermPlan(res.data);
          setShortTermPlan(res.data.shortTermPlan);

       
        }
      } catch (error) {
        console.log("Long-term plan not available");
      }
    } catch (error) {
      console.error("Plan fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!searchQuery.trim() && !duration) return;
    setGenerating(true);
    console.log("Generating plan with:", { searchQuery, level, duration, planType });
    try {
      if (planType === "short") {
        const res = await studyPlanApi.generateShortTermPlan(
          searchQuery,
          duration,
          level,
        );
        if (res?.data) {
          setShortTermPlan(res.data);
          console.log("Short-term plan generated:", res.data);
          setActiveTab("short");
        }
      } else {
        console.log("Generating long-term plan with:", { searchQuery, level, duration });
        const res = await studyPlanApi.generateLongTermPlan(
          searchQuery,
          level,
          duration,
        );
        if (res?.data) {
          setLongTermPlan(res.data);
          setActiveTab("long");
          console.log("Long-term plan generated:", res.data);
        }
      }
    } catch (error) {
      console.error("Generate plan failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  const completeDay = async () => {
    try {
      if (!todayPlan?.planId || !todayPlan?.day)
        return;

      await studyPlanApi.completeDay(
        todayPlan.planId,
        todayPlan.day
      );

      setCompleted(true);
    } catch (error) {
      console.error(error);
    }
  };

  const schedule = (() => {
    if (!todayPlan) return [];

    // Prefer new shape: activities array (from API), fall back to old tasks: string[]
    const activities = (todayPlan as any).activities;
    if (Array.isArray(activities) && activities.length) {
      return activities.map((act: any, idx: number) => {
        const title = act.title || act.name || act.topic || "";
        const subject = detectSubject(`${todayPlan.focus || ""} ${title} ${act.type || ""}`);
        const Icon = iconMap[subject] || BookOpen;

        // Simple time slot assignment: start at 9:00 and increment by index
        const hour = 9 + idx;
        const meridiem = hour < 12 ? "AM" : "PM";
        const displayHour = hour <= 12 ? hour : hour - 12;

        // Normalize duration display
        const duration =
          typeof act.duration === "number"
            ? `${act.duration} min`
            : typeof act.duration === "string"
            ? act.duration
            : title.length > 70
            ? "45 min"
            : "30 min";

        return {
          time: `${displayHour}:00 ${meridiem}`,
          subject: subject.toUpperCase(),
          topic: title,
          duration,
          icon: Icon,
        };
      });
    }

    // Fallback for older shape: tasks is array of strings
    return (
      todayPlan.tasks?.map((task: string, index: number) => {
        const subject = detectSubject(`${todayPlan.focus} ${task}`);
        const Icon = iconMap[subject] || BookOpen;

        return {
          time: `${9 + index}:00 ${index < 3 ? "AM" : "PM"}`,
          subject: subject.toUpperCase(),
          topic: task,
          duration: task.length > 70 ? "45 min" : "30 min",
          icon: Icon,
        };
      }) || []
    );
  })();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      {/* ==================== HEADER SECTION ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-neon-blue" />
            Study Planner
          </h1>
          <p className="text-sm text-muted-foreground">
            AI generated daily roadmap for efficient learning
          </p>
        </div>

        {/* Search & Generate Plan */}
        <div className="glass p-4 rounded-xl mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flexdirection-row w-full ">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search or enter learning goal (e.g., Machine Learning, Semiconductors)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" }
                className="pl-10 bg-background/50 w-full "
              />
              <Input 
                type="number"
                placeholder="time duration in days"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleGeneratePlan()}
                className="pl-10 bg-background/50 w-full "
              />
              <select className="pl-4 bg-background/50 text-white w-45 h- whitespace-nowrap rounded-md border border-gray-600" name="type" id="type" onChange={(e) => setPlanType(e.target.value)}>
              <option  value="short">shortTermPlan</option>
              <option  value="long">longTermPlan</option>
              </select>
            </div>
            <Button
              onClick={handleGeneratePlan}
              disabled={generating || !searchQuery.trim()}
              className="bg-gradient-to-r from-neon-blue to-neon-cyan text-black font-semibold hover:shadow-lg hover:shadow-neon-blue/50"
            >
              {generating ? "Generating..." : "Generate Plan"}
            </Button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="glass p-8 rounded-xl text-center">
          <p className="text-muted-foreground">Loading your study plans...</p>
        </div>
      ) : (
        <>
          {/* ==================== STATS SECTION ==================== */}
          {(longTermPlan || shortTermPlan) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            >
              {/* Progress Stat */}
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Progress</p>
                    <p className="text-2xl font-bold text-neon-green">
                      {Math.round(Math.random() * 40) + 20}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-neon-green opacity-50" />
                </div>
              </div>

              {/* Topics Stat */}
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Topics</p>
                    <p className="text-2xl font-bold text-neon-blue">
                      {longTermPlan?.months?.[0]?.topics?.length ||
                        shortTermPlan?.topics?.length ||
                        0}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-neon-blue opacity-50" />
                </div>
              </div>

              {/* Duration Stat */}
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="text-2xl font-bold text-neon-violet">
                      {longTermPlan?.duration || shortTermPlan?.duration  || longTermPlan?.longTermPlan?.totalDays ||"N/A"}
                    </p>
                  </div>
                  <Flame className="h-8 w-8 text-neon-violet opacity-50" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== CONTENT SECTION ==================== */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {todayPlan && (
                <TabsTrigger value="today">Today's Plan</TabsTrigger>
              )}
              {shortTermPlan && (
                <TabsTrigger value="short">Short-term</TabsTrigger>
              )}
              {longTermPlan && (
                <TabsTrigger value="long">Long-term</TabsTrigger>
              )}
            </TabsList>

            {/* Today's Plan Tab */}
            {todayPlan && (
              <TabsContent value="today">
                <div className="glass p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-neon-violet" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {todayPlan.longTermTopic + " and " + todayPlan.shortTermTopic || "Today's Schedule"
 }
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Day {todayPlan.day} • {todayPlan.focusArea}
                  </p>

                  {schedule.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No tasks found
                    </p>
                  )}

                  <div className="space-y-3">
                    {schedule.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="glass p-4 hover-glow flex items-center gap-4"
                      >
                        <div className="text-xs text-muted-foreground w-16 font-mono">
                          {item.time}
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center">
                          <item.icon className="h-5 w-5 text-primary-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {item.subject}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.topic}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{item.duration}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {todayPlan && (
                    <button
                      onClick={completeDay}
                      disabled={completed}
                      className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-black font-semibold disabled:opacity-50"
                    >
                      {completed ? (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          Completed
                        </span>
                      ) : (
                        "Mark Day Complete"
                      )}
                    </button>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Short-term Plan Tab */}
            {shortTermPlan && (
              <TabsContent value="short">
                <div className="space-y-4">
                  <div className="glass p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-neon-green" />
                      <h2 className="text-xl font-bold text-foreground">
                        {shortTermPlan.title}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Goal: {shortTermPlan.goal } • Level: {shortTermPlan.level}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {shortTermPlan.duration}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {shortTermPlan.topics?.map((dayPlan, idx) => {
                      const topicName =
                        typeof dayPlan.topic === "string"
                          ? dayPlan.topic
                          : dayPlan.topic?.name || "";

                      const subject = detectSubject(topicName);
                      const Icon = iconMap[subject] || BookOpen;

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="glass p-4 rounded-lg hover-glow flex items-start gap-4"
                        >
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-blue to-neon-violet flex items-center justify-center flex-shrink-0">
                            <Icon className="h-6 w-6 text-white" />
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              Day {dayPlan.day}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {topicName}
                            </p>

                            {typeof dayPlan.topic === "object" && (
                              <>
                                {dayPlan.topic?.concept && (
                                  <p className="text-xs text-neon-blue mt-2">
                                    Concept: {dayPlan.topic.concept}
                                  </p>
                                )}
                                {dayPlan.topic?.practical && (
                                  <p className="text-xs text-neon-green mt-1">
                                    Practical: {dayPlan.topic.practical}
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Long-term Plan Tab with Accordions and Week Cards */}
            {longTermPlan && (
              <TabsContent value="long">
                <div className="space-y-4">
                  {/* Plan Header */}
                  <div className="glass p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-neon-violet" />
                      <h2 className="text-xl font-bold text-foreground">
                        {longTermPlan.title}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Goal: {longTermPlan.goal|| longTermPlan.longTermPlan?.goal || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Level: {longTermPlan.level|| "Medium"}
                    </p>
                    <p className="text-sm text-neon-green font-medium">
                      Total Duration: {longTermPlan.duration|| longTermPlan.longTermPlan?.totalDays || "N/A"}
                    </p>
                  </div>

                  {/* Month Accordions */}
                  <Accordion type="single" collapsible defaultValue="month-0">
                    {longTermPlan.longTermPlan.roadmap.months.map((month, monthIdx) => (
                      <AccordionItem
                        key={monthIdx}
                        value={`month-${monthIdx}`}
                        className="glass rounded-xl overflow-hidden mb-3"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/50">
                          <div className="flex items-center gap-3 text-left">
                            <Calendar className="h-5 w-5 text-neon-blue flex-shrink-0" />
                            <div>
                              <p className="font-bold text-foreground">
                                Month {month.month}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {month.summary}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-6 py-4 border-t border-border">
                          {/* Month Info */}
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-foreground mb-2">
                              Focus Areas:
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
                              {month.focus}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {month.topics?.map((topic, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-3 py-1 rounded-full bg-neon-blue/10 text-neon-blue"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>

                            <p className="text-xs text-neon-green font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {month.milestone}
                            </p>
                          </div>

                          {/* Week Cards */}
                          <div className="space-y-3 mt-4">
                            {month.weeks?.map((week, weekIdx) => (
                              <motion.div
                                key={weekIdx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: weekIdx * 0.05 }}
                                className="border border-neon-cyan/20 rounded-lg p-4 bg-background/30 hover:border-neon-cyan/50 transition-colors"
                              >
                                {/* Week Header */}
                                <div className="mb-3">
                                  <p className="text-sm font-bold text-neon-cyan flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Week {week.week}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {week.summary}
                                  </p>
                                </div>

                                {/* Day Timeline Grid */}
                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-foreground mb-2">
                                    Daily Topics:
                                  </p>
                                  <div className="grid grid-cols-7 gap-1">
                                    {week.days?.map((day, dayIdx) => {
                                      const subject = detectSubject(
                                        typeof day.topic === "string"
                                          ? day.topic
                                          : day.topic?.name
                                      );
                                      const Icon =
                                        iconMap[subject] || BookOpen;

                                      return (
                                        <motion.div
                                          key={dayIdx}
                                          whileHover={{ scale: 1.05 }}
                                          className="p-2 rounded-lg bg-gradient-to-br from-neon-blue/10 to-neon-cyan/10 border border-neon-blue/20 text-center hover:border-neon-blue/50 transition-colors group cursor-pointer"
                                        >
                                          <p className="text-xs font-bold text-neon-blue group-hover:text-neon-cyan">
                                            D{day.day}
                                          </p>
                                          <Icon className="h-3 w-3 text-muted-foreground mx-auto mt-1 group-hover:text-neon-blue" />
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 group-hover:text-foreground">
                                            {typeof day.topic === "string"
                                              ? day.topic.slice(0, 8)
                                              : day.topic?.name?.slice(0, 8)}
                                          </p>
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Week Topics */}
                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-foreground mb-2">
                                    Topics:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {week.topics?.slice(0, 3).map((topic, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs px-2 py-1 rounded bg-neon-cyan/10 text-neon-cyan"
                                      >
                                        {topic}
                                      </span>
                                    ))}
                                    {week.topics && week.topics.length > 3 && (
                                      <span className="text-xs px-2 py-1 text-muted-foreground">
                                        +{week.topics.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Week Milestone */}
                                <p className="text-xs text-neon-green font-medium flex items-center gap-1">
                                  <Flame className="h-3 w-3" />
                                  {week.milestone}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Planner;