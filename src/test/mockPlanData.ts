// Test data for Planner component
// This file contains mock API responses for testing

export const mockLongTermPlan = {
  success: true,
  data: {
    title: "ml Roadmap",
    goal: "ml",
    level: "beginner",
    duration: "30 days",
    totalMonths: 1,
    months: [
      {
        month: 1,
        summary: "This month focuses on Introduction to Machine Learning Basics",
        focus: "ML Fundamentals and Applications",
        topics: [
          "Introduction to Machine Learning Basics",
          "Understanding Supervised Learning",
          "Unsupervised Learning and Clustering",
          "Regression and Linear Models",
          "Introduction to Neural Networks"
        ],
        milestone: "Complete mastery of 5 major topics",
        weeks: [
          {
            week: 1,
            summary: "Week 1: ML Basics",
            focus: "Fundamentals",
            topics: ["Introduction to Machine Learning Basics", "Understanding Supervised Learning"],
            milestone: "Week 1 Complete",
            days: [
              { day: 1, topic: "Introduction to Machine Learning Basics" },
              { day: 2, topic: "Understanding Supervised Learning" },
              { day: 3, topic: "Unsupervised Learning and Clustering" },
              { day: 4, topic: "Regression and Linear Models" },
              { day: 5, topic: "Introduction to Neural Networks" },
              { day: 6, topic: "Deep Learning Fundamentals" },
              { day: 7, topic: "Training and Testing ML Models" }
            ]
          },
          {
            week: 2,
            summary: "Week 2: Advanced Topics",
            focus: "Advanced Concepts",
            topics: ["Model Evaluation", "Hyperparameter Tuning"],
            milestone: "Week 2 Complete",
            days: [
              { day: 8, topic: "Model Evaluation and Hyperparameter Tuning" },
              { day: 9, topic: "Introduction to Natural Language Processing" },
              { day: 10, topic: "Machine Learning Project Planning" },
              { day: 11, topic: "Python for ML" },
              { day: 12, topic: "Data Preprocessing" },
              { day: 13, topic: "Feature Engineering" },
              { day: 14, topic: "Linear Regression Implementation" }
            ]
          },
          {
            week: 3,
            summary: "Week 3: Implementation",
            focus: "Hands-on Practice",
            topics: ["Logistic Regression", "Neural Networks"],
            milestone: "Week 3 Complete",
            days: [
              { day: 15, topic: "Logistic Regression Theory" },
              { day: 16, topic: "Logistic Regression Implementation" },
              { day: 17, topic: "Neural Network Basics" },
              { day: 18, topic: "Building Neural Networks" },
              { day: 19, topic: "Convolutional Neural Networks" },
              { day: 20, topic: "Recurrent Neural Networks" },
              { day: 21, topic: "Transfer Learning" }
            ]
          },
          {
            week: 4,
            summary: "Week 4: Projects",
            focus: "Real-world Applications",
            topics: ["Project Planning", "Deployment"],
            milestone: "Month Complete",
            days: [
              { day: 22, topic: "ML Project Case Study 1" },
              { day: 23, topic: "ML Project Case Study 2" },
              { day: 24, topic: "Data Pipeline Design" },
              { day: 25, topic: "Model Deployment" },
              { day: 26, topic: "Monitoring and Maintenance" },
              { day: 27, topic: "Ethics in ML" },
              { day: 28, topic: "Future of ML" }
            ]
          }
        ]
      }
    ]
  }
};

export const mockShortTermPlan = {
  success: true,
  data: {
    title: "Semiconductor Study Roadmap",
    goal: "Semiconductor",
    level: "beginner",
    duration: "7 days",
    topics: [
      {
        day: 1,
        topic: {
          name: "Introduction to Semiconductors",
          concept: "Semiconductor Basics",
          practical: "Understanding Semiconductor Materials"
        }
      },
      {
        day: 2,
        topic: {
          name: "Doping and Impurities",
          concept: "Doping Process",
          practical: "Calculating Doping Concentrations"
        }
      },
      {
        day: 3,
        topic: {
          name: "PN Junctions and Diodes",
          concept: "PN Junction Theory",
          practical: "Designing Basic Diodes"
        }
      },
      {
        day: 4,
        topic: {
          name: "Transistors and Amplification",
          concept: "Transistor Operation",
          practical: "Analyzing Transistor Circuits"
        }
      },
      {
        day: 5,
        topic: {
          name: "Integrated Circuits and Fabrication",
          concept: "IC Fabrication Process",
          practical: "Designing Simple ICs"
        }
      },
      {
        day: 6,
        topic: {
          name: "Digital Logic and Gates",
          concept: "Digital Logic Fundamentals",
          practical: "Designing Basic Digital Circuits"
        }
      },
      {
        day: 7,
        topic: {
          name: "Microcontrollers and Applications",
          concept: "Microcontroller Architecture",
          practical: "Implementing Microcontroller Projects"
        }
      }
    ]
  }
};

export const mockTodayPlan = {
  success: true,
  data: {
    title: "Today's Study Session",
    day: 1,
    focus: "Introduction to Machine Learning",
    tasks: [
      "What is Machine Learning and its types",
      "Supervised Learning vs Unsupervised Learning",
      "Understanding the ML workflow",
      "Setting up your Python environment",
      "Introduction to libraries: NumPy, Pandas, Scikit-learn"
    ]
  }
};
