/* =========================================================
   CLEAN PRODUCTION READY services/api.ts
========================================================= */

const API_URL =
  import.meta.env.DEV
    ? "/api"
    : import.meta.env.VITE_API_URL ||
      "http://localhost:4000/api";

/* =========================================================
   TYPES
========================================================= */

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  xpPoints?: number;
  level?: number;
  streakDays?: number;
  educationType?: string;
  educationLevel?: string;
  subjects?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

/* =========================================================
   STORAGE
========================================================= */

const storage = {
  getToken: () =>
    localStorage.getItem("token"),

  getUser: () => {
    const user =
      localStorage.getItem("user");

    return user
      ? JSON.parse(user)
      : null;
  },

  setAuth: (
    token: string,
    user: User
  ) => {
    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );
  },

  clear: () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );
  },
};

/* =========================================================
   REQUEST CORE
========================================================= */

async function request(
  endpoint: string,
  options: RequestInit = {},
  timeout = 30000
) {
  const controller =
    new AbortController();

  const timer = setTimeout(
    () =>
      controller.abort(),
    timeout
  );

  const token =
    storage.getToken();

  try {
    const response =
      await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,
          credentials:
            "include",
          signal:
            controller.signal,
          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),

            ...(options.headers ||
              {}),
          },
        }
      );

    const data =
      await response
        .json()
        .catch(
          () => ({})
        );

    /* Protected routes only */
    if (!response.ok) {
  throw new Error(
    data.message ||
      "Request failed"
  );
}

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Request failed"
      );
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

/* =========================================================
   AUTH API
========================================================= */

export const authApi = {
  register: async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string,
    educationType: string,
    educationLevel: string
  ) => {
    return await request(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(
          {
            name,
            email,
            password,
            passwordConfirm,
            educationType,
            educationLevel,
          }
        ),
      }
    );
  },

  login: async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    return await request(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(
          {
            email,
            password,
          }
        ),
      }
    );
  },

  logout: async () => {
    return await request(
      "/auth/logout",
      {
        method: "POST",
      }
    );
  },

  getProfile:
    async () => {
      return await request(
        "/auth/profile"
      );
    },

  forgotPassword:
    async (
      email: string
    ) => {
      return await request(
        "/auth/forgot-password",
        {
          method:
            "POST",
          body: JSON.stringify(
            {
              email,
            }
          ),
        }
      );
    },
    googleLogin: async (
  token: string
): Promise<AuthResponse> => {
  return await request(
    "/auth/google",
    {
      method: "POST",
      body: JSON.stringify({
        token,
      }),
    }
  );
},

  resetPassword:
    async (
      token: string,
      password: string,
      passwordConfirm: string
    ) => {
      return await request(
        "/auth/reset-password",
        {
          method:
            "POST",
          body: JSON.stringify(
            {
              token,
              password,
              passwordConfirm,
            }
          ),
        }
      );
    },

  verifyEmail: async (token: string) => {
  return await request(
    `/auth/verify-email?token=${token}`,
    {
      method: "GET",
    }
  );
},
};

/* =========================================================
   DASHBOARD API
========================================================= */

export const dashboardApi = {
  getDashboard:
    async () => {
      return await request(
        "/auth/dashboard"
      );
    },

  getAccuracyStats:
    async () => {
      return await request(
        "/auth/accuracy-stats"
      );
    },
};

/* =========================================================
   QUIZ API
========================================================= */

export const quizApi = {
  generateQuiz:
    async (
      topic: string,
      numQuestions = 5
    ) => {
      return await request(
        "/ai/quiz",
        {
          method:
            "POST",
          body: JSON.stringify(
            {
              topic,
              numQuestions,
            }
          ),
        }
      );
    },

  submitQuizResult:
    async (
      topic: string,
      score: number,
      total: number
    ) => {
      return await request(
        "/ai/quiz/submit",
        {
          method:
            "POST",
          body: JSON.stringify(
            {
              topic,
              score,
              total,
            }
          ),
        }
      );
    },

  recommendQuiz:
    async () => {
      return await request(
        "/ai/recommend-quiz"
      );
    },
};

/* =========================================================
   AI API
========================================================= */

export const aiApi = {
  generateFlashcards:
    async (
      topic: string,
      numCards = 8
    ) => {
      return await request(
        "/ai/flashcards",
        {
          method:
            "POST",
          body: JSON.stringify(
            {
              topic,
              numCards,
            }
          ),
        }
      );
    },
 evaluateCode: async (
  problem: string,
  code: string,
  testCases: { input: string; expectedOutput: string }[],
  language: string = "javascript"
) => {
  return await request("/ai/coding/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      problem: problem,
      code: code,
      
      language: language
    }),
  });
},

  generateCoding:
    async (
      topic: string,
      difficulty = "medium"
    ) => {
      return await request(
        "/ai/coding",
        {
          method:
            "POST",
          body: JSON.stringify(
            {
              topic,
              difficulty,
            }
          ),
        }
      );
    },

  runCode: async (
    code: string,
    language: string = "javascript",
    stdin: string = ""
  ) => {
    return await request("/ai/coding/run", {
      method: "POST",
      body: JSON.stringify({
        code,
        language,
        stdin
      })
    });
  },

  generateChat:
    async (
      message: string
    ) => {
      return await request(
        "/ai/chat",
        {
          method:
            "POST",
          body: JSON.stringify(
            {
              message,
            }
          ),
        }
      );
    },
};

/* =========================================================
   STUDY PLAN API
========================================================= */

export const studyPlanApi = {
  generatePlan:
    async (
      data: any
    ) => {
      return await request(
        "/ai/study-plan",
        {
          method:
            "POST",
          body: JSON.stringify(
            data
          ),
        }
      );
    },

  getPlans:
    async () => {
      return await request(
        "/ai/study-plans"
      );
    },

  getTodayPlan:
    async () => {
      return await request(
        "/ai/today-plan"
      );
    },

  completeDay:
    async (
      planId: string,
      dayNumber: number
    ) => {
      return await request(
        `/ai/study-plan/${planId}/${dayNumber}`,
        {
          method:
            "PATCH",
        }
      );
    },

  generateShortTermPlan:
    async (
      goal: string,
      duration: string,
      level: string
    ) => {
      return await request(
        "/ai/generate-short-term-plan",
        {
          method:
            "POST",
          body: JSON.stringify({
  goal,
  days: Number(duration),
  hoursPerDay: 3,
  level,
}),
        }
      );
    },

  generateLongTermPlan:
    async (
      goal: string,
      level: string,
      duration: string,
    ) => {
      return await request(
        "/ai/generate-long-term-plan",
        {
          method:
            "POST",
         body: JSON.stringify({
  goal,
  days: duration,
  level,
}),
        }
      );
    },
};

/* =========================================================
   MISSIONS
========================================================= */

export const missionApi = {
  getMissions:
    async () => {
      return await request(
        "/auth/missions"
      );
    },

  completeMission:
    async (
      id: string
    ) => {
      return await request(
        `/auth/missions/${id}`,
        {
          method:
            "PATCH",
        }
      );
    },
};

/* =========================================================
   OTHER APIs
========================================================= */

export const leaderboardApi = {
  getLeaderboard:
    async () => {
      return await request(
        "/auth/leaderboard"
      );
    },
};

export const achievementApi = {
  getAchievements:
    async () => {
      return await request(
        "/auth/achievements"
      );
    },
};

export const analyticsApi = {
  getStats:
    async () => {
      return await request(
        "/auth/accuracy-stats"
      );
    },
};