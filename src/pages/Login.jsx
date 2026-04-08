import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn, signUp, isDemoMode } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shapes">
        <div className="login-shape" />
        <div className="login-shape" />
        <div className="login-shape" />
        <div className="login-shape" />
      </div>

      <div className="login-card">
        <div className="login-emoji-row">🎨 ⭐ 🏆</div>
        <h1 className="login-title">ArtStar</h1>
        <p className="login-subtitle">
          {isSignUp ? t('auth.subtitle') : t('auth.welcome')}
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">{t('common.name')}</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Little Artist"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="artist@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? `✨ ${t('auth.logging_in')}` : isSignUp ? `🚀 ${t('auth.sign_up')}` : `🎨 ${t('auth.sign_in')}`}
          </button>
        </form>

        <div className="login-toggle">
          {isSignUp ? t('auth.has_account') : t('auth.no_account')}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }}>
            {isSignUp ? t('auth.sign_in') : t('auth.sign_up')}
          </button>
        </div>
      </div>
    </div>
  );
}
