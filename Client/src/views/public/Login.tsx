import React, { useState } from "react";
import type { ApiConfig } from "../../services/ApiService";
import { apiService } from "../../services/ApiService";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!formData.email.match(emailRegex)) {
      setError("Please enter email like name@domain.com");
      setFormData({ email: "", password: "" });
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const api: ApiConfig = {
        url: "/login",
        method: "POST",
        body: {
          email: formData.email.trim(),
          password: formData.password,
        },
      };

      const response = await apiService(api);
      console.log(response);
      // Store the token if received
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if(localStorage.getItem('token')){
        navigate('/user/dashboard');
      } else {
        navigate('/auth/signup');
      }
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 0) {
        setError('Cannot connect to the server. Please check your connection.');
      } else {
        setError(err.response?.data?.message || 'An error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  return (
    <div className="relative mx-auto flex w-full max-w-5xl items-center justify-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/3 right-10 h-80 w-80 rounded-full bg-emerald-400/15 blur-[140px]" />
        <div className="absolute -bottom-24 -left-16 h-80 w-[20rem] rounded-full bg-sky-400/15 blur-[160px]" />
      </div>

      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/70 px-8 py-10 shadow-[0_45px_120px_-65px_rgba(15,118,110,0.85)] backdrop-blur sm:px-10 sm:py-12">
        <header className="mb-8 text-center">
          <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Welcome back
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-white">Sign in to continue</h1>
          <p className="mt-2 text-sm text-slate-300/80">
            Enter your credentials to access the dashboard.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-3 flex items-center text-slate-300/80 transition hover:text-emerald-200"
                aria-label="Toggle password visibility"
              >
                {passwordVisible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.058 10.058 0 012.944-4.331M6.392 6.392A9.969 9.969 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.787 3.26M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/70 ${isSubmitting ? "cursor-not-allowed opacity-60" : ""
              }`}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <div className="text-center text-sm text-slate-300/80">
            Not a user yet?{" "}
            <Link to="/auth/signup" className="font-semibold text-emerald-200 hover:text-emerald-100">
              Sign up now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
