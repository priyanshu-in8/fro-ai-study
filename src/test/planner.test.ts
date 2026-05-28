import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockLongTermPlan, mockShortTermPlan, mockTodayPlan } from "./mockPlanData";

describe("Planner Component - Mock Data Tests", () => {
  describe("Long-term Plan (ML - 30 days)", () => {
    it("should have valid structure for long-term plan", () => {
      expect(mockLongTermPlan.success).toBe(true);
      expect(mockLongTermPlan.data).toBeDefined();
    });

    it("should have correct title and metadata", () => {
      const data = mockLongTermPlan.data;
      expect(data.title).toBe("ml Roadmap");
      expect(data.goal).toBe("ml");
      expect(data.level).toBe("beginner");
      expect(data.duration).toBe("30 days");
      expect(data.totalMonths).toBe(1);
    });

    it("should have months array with week structure", () => {
      const months = mockLongTermPlan.data.months;
      expect(Array.isArray(months)).toBe(true);
      expect(months.length).toBeGreaterThan(0);

      const month = months[0];
      expect(month.month).toBeDefined();
      expect(month.summary).toBeDefined();
      expect(month.focus).toBeDefined();
      expect(Array.isArray(month.topics)).toBe(true);
      expect(Array.isArray(month.weeks)).toBe(true);
    });

    it("should have weeks with days", () => {
      const weeks = mockLongTermPlan.data.months[0].weeks;
      expect(Array.isArray(weeks)).toBe(true);
      expect(weeks.length).toBeGreaterThan(0);

      const week = weeks[0];
      expect(week.week).toBeDefined();
      expect(Array.isArray(week.days)).toBe(true);
      expect(week.days.length).toBe(7);

      // Verify day structure
      const day = week.days[0];
      expect(day.day).toBeDefined();
      expect(typeof day.day).toBe("number");
      expect(day.topic).toBeDefined();
      expect(typeof day.topic).toBe("string");
    });

    it("should contain ML-related topics", () => {
      const allTopics = mockLongTermPlan.data.months[0].topics;
      const mlTopics = ["Machine Learning", "Learning", "Neural", "Regression"];
      
      const hasMLTopics = allTopics.some(topic => 
        mlTopics.some(ml => topic.includes(ml))
      );
      expect(hasMLTopics).toBe(true);
    });
  });

  describe("Short-term Plan (Semiconductor - 7 days)", () => {
    it("should have valid structure for short-term plan", () => {
      expect(mockShortTermPlan.success).toBe(true);
      expect(mockShortTermPlan.data).toBeDefined();
    });

    it("should have correct title and metadata", () => {
      const data = mockShortTermPlan.data;
      expect(data.title).toContain("Semiconductor");
      expect(data.goal).toBe("Semiconductor");
      expect(data.level).toBe("beginner");
      expect(data.duration).toBe("7 days");
    });

    it("should have exactly 7 days of topics", () => {
      const topics = mockShortTermPlan.data.topics;
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBe(7);
    });

    it("should have detailed topic structure for each day", () => {
      const topics = mockShortTermPlan.data.topics;
      
      topics.forEach((item, index) => {
        expect(item.day).toBe(index + 1);
        expect(item.topic).toBeDefined();
        expect(item.topic.name).toBeDefined();
        expect(item.topic.concept).toBeDefined();
        expect(item.topic.practical).toBeDefined();
        expect(typeof item.topic.name).toBe("string");
        expect(typeof item.topic.concept).toBe("string");
        expect(typeof item.topic.practical).toBe("string");
      });
    });

    it("should contain semiconductor-related topics", () => {
      const topics = mockShortTermPlan.data.topics;
      const firstTopic = topics[0];
      expect(firstTopic.topic.name).toContain("Semiconductor");
    });
  });

  describe("Today's Plan", () => {
    it("should have valid structure for today's plan", () => {
      expect(mockTodayPlan.success).toBe(true);
      expect(mockTodayPlan.data).toBeDefined();
    });

    it("should have correct title and focus", () => {
      const data = mockTodayPlan.data;
      expect(data.title).toContain("Study Session");
      expect(data.day).toBe(1);
      expect(data.focus).toBeDefined();
      expect(typeof data.focus).toBe("string");
    });

    it("should have array of tasks", () => {
      const tasks = mockTodayPlan.data.tasks;
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);

      tasks.forEach(task => {
        expect(typeof task).toBe("string");
        expect(task.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Data Integration Tests", () => {
    it("long-term plan should have 28 total days across weeks", () => {
      const weeks = mockLongTermPlan.data.months[0].weeks;
      const totalDays = weeks.reduce((sum, week) => sum + week.days.length, 0);
      expect(totalDays).toBe(28); // 4 weeks x 7 days
    });

    it("should handle multiple plan types without conflicts", () => {
      expect(mockLongTermPlan.data.goal).not.toBe(mockShortTermPlan.data.goal);
      expect(mockLongTermPlan.data.duration).not.toBe(mockShortTermPlan.data.duration);
    });

    it("should not have overlapping day numbers in a week", () => {
      const firstWeek = mockLongTermPlan.data.months[0].weeks[0];
      const dayNumbers = firstWeek.days.map(d => d.day);
      const uniqueDayNumbers = new Set(dayNumbers);
      expect(uniqueDayNumbers.size).toBe(dayNumbers.length);
    });
  });

  describe("API Response Format Validation", () => {
    it("should follow consistent response format", () => {
      const plans = [mockLongTermPlan, mockShortTermPlan, mockTodayPlan];
      
      plans.forEach(plan => {
        expect(plan).toHaveProperty("success");
        expect(plan).toHaveProperty("data");
        expect(typeof plan.success).toBe("boolean");
        expect(typeof plan.data).toBe("object");
      });
    });

    it("should have all required fields in data", () => {
      expect(mockLongTermPlan.data).toHaveProperty("title");
      expect(mockLongTermPlan.data).toHaveProperty("goal");
      expect(mockLongTermPlan.data).toHaveProperty("level");
      expect(mockLongTermPlan.data).toHaveProperty("duration");

      expect(mockShortTermPlan.data).toHaveProperty("title");
      expect(mockShortTermPlan.data).toHaveProperty("goal");
      expect(mockShortTermPlan.data).toHaveProperty("level");
      expect(mockShortTermPlan.data).toHaveProperty("duration");

      expect(mockTodayPlan.data).toHaveProperty("title");
      expect(mockTodayPlan.data).toHaveProperty("focus");
      expect(mockTodayPlan.data).toHaveProperty("tasks");
    });
  });
});

describe("Planner Component - Input Validation", () => {
  it("should validate ML input: goal=ml, days=30, level=beginner", () => {
    const input = { goal: "ml", days: 30, level: "beginner" };
    expect(input.goal).toBe("ml");
    expect(input.days).toBe(30);
    expect(input.level).toBe("beginner");
    expect(mockLongTermPlan.data.duration).toContain("30");
  });

  it("should validate Semiconductor input: goal=semiconductor, days=7, hoursPerDay=3, level=beginner", () => {
    const input = { goal: "semiconductor", days: 7, hoursPerDay: 3, level: "beginner" };
    expect(input.goal).toBe("semiconductor");
    expect(input.days).toBe(7);
    expect(input.hoursPerDay).toBe(3);
    expect(input.level).toBe("beginner");
    expect(mockShortTermPlan.data.topics.length).toBe(7);
  });
});
