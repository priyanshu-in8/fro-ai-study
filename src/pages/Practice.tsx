import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Brain, Zap, Code, Flame, Crown, ChevronRight, Play, CheckCircle2, XCircle, Clock, BookOpen, Sparkles, Trophy, Target, RotateCcw } from "lucide-react";
import { aiApi, quizApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "postcss";
import {
  useParams,
} from "react-router-dom";

const defaultQuestions = [
  { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1, explanation: "Binary search halves the search space, resulting in O(log n)." },
  { question: "Which data structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], correct: 1, explanation: "Queue (FIFO) processes elements in order added." },
  { question: "What is normalization in DBMS?", options: ["Adding redundancy", "Removing redundancy", "Creating indexes", "Joining tables"], correct: 1, explanation: "Normalization reduces redundancy and improves data integrity." },
];

function XPGainAnimation({ amount, show }: { amount: number; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 0, y: -50, scale: 1.2 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="fixed top-20 right-8 pointer-events-none z-50">
          <div className="bg-gradient-to-r from-neon-green to-neon-cyan text-white px-6 py-3 rounded-full font-bold text-lg shadow-2xl">+{amount} XP</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatsHeader({ xp, level, streak }: { xp: number; level: number; streak: number }) {
  const currentProgress = ((xp % 1000) / 1000) * 100;
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-neon-violet" />
            Practice Zone
          </h1>
          <p className="text-muted-foreground mt-1">Master your skills and earn rewards</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-neon-blue" />
            <div><p className="text-xs text-muted-foreground">XP</p><p className="text-lg font-bold">{xp}</p></div>
          </div>
          <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-neon-violet" />
            <div><p className="text-xs text-muted-foreground">Level</p><p className="text-lg font-bold">{level}</p></div>
          </div>
          <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-neon-orange" />
            <div><p className="text-xs text-muted-foreground">Streak</p><p className="text-lg font-bold">{streak}</p></div>
          </div>
        </div>
      </div>
      <div className="glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">Level Progress</span><span className="text-xs text-muted-foreground">{xp % 1000} / 1000 XP</span></div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-neon-violet to-neon-pink" initial={{ width: 0 }} animate={{ width: `${currentProgress}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>
    </motion.div>
  );
}

function QuizSection({ generatedQuiz, currentQ, selected, score, finished, comboStreak, timeLeft, aiError, onSelect, onNext, onRetry }: any) {
  const questions = generatedQuiz?.questions || defaultQuestions;
  if (finished) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl mx-auto text-center">
        <Trophy className="h-20 w-20 mx-auto mb-4 text-neon-yellow" />
        <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-muted-foreground mb-6">You scored {score} out of {questions.length}</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass p-4 rounded-xl"><p className="text-sm text-muted-foreground">Score</p><p className="text-3xl font-bold text-neon-green">{score}</p></div>
          <div className="glass p-4 rounded-xl"><p className="text-sm text-muted-foreground">Accuracy</p><p className="text-3xl font-bold text-neon-blue">{accuracy}%</p></div>
          <div className="glass p-4 rounded-xl"><p className="text-sm text-muted-foreground">Streak</p><p className="text-3xl font-bold text-neon-orange">{comboStreak}</p></div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onRetry} className="w-full glass p-4 rounded-xl bg-gradient-to-r from-neon-violet to-neon-pink text-white font-bold">
          <RotateCcw className="h-5 w-5 inline mr-2" />
          Retake Quiz
        </motion.button>
      </motion.div>
    );
  }
  const currentQuestion = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      {aiError && <div className="mb-4 p-3 rounded bg-destructive/10 text-destructive text-sm">{aiError}</div>}
      <div className="glass p-4 rounded-xl mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Question {currentQ + 1} of {questions.length}</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Score: {score}</span>
            <span className={`text-sm font-bold flex items-center gap-1 ${timeLeft > 10 ? "text-neon-green" : "text-neon-red"}`}>
              <Clock className="h-4 w-4" /> {timeLeft}s
            </span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-neon-violet to-neon-pink" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
        {comboStreak > 0 && <div className="mt-3 text-center"><span className="inline-block bg-gradient-to-r from-neon-orange to-neon-yellow text-white px-4 py-1 rounded-full text-sm font-bold">🔥 {comboStreak} Combo</span></div>}
      </div>
      <div className="glass p-6 rounded-xl mb-6">
        <h3 className="text-xl font-bold mb-6">{currentQuestion.question}</h3>
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option: string, index: number) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !selected && onSelect(index)}
              disabled={selected !== null}
              className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                selected === index
                  ? index === currentQuestion.correctAnswer
                    ? "bg-green-500/20 border-2 border-green-500"
                    : "bg-red-500/20 border-2 border-red-500"
                  : selected !== null && index === currentQuestion.correctAnswer
                  ? "bg-green-500/20 border-2 border-green-500"
                  : "glass hover:bg-muted/50 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {selected === index && (selected === currentQuestion.correct ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />)}
                {selected !== null && index === currentQuestion.correctAnswer && selected !== index && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </div>
            </motion.button>
          ))}
        </div>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-muted/50 p-4 rounded-lg mb-6 border-l-4 border-neon-blue">
            <p className="text-sm font-semibold mb-2">Explanation:</p>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </motion.div>
        )}
      </div>
      {selected !== null && (
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onNext} className="w-full glass p-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-white font-bold flex items-center justify-center gap-2">
          {currentQ === questions.length - 1 ? "See Results" : "Next Question"}
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      )}
    </motion.div>
  );
}

function FlashcardsSection({
  onXpGain,
  initialTopic,
}: {
  onXpGain: (amount: number) => void;
  initialTopic?: string;
}) {
 const [cards, setCards] = useState<any[]>([]);
const [topic, setTopic] =
  useState(initialTopic || "");
const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const { toast } = useToast();
   const [generated, setGenerated] = useState(false);
   useEffect(() => {

  if (
    initialTopic &&
    !generated
  ) {

    handleGenerateFlashcards();

  }

}, [initialTopic]);


const handleGenerateFlashcards = async () => {
  if (!topic.trim()) return;

  setLoading(true);
  try {
    const res = await aiApi.generateFlashcards(topic, 8);

    console.log("FLASH API:", res);

    // 🔥 IMPORTANT
    setCards(res.data?.flashcards || []);

    setCurrentIndex(0);
    setIsFlipped(false);
    setGenerated(true);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  const handleKnown = () => {
    setKnownCount(knownCount + 1);
    onXpGain(5);
    toast({ title: "Great!", description: "+5 XP" });
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleRevise = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const currentCard = cards[currentIndex] || {};
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
        <div className="glass p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-3"><span className="text-sm font-semibold">Card {currentIndex + 1} of {cards.length}</span><span className="text-sm text-muted-foreground">Mastered: {knownCount}</span></div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan" animate={{ width: `${progress}%` }} />
          </div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setIsFlipped(!isFlipped)} className="h-64 mb-6 cursor-pointer">
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full"
            style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            <div className="w-full h-full glass p-8 rounded-2xl flex flex-col items-center justify-center text-center absolute" style={{ backfaceVisibility: "hidden" }}>
              <p className="text-2xl font-bold">{currentCard.front}</p>
              <p className="text-sm text-muted-foreground mt-4">Click to reveal</p>
            </div>
            <div className="w-full h-full glass p-8 rounded-2xl flex flex-col items-center justify-center text-center absolute bg-gradient-to-br from-neon-violet/20 to-neon-pink/20" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <p className="text-2xl font-bold">{currentCard.back}</p>
            </div>
          </motion.div>
        </motion.div>
       
      </motion.div>

      {generated ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleKnown} className="glass p-4 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-white font-bold">Known</motion.button>
          
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRevise} className="glass p-4 rounded-xl bg-gradient-to-r from-neon-violet to-neon-cyan text-white font-bold">Revise</motion.button>

        </div>
      ) : <div className="grid grid-cols-2 gap-4">
          <input
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
      disabled={loading || generated}
      placeholder="Enter topic (e.g. Stack)"
      className="w-full px-4 py-3 rounded-lg bg-muted/40"
    />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerateFlashcards} className="glass p-4 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-white font-bold">Generate Flashcards</motion.button>
        </div> }
    </>
  );
}


type TestCase = {
  input: string;
  expectedOutput: string;
};

function CodingSection({
  onXpGain,
  initialTopic,
}: {
  onXpGain: (
    amount: number
  ) => void;
  initialTopic?: string;
}){
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("C++");
  const [code, setCode] = useState("# Write your solution here\n");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
const [testCases, setTestCases] = useState<TestCase[]>([]);
  const { toast } = useToast();
  const [generated, setGenerated] = useState(false);

  ////////run

  const [correct, setCorrect] = useState("");
  const [summary, setSummary] = useState("")

  useEffect(() => {

  if (initialTopic) {

    setTopic(
      initialTopic
    );

  }

}, [initialTopic]);
useEffect(() => {

  if (
    topic &&
    !generated
  ) {

    handleGenerateCode();

  }

}, [topic]);




  const handleGenerateCode = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    try {
      // Simulate API call to run code
      const res =await aiApi.generateCoding(topic, "medium");
      console.log("CODE API:", res);
      setCode(res.data?.starterCode);
      setCode(res.data?.starterCode);
   
      
      
     
      setTitle(res.data?.title || "Generated Code");
      setDescription(res.data?.description || "No description");
      setTestCases(res.data?.examples|| []);
      setGenerated(true);

      onXpGain(50);
      toast({ title: "Code Executed!", description: "+50 XP" });
    } catch (err) {
      setOutput((err as any)?.message || "Error running code");
    } finally {
      setIsRunning(false);
    }
  };
 
  type TestCase = {
  input: string;
  output?: string | number;   // from API
  expected?: string | number; // for backend
};



 
const handleRun = async () => {
  const finalCode = code?.trim();

  if (!finalCode) {
    toast({
      title: "Error",
      description: "Solution code is required",
    });
    return;
  }

  if (!testCases?.length) {
    toast({
      title: "No Test Cases",
      description: "Generate or add test cases first",
    });
    return;
  }

  setIsRunning(true);

  const normalizeExpected = (val: any) => {
    try {
      if (typeof val === "string" && val.startsWith("[")) {
        return JSON.parse(val).join(" ");
      }
      return String(val ?? "");
    } catch {
      return String(val ?? "");
    }
  };

  const parseInput = (input: string) => {
    const arrMatch = input.match(/\[([^\]]+)\]/);
    const kMatch = input.match(/(\d+)\s*$/);

    if (!arrMatch || !kMatch) return null;

    const arr = arrMatch[1].split(",").map(Number);
    const k = parseInt(kMatch[1]);

    return { arr, k };
  };
   

  const formattedTestCases = testCases.map((tc: any) => {
    const parsed = parseInput(tc.input);

    if (parsed) {
      return {
        input: `${parsed.arr.length}\n${parsed.arr.join(" ")}\n${parsed.k}`,
        expectedOutput: normalizeExpected(
          tc.expectedOutput ?? tc.output
        )
      };
    }

    return {
      input: tc.input,
      expectedOutput: normalizeExpected(
        tc.expectedOutput ?? tc.output
      )
    };
  });

  console.log("FORMATTED TEST CASES:", formattedTestCases);

  try {
    const res = await aiApi.evaluateCode(
      description,
      finalCode,
      formattedTestCases,
      language
    );

    const evalData = res.data?.data;

    
     setSummary(evalData.summary)
    console.log(res);

  
    

    // Build detailed output with test results
    



 

  } catch (err: any) {
    console.error(err);
    setOutput(err?.response?.data?.message || err.message);
  } finally {
    setIsRunning(false);
  }
};

  return (<>


   
    {!generated && (
       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <input value={topic} onChange={(e) => setTopic(e.target.value)} className="glass p-4 rounded-xl mb-4 text-2xl font-bold" />
        <button onClick={handleGenerateCode} className="glass p-4 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-white font-bold">
          Generate Code
        </button>
       
      </motion.div>)}


{generated&&(
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-3">{title}</h3>
          <p className="text-muted-foreground mb-6 whitespace-pre-line">{description}</p>
          <div className="space-y-4"><h4 className="font-semibold">Test Cases:</h4>
            {testCases.map((test, i) => (
              <div key={i} className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Input: <span className="text-foreground font-mono">{test.input}</span></p>
                <p className="text-sm text-muted-foreground">Expected: <span className="text-foreground font-mono">{test.output ?? test.expected}</span></p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">Language:</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="glass px-3 py-2 rounded-lg text-sm">
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div className="glass p-4 rounded-xl overflow-hidden border border-border/50">
           <Editor
  value={code}
  height={400}
  onChange={(value) => setCode(value || "")}
/>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRun} disabled={isRunning} className="w-full glass p-4 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            <Play className="h-5 w-5" />
            {isRunning ? "Running..." : "Run Code"}
          </motion.button>
          {output && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass p-4 rounded-xl font-mono text-sm text-muted-foreground max-h-96 overflow-y-auto whitespace-pre-wrap break-words">
                {summary}
              </div>
              
              {/* Parse and display test results visually */}
              {output.includes("Test") && (
                <div className="glass p-4 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-3">Detailed Test Results:</h4>
                  <div className="space-y-2">
                    {output.split("\n").map((line, idx) => {
                      if (line.includes("✅ PASS")) {
                        return (
                          <div key={idx} className="flex items-start gap-2 p-2 rounded bg-green-500/10 border border-green-500/30">
                            <span className="text-green-400 flex-shrink-0">✅</span>
                            <span className="text-green-300 text-sm">{line}</span>
                          </div>
                        );
                      }
                      if (line.includes("❌ FAIL")) {
                        return (
                          <div key={idx} className="flex items-start gap-2 p-2 rounded bg-red-500/10 border border-red-500/30">
                            <span className="text-red-400 flex-shrink-0">❌</span>
                            <span className="text-red-300 text-sm">{line}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
)}

   
          </>
  );
}

export default function Practice() {
  const [activeTab, setActiveTab] = useState<"quiz" | "flashcard" | "coding">("quiz");
  const [userStats, setUserStats] = useState({ xp: 0, level: 1, streak: 0 });
  const [xpGain, setXpGain] = useState<number | null>(null);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [generatedQuiz, setGeneratedQuiz] = useState<any | null>(null);
  const [topic, setTopic] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { toast } = useToast();
  const {
    type,
    topic: urlTopic,
  } = useParams();
  useEffect(() => {

  if (!type) return;

  if (
    type === "quiz" ||
    type === "coding" ||
    type === "flashcard"
  ) {

    setActiveTab(type);

  }

  if (urlTopic) {

    setTopic(
      decodeURIComponent(urlTopic)
    );


    

  }


  if(type === "quiz"){
    setTopic(
      decodeURIComponent(urlTopic));

  }
  if(type === "coding"){
    setTopic(
      decodeURIComponent(urlTopic));

  }
  if( type === "flashcard"){
     setTopic(
      decodeURIComponent(urlTopic));
  }








}, [type, urlTopic]);
useEffect(() => {

  if (
    activeTab === "quiz" &&
    topic &&
    !generatedQuiz
  ) {

    handleGenerateQuiz();

  }

}, [activeTab, topic]);

  useEffect(() => {
    if (!finished && selected === null && activeTab === "quiz" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [finished, selected, activeTab, timeLeft]);

  const handleXpGain = (amount: number) => {
    setUserStats((prev) => ({ ...prev, xp: prev.xp + amount }));
    setXpGain(amount);
    setTimeout(() => setXpGain(null), 1500);
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    setLoadingAI(true);
    setAiError(null);
    try {
      const data = await quizApi.generateQuiz(topic, 25);
      setGeneratedQuiz(data.data);
      setCurrentQ(0);
      setSelected(null);
      setScore(0);
      setFinished(false);
      setComboStreak(0);
      setTimeLeft(30);
    } catch (err) {
      setAiError((err as any)?.message || "Failed to generate quiz");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = generatedQuiz ? idx === generatedQuiz.questions[currentQ].correctAnswer : idx === defaultQuestions[currentQ].correct;
    if (isCorrect) {
      setScore(score + 1);
      const newStreak = comboStreak + 1;
      setComboStreak(newStreak);
      let xpAmount = 10;
      if (newStreak >= 3) xpAmount += 5;
      if (timeLeft > 20) xpAmount += 3;
      handleXpGain(xpAmount);
      toast({ title: "Correct! 🎉", description: `+${xpAmount} XP${newStreak >= 3 ? " + Combo!" : ""}` });
    } else {
      setComboStreak(0);
    }
  };

  const handleNext = () => {
    const questionCount = generatedQuiz?.questions?.length || defaultQuestions.length;
    if (currentQ < questionCount - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setTimeLeft(30);
    } else {
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setComboStreak(0);
    setTimeLeft(30);
  };

  const tabs = [
    { id: "quiz" as const, label: "Quiz", icon: Brain },
    { id: "flashcard" as const, label: "Flashcards", icon: BookOpen },
    { id: "coding" as const, label: "Coding", icon: Code },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <XPGainAnimation amount={xpGain || 0} show={xpGain !== null} />
      <StatsHeader xp={userStats.xp} level={userStats.level} streak={userStats.streak} />


      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
        {tabs.map((tab) => (
          <motion.button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            if (tab.id === "quiz") {
              setGeneratedQuiz(null);
              setTopic("");
            }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`glass p-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-2 ${activeTab === tab.id ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"}`}
          >
            <tab.icon className="h-6 w-6" />
            <span className="text-xs sm:text-sm font-semibold hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>
        {activeTab === "quiz" && !generatedQuiz && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 rounded-xl mb-6 max-w-2xl">
            <div className="flex flex-col gap-3">
              <input value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleGenerateQuiz()} placeholder="Enter a topic (e.g., Binary Search)..." className="flex-1 bg-muted/40 rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30" />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerateQuiz} disabled={loadingAI || !topic.trim()} className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-neon-violet to-neon-pink text-white font-bold disabled:opacity-50">
                {loadingAI ? "Generating..." : "Generate AI Quiz"}
              </motion.button>
            </div>
          </motion.div>
        )}

      <AnimatePresence mode="wait">
        {activeTab === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {!generatedQuiz ? (
              <div className="text-center py-12 text-muted-foreground max-w-2xl mx-auto">
                <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">Start a quiz to begin learning!</p>
              </div>
            ) : (
              <QuizSection generatedQuiz={generatedQuiz} currentQ={currentQ} selected={selected} score={score} finished={finished} comboStreak={comboStreak} timeLeft={timeLeft} aiError={aiError} onSelect={handleSelect} onNext={handleNext} onRetry={handleRetry} />
            )}
          </motion.div>
        )}
        {activeTab === "flashcard" && (
          <motion.div key="flashcard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
           <FlashcardsSection
  onXpGain={handleXpGain}
  initialTopic={topic}
/>
          </motion.div>
        )}
        {activeTab === "coding" && (
          <motion.div key="coding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <CodingSection
  onXpGain={handleXpGain}
  initialTopic={topic}
/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
  