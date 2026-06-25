import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Phone,
  LoaderCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  sendPasswordResetEmail,
  ensureProfileExists,
} from '../../services/api';
import toast from 'react-hot-toast';
export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const { data: { user: authUser } } = await signInWithEmail(email, password);
      if (authUser) {
        console.log('[Auth] Login successful for:', authUser.email);
        // Use metadata from auth response to avoid getUser() call
        const meta = authUser.user_metadata || {};
        const profile = await ensureProfileExists(authUser.id, {
          email: authUser.email || '',
          name: (meta.name as string) || '',
          phone: (meta.phone as string) || '',
          role: (meta.role as 'customer' | 'salon_owner' | 'admin') || 'customer',
        });
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name || '',
          phone: profile.phone || '',
          role: profile.role as 'customer' | 'salon_owner' | 'admin',
          avatar: profile.avatar_url || '',
          createdAt: profile.created_at,
        });
      }
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      console.error('[Auth] Login error:', err);
      // Differentiate between auth errors and profile errors
      if (err?.message?.toLowerCase().includes('invalid login credentials') ||
          err?.message?.toLowerCase().includes('invalid email or password')) {
        toast.error('Invalid email or password. Please try again.');
      } else if (err?.message?.toLowerCase().includes('email not confirmed')) {
        toast.error('Please verify your email before signing in.');
      } else if (err?.message?.toLowerCase().includes('no authenticated user')) {
        toast.error('Account setup incomplete. Please try again or contact support.');
      } else {
        // Try to extract a meaningful Supabase error
        toast.error(err?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('[Auth] Starting Google login');
      await signInWithGoogle();
      // OAuth redirect will handle the rest
    } catch (err: any) {
      console.error('[Auth] Google login error:', err);
      toast.error(err.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <Helmet>
        <title>Login — Shringar</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-rose-400" />
              <span className="font-heading text-xl text-rose-800 font-bold">Shringar</span>
            </Link>
            <h1 className="font-heading text-2xl text-rose-800 mb-1">Welcome back</h1>
            <p className="text-sm text-ivory-600">Sign in to manage your bridal bookings</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              label="Email"
              type="email"
              placeholder="bride@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex items-center justify-between mt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-ivory-600 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPassword ? 'Hide' : 'Show'} password
                </button>
                <Link to="/forgot-password" className="text-xs text-rose-400 hover:text-rose-600">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button variant="primary" className="w-full" size="md" disabled={loading}>
              {loading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4 ml-1.5" /></>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ivory-200" />
            </div>
            <div className="relative flex justify-center text-xs text-ivory-600">
              <span className="bg-white px-3">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-ivory-200 rounded-full text-sm font-medium text-ivory-900 hover:bg-ivory-50 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-ivory-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-rose-400 hover:text-rose-600 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [role, setRole] = useState<'customer' | 'salon_owner' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await signUpWithEmail(email, password, { name, phone, role });
      // Email confirmation is disabled — log the user in immediately
      if (data?.user) {
        console.log('[Auth] Signup successful for:', data.user.email);

        // Prepare metadata from the signup response so ensureProfileExists
        // doesn't need to call getUser() (session may not be ready yet)
        const signupMeta = data.user.user_metadata || {};
        const userMetadata = {
          email: data.user.email || email,
          name: (signupMeta.name as string) || name,
          phone: (signupMeta.phone as string) || phone,
          role: (signupMeta.role as 'customer' | 'salon_owner' | 'admin') || role,
        };

        // Retry with an initial delay — the DB trigger may still be processing
        let profile = null;
        await new Promise((r) => setTimeout(r, 1500));
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            profile = await ensureProfileExists(data.user.id, userMetadata);
            if (profile) break;
          } catch (fetchErr) {
            console.log('[Auth] Profile fetch attempt', attempt + 1, 'failed:', fetchErr);
            if (attempt < 2) {
              const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
              await new Promise((r) => setTimeout(r, delay));
            }
          }
        }

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name || '',
            phone: profile.phone || '',
            role: profile.role as 'customer' | 'salon_owner' | 'admin',
            avatar: profile.avatar_url || '',
            createdAt: profile.created_at,
          });
          // Check if profile was created via client fallback vs DB trigger
          const wasFallback = !profile.created_at ||
            (new Date().getTime() - new Date(profile.created_at).getTime() < 1500);
          if (wasFallback) {
            toast.success('Welcome to Shringar! Please set up your profile.');
          } else {
            toast.success('Welcome to Shringar! 🎉');
          }
          navigate('/');
        } else {
          // Last resort — profile still missing after 3 retries
          toast.error('Account created but profile not ready yet. Please try logging in.');
        }
      }
    } catch (err: any) {
      console.error('[Auth] Registration error:', err);
      const msg = err?.message || err?.error_description || JSON.stringify(err);
      if (msg?.toLowerCase().includes('already registered') ||
          msg?.toLowerCase().includes('user already exists')) {
        toast.error('This email is already registered. Try signing in instead.');
      } else if (msg?.toLowerCase().includes('password')) {
        toast.error(err.message);
      } else if (msg?.toLowerCase().includes('smtp') ||
                 msg?.toLowerCase().includes('email confirmation') ||
                 msg?.toLowerCase().includes('error sending') ||
                 msg?.includes('500') ||
                 err?.status === 500) {
        toast.error('Account created! But the confirmation email failed to send. Please contact support or try logging in.');
      } else {
        toast.error(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <Helmet>
        <title>Sign Up — Shringar</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-rose-400" />
              <span className="font-heading text-xl text-rose-800 font-bold">Shringar</span>
            </Link>
            <h1 className="font-heading text-2xl text-rose-800 mb-1">Create your account</h1>
            <p className="text-sm text-ivory-600">Start your bridal beauty journey</p>
          </div>

          {!role ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-ivory-900 mb-2">I am a...</p>
              <button
                onClick={() => setRole('customer')}
                className="w-full p-4 rounded-xl border-2 border-ivory-200 hover:border-rose-400 text-left transition-all cursor-pointer"
              >
                <p className="font-medium text-ivory-900">Bride-to-be</p>
                <p className="text-sm text-ivory-600">I want to discover and book bridal services</p>
              </button>
              <button
                onClick={() => setRole('salon_owner')}
                className="w-full p-4 rounded-xl border-2 border-ivory-200 hover:border-rose-400 text-left transition-all cursor-pointer"
              >
                <p className="font-medium text-ivory-900">Salon Owner</p>
                <p className="text-sm text-ivory-600">I want to list my salon and get bookings</p>
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="p-3 bg-rose-50 rounded-lg text-sm text-ivory-600 mb-2">
                Signing up as: <strong className="text-rose-600">
                  {role === 'customer' ? 'Bride-to-be' : 'Salon Owner'}
                </strong>
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="ml-2 text-rose-400 hover:text-rose-600 text-xs underline"
                >
                  Change
                </button>
              </div>
              <Input
                label="Full Name"
                placeholder="Your full name"
                icon={<User className="w-4 h-4" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="bride@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4" />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Create a password (min. 6 characters)"
                icon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button variant="primary" className="w-full" size="md" disabled={loading}>
                {loading ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4 ml-1.5" /></>
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-ivory-600">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-400 hover:text-rose-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err: any) {
      console.error('[Auth] Password reset error:', err);
      if (err?.message?.toLowerCase().includes('not found') ||
          err?.message?.toLowerCase().includes('no user')) {
        toast.error('No account found with this email address.');
      } else {
        toast.error(err.message || 'Failed to send reset email');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <Helmet>
        <title>Forgot Password — Shringar</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <Sparkles className="w-10 h-10 text-rose-400 mx-auto mb-4" />
            <h1 className="font-heading text-2xl text-rose-800 mb-1">
              {sent ? 'Check your email' : 'Forgot password?'}
            </h1>
            <p className="text-sm text-ivory-600">
              {sent
                ? 'We sent a reset link to your email address.'
                : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </div>
          {!sent && (
            <form className="space-y-4" onSubmit={handleReset}>
              <Input
                label="Email"
                type="email"
                placeholder="bride@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button variant="primary" className="w-full" size="md" disabled={loading}>
                {loading ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-ivory-600">
            Remember your password?{' '}
            <Link to="/login" className="text-rose-400 hover:text-rose-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}