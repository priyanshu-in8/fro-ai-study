# Planner Component - Data Flow Visualization

## Real API Response Example
```javascript
// What comes back from /api/ai/latest-plans
{
  "data": [
    {
      "data": {
        "longTermPlan": {
          "title": "ssc gd",                    // ← Header title
          "goal": "ssc gd",
          "type": "long-term",
          "progress": 0,                        // ← Stats: Progress %
          "completedDays": 0,
          "totalDays": 78,                      // ← Stats: Duration
          "createdAt": "2026-05-30T18:17:17.052Z",
          "roadmap": {
            "totalMonths": 3,
            "months": [
              {
                "month": 1,
                "summary": "Foundation topics...",  // ← Accordion trigger
                "focus": "Core concepts",           // ← Focus Areas (tags)
                "topics": ["Topic 1", "Topic 2"],  // ← Stats: Topics count
                "milestone": "Reach 50% ...",       // ← Milestone indicator
                "weeks": [
                  {
                    "week": 1,
                    "summary": "Week 1 intro...",   // ← Week header
                    "focus": "Basics",
                    "topics": ["T1", "T2"],
                    "milestone": "Complete week",   // ← Week milestone
                    "days": [
                      { "day": 1, "topic": "Intro" },      // ← Day timeline
                      { "day": 2, "topic": "Concepts" },
                      // ... 5 more days
                    ]
                  },
                  // ... more weeks
                ]
              },
              // ... more months
            ]
          }
        },
        "shortTermPlan": {
          "title": "ssc gd Roadmap",
          "goal": "ssc gd",
          "level": 3,
          "duration": "15 days",
          "topics": [
            {
              "day": 1,
              "topic": {
                "name": "Foundation",
                "concept": "Basic concepts",
                "practical": "Hands-on exercise"
              }
            },
            // ... 14 more days
          ]
        }
      }
    }
  ]
}
```

## UI Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDY PLANNER HEADER                          │
│  📅 Study Planner                                               │
│  "AI generated daily roadmap for efficient learning"            │
├─────────────────────────────────────────────────────────────────┤
│  [Search Goal...]      [Days]  [short▼]  [Generate Plan]       │
│  ↓ from handleGeneratePlan()                                   │
├─────────────────────────────────────────────────────────────────┤
│                     STATS SECTION (3 cards)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Progress     │  │ Topics       │  │ Duration     │          │
│  │ 23% 📈       │  │ 5 📖         │  │ 78 days 🔥   │          │
│  │ from:        │  │ from:        │  │ from:        │          │
│  │ progress     │  │ roadmap.     │  │ totalDays    │          │
│  │ field        │  │ months[0].   │  │ field        │          │
│  │              │  │ topics.len   │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                    CONTENT TABS                                  │
│  [Today's Plan]  [Short-term]  [Long-term]                     │
├─────────────────────────────────────────────────────────────────┤
│  LONG-TERM TAB (Currently visible)                              │
│                                                                  │
│  Plan Header:                                                   │
│  🎯 ssc gd (from: title)                                       │
│  Goal: ssc gd (from: goal)                                     │
│  Duration: 78 days (from: totalDays)                           │
│                                                                  │
│  Accordion Section:                                            │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ 📅 Month 1                                          │ ▼     │
│  │    "Foundation topics and core..."                  │       │
│  └─────────────────────────────────────────────────────┘       │
│    ↓ Expanded (from: roadmap.months[0])                        │
│    ┌──────────────────────────────────────────────────┐        │
│    │ Focus Areas: (tags from: month.topics)           │        │
│    │ [Topic 1] [Topic 2] [Topic 3] [Topic 4]          │        │
│    │                                                   │        │
│    │ ✅ Complete month goals (from: milestone)         │        │
│    │                                                   │        │
│    │ Week Card 1:                                     │        │
│    │ ┌─────────────────────────────────────────────┐  │        │
│    │ │ ⚡ Week 1 (from: week.week)                │  │        │
│    │ │ "Week 1 intro to topics..."                 │  │        │
│    │ │                                              │  │        │
│    │ │ Daily Topics: (from: week.days)             │  │        │
│    │ │ ┌───┬───┬───┬───┬───┬───┬───┐               │  │        │
│    │ │ │D1 │D2 │D3 │D4 │D5 │D6 │D7 │  Day grid   │  │        │
│    │ │ └───┴───┴───┴───┴───┴───┴───┘               │  │        │
│    │ │                                              │  │        │
│    │ │ Topics: (from: week.topics)                 │  │        │
│    │ │ [Core] [Basics] [Concepts]                  │  │        │
│    │ │                                              │  │        │
│    │ │ 🔥 Complete week (from: week.milestone)     │  │        │
│    │ └─────────────────────────────────────────────┘  │        │
│    │                                                   │        │
│    │ Week Card 2, 3, 4... (repeat for each week)    │        │
│    └──────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ 📅 Month 2                                          │ ▼     │
│  │    "Advanced topics and applications..."           │       │
│  └─────────────────────────────────────────────────────┘       │
│  (Collapsed - same structure when expanded)                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ 📅 Month 3                                          │ ▼     │
│  │    "Final concepts and project..."                 │       │
│  └─────────────────────────────────────────────────────┘       │
│  (Collapsed - same structure when expanded)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Access Paths

### Accessing Long-term Plan Data
```
longTermPlan
├── .title                          → "ssc gd"
├── .goal                           → "ssc gd"
├── .progress                       → 0 (Stats: Progress)
├── .totalDays                      → 78 (Stats: Duration)
└── .roadmap
    ├── .totalMonths                → 3
    └── .months[]
        ├── [0] (Month 1)
        │   ├── .month              → 1
        │   ├── .summary            → Month description
        │   ├── .focus              → Focus areas (for tags)
        │   ├── .topics[]           → Topic strings (Stats: Topics count)
        │   ├── .milestone          → "Reach 50%..."
        │   └── .weeks[]
        │       ├── [0] (Week 1)
        │       │   ├── .week       → 1
        │       │   ├── .summary    → Week description
        │       │   ├── .topics[]   → Week topics
        │       │   ├── .milestone  → "Complete week"
        │       │   └── .days[]
        │       │       └── [0]
        │       │           ├── .day   → 1
        │       │           └── .topic → "Intro to..."
        │       └── [1] (Week 2)
        │           └── ... (same structure)
        │
        ├── [1] (Month 2)
        │   └── ... (same structure)
        │
        └── [2] (Month 3)
            └── ... (same structure)
```

### Accessing Short-term Plan Data
```
shortTermPlan
├── .title                  → "ssc gd Roadmap"
├── .goal                   → "ssc gd"
├── .level                  → 3
├── .duration               → "15 days"
└── .topics[]
    ├── [0]
    │   ├── .day           → 1
    │   └── .topic
    │       ├── .name      → "Foundation"
    │       ├── .concept   → "Basic concepts"
    │       └── .practical → "Hands-on exercise"
    │
    ├── [1]
    │   └── ... (same structure)
    │
    └── [14]
        └── ... (Day 15 data)
```

## Component Flow

```
1. Initial Load
   ↓
   fetchPlans()
   ↓
   API: GET /ai/latest-plans
   ↓
   Response includes both longTermPlan & shortTermPlan
   ↓
   setLongTermPlan(res.data[0].data.longTermPlan)
   setShortTermPlan(res.data[0].data.shortTermPlan)

2. User Generates New Plan
   ↓
   handleGeneratePlan()
   ↓
   API: POST /ai/generate-long-term-plan or /generate-short-term-plan
   ↓
   setLongTermPlan(res.data) or setShortTermPlan(res.data)
   ↓
   Tab switches to show generated plan

3. Rendering
   ↓
   Long-term Tab: Renders roadmap.months with accordions
   ↓
   Each month: Shows weeks with day timeline
   ↓
   Each week: 7-day grid showing daily topics
```

## Safe Access Patterns Used

```typescript
// Example 1: Access with fallback
month.month || monthIdx + 1
// Returns month.month if exists, otherwise monthIdx + 1

// Example 2: Optional chaining with map
longTermPlan?.roadmap?.months?.map((month) => ...)
// Returns undefined if any step is null, won't error

// Example 3: Conditional rendering
{month.topics?.map(...)}
// Only renders if month.topics exists and is an array

// Example 4: Display fallback
month.summary || `Month ${monthIdx + 1} curriculum`
// Uses custom text if summary not provided by API
```

---

This visualization helps understand how real API data flows through the component and gets rendered in the UI.
