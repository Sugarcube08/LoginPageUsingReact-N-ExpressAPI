import React, { useState, useCallback, useMemo } from 'react';
import { apiService } from "../../services/ApiService";
import type { ApiConfig } from "../../services/ApiService";
import { useNavigate } from "react-router-dom";

// SVG Icons for Eye (Open and Closed) using a functional component for clarity
interface EyeIconProps {
  isPasswordVisible: boolean;
}

const EyeIcon: React.FC<EyeIconProps> = ({ isPasswordVisible }) => {
  if (isPasswordVisible) {
    // Open Eye (Show Password)
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-white cursor-pointer"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  } else {
    // Closed Eye (Hide Password) - Including the line through effect
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-white cursor-pointer"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.058 10.058 0 012.944-4.331M6.392 6.392A9.969 9.969 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.787 3.26M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
      </svg>
    );
  }
};

const Signup = () => {
  // State for form inputs
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Handlers for Toggling Password Visibility
  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setIsConfirmPasswordVisible(prev => !prev);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  // Determine input types based on visibility state
  const passwordInputType = useMemo(() => isPasswordVisible ? 'text' : 'password', [isPasswordVisible]);
  const confirmPasswordInputType = useMemo(() => isConfirmPasswordVisible ? 'text' : 'password', [isConfirmPasswordVisible]);


  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!email.match(emailRegex)) {
      setError("Please enter email like name@domain.com");
      setEmail("");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const api: ApiConfig = {
        url: "/signup",
        method: "POST",
        body: {
          username: username.trim(),
          name: name.trim(),
          email: email.trim(),
          password: password,
        },
      };

      const response = await apiService(api);

      // if response 400, and response.message is "username already exists"
      if (response.status === 400) {
        setError(response.message);
        return;
      }

      if (response.status === 400) {
        setError(response.message);
        return;
      }

      // Store the token if received
      if (response.data.token) {
        console.log('Token:', response.data.token)
        localStorage.setItem('token', response.data.token);
      }

      // Redirect to dashboard on successful login
      navigate('/auth/login');

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

  return (
    <div className="relative mx-auto flex w-full max-w-5xl items-center justify-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/3 right-10 h-80 w-80 rounded-full bg-emerald-400/15 blur-[140px]" />
        <div className="absolute -bottom-24 -left-16 h-80 w-[20rem] rounded-full bg-skyw-400/15 blur-[160px]" />
      </div>

      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/70 px-8 py-10 shadow-[0_50px_140px_-80px_rgba(17,94,89,0.85)] backdrop-blur sm:px-10 sm:py-12">
        <header className="mb-6 text-center">
          <span className="inline-flex rounded-full border border-sky-500/40 bg-sky-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            Create account
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-white">Join the platform</h1>
          <p className="mt-2 text-sm text-slate-300/80">
            Fill in your details to start using the authentication suite.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-xl gap-5">
          <input type="hidden" name="csrf_token" value="PLACEHOLDER_CSRF_TOKEN" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium text-slate-200">
                Username
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                placeholder="jane.doe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-200">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordInputType}
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-300/80 transition hover:text-sky-200"
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon isPasswordVisible={isPasswordVisible} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200">
                Re-type password
              </label>
              <div className="relative">
                <input
                  type={confirmPasswordInputType}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-300/80 transition hover:text-sky-200"
                  aria-label="Toggle confirm password visibility"
                >
                  <EyeIcon isPasswordVisible={isConfirmPasswordVisible} />
                </button>
              </div>
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
            className={`w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${isSubmitting ? 'cursor-not-allowed opacity-60' : ''
              }`}
          >
            {isSubmitting ? 'Signing up...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;