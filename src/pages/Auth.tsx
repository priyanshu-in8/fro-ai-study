import { useState } from "react";
import { motion } from "framer-motion";
import { authApi } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] =
    useState("");
  const [fullName, setFullName] = useState("");
  const [educationType, setEducationType] =
    useState("school");
  const [educationLevel, setEducationLevel] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth } = useAuth();

  const handleEmailAuth = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result =
          await authApi.login(
            email,
            password
          );

        setAuth(
          result.token,
          result.user
        );

        toast({
          title:
            "Login successful!",
          description: `Welcome back, ${
            result.user?.name ||
            "User"
          }!`,
        });

        navigate("/", {
          replace: true,
        });
      } else {
        if (
          password !==
          passwordConfirm
        ) {
          throw new Error(
            "Passwords do not match"
          );
        }

        await authApi.register(
          fullName,
          email,
          password,
          passwordConfirm,
          educationType,
          educationLevel
        );

        toast({
          title:
            "Account created!",
          description:
            "Check your email to verify your account.",
        });

        setIsLogin(true);
        setPassword("");
        setPasswordConfirm("");
      }
    } catch (error: any) {
      toast({
        variant:
          "destructive",
        title: "Error",
        description:
          error.message ||
          "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-violet flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <span className="font-bold text-2xl gradient-text">
            AI Study Buddy
          </span>
        </div>

        <div className="glass-strong p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-center mb-1">
            {isLogin
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p className="text-sm text-muted-foreground text-center mb-6">
            {isLogin
              ? "Sign in to continue learning"
              : "Start your learning journey"}
          </p>

          <form
            onSubmit={
              handleEmailAuth
            }
            className="space-y-3"
          >
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <input
                    type="text"
                    placeholder="Full name"
                    value={
                      fullName
                    }
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/30 border border-border text-sm outline-none"
                    required
                  />
                </div>

                <select
                  value={
                    educationType
                  }
                  onChange={(e) =>
                    setEducationType(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-muted/30 border border-border text-sm outline-none"
                >
                  <option value="school">
                    School
                  </option>
                  <option value="college">
                    College
                  </option>
                </select>

                <input
                  type="text"
                  placeholder="Education Level"
                  value={
                    educationLevel
                  }
                  onChange={(e) =>
                    setEducationLevel(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-muted/30 border border-border text-sm outline-none"
                  required
                />
              </>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/30 border border-border text-sm outline-none"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={
                  password
                }
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-muted/30 border border-border text-sm outline-none"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Confirm */}
            {!isLogin && (
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm Password"
                value={
                  passwordConfirm
                }
                onChange={(e) =>
                  setPasswordConfirm(
                    e.target.value
                  )
                }
                className="w-full px-4 py-2.5 rounded-lg bg-muted/30 border border-border text-sm outline-none"
                required
              />

            )}

            <button
              type="submit"
              disabled={
                loading
              }
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin
                    ? "Sign In"
                    : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          <div className="my-4 flex justify-center">
  <GoogleLogin
    onSuccess={async (
      credentialResponse
    ) => {
      try {
        setLoading(true);

        const result =
          await authApi.googleLogin(
            credentialResponse.credential
          );

        setAuth(
          result.token,
          result.user
        );

        toast({
          title:
            "Google login successful!",
          description: `Welcome ${
            result.user?.name ||
            ""
          }`,
        });

        navigate("/", {
          replace: true,
        });

      } catch (error: any) {
        toast({
          variant:
            "destructive",
          title:
            "Google Login Failed",
          description:
            error.message,
        });
      } finally {
        setLoading(false);
      }
    }}
    onError={() => {
      toast({
        variant:
          "destructive",
        title: "Error",
        description:
          "Google Sign-In failed",
      });
    }}
  />
</div>

          <p className="text-xs text-center mt-4 text-muted-foreground">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              onClick={() =>
                setIsLogin(
                  !isLogin
                )
              }
              className="text-primary font-medium hover:underline"
            >
              {isLogin
                ? "Sign up"
                : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;