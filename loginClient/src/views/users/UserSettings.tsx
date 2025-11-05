// src/views/users/UserSettings.tsx
import React, { useState } from 'react';
import { FiLock, FiTrash2, FiCheck, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { apiService } from '../../services/ApiService';
import type { ApiConfig } from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';

const UserSettings = () => {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);


  const api: ApiConfig = {
    url: '/users/user',
    method: 'POST',
    body: {
      password: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    },
  }

  const validateForm = () => {
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', isError: true });
      return false;
    }
    if (newPassword.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters long', isError: true });
      return false;
    }
    if (!currentPassword) {
      setMessage({ text: 'Current password is required', isError: true });
      return false;
    }
    return true;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      api.url = '/users/password'
      const response = await apiService(api);
      const data = response?.data ?? response;

      if (response.success) {
        setMessage({ text: 'Password updated successfully!', isError: false });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ text: data.message || 'Failed to update password', isError: true });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred while updating password', isError: true });
    }

    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const handleDeleteAccount = async () => {
    api.url = '/users/user'
    api.method = 'DELETE'
    const response = await apiService(api)
    const data = response?.data ?? response

    if (response.success) {
      setMessage({ text: 'Account deleted successfully!', isError: false });
      navigate('/');
    } else {
      setMessage({ text: data.message || 'Failed to delete account', isError: true });
    }
    // Add account deletion logic here
    console.log('Account deletion requested');
    setShowDeleteConfirm(false);
  };

  return (

    <div className="mx-auto w-full px-4 py-6 md:px-8 md:py-10">
      <div className="space-y-6">
        <section className="rounded-3xl border border-strong bg-glass p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary">Security</p>
              <h2 className="text-xl font-semibold text-primary">Update password</h2>
              <p className="text-sm text-secondary mt-2 max-w-xl">
                Choose a strong password with at least eight characters. Mix uppercase, lowercase, numbers and symbols to keep your account safe.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="mt-6 space-y-5 max-w-xl">
            {[{
              id: 'currentPassword',
              label: 'Current password',
              value: currentPassword,
              onChange: setCurrentPassword,
              visible: showCurrentPassword,
              toggle: () => setShowCurrentPassword(!showCurrentPassword)
            }, {
              id: 'newPassword',
              label: 'New password',
              value: newPassword,
              onChange: setNewPassword,
              visible: showNewPassword,
              toggle: () => setShowNewPassword(!showNewPassword)
            }, {
              id: 'confirmPassword',
              label: 'Confirm new password',
              value: confirmPassword,
              onChange: setConfirmPassword,
              visible: showConfirmPassword,
              toggle: () => setShowConfirmPassword(!showConfirmPassword)
            }].map(({ id, label, value, onChange, visible, toggle }) => (
              <label key={id} className="block space-y-2 text-sm font-medium text-secondary">
                <span className="uppercase tracking-wide">{label}</span>
                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    type={visible ? 'text' : 'password'}
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    minLength={id === 'currentPassword' ? undefined : 8}
                    required
                    className="w-full rounded-xl border border-subtle bg-layer px-4 py-3 pl-11 pr-12 text-sm text-primary shadow-soft/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </label>
            ))}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft/60 transition-transform hover:-translate-y-0.5"
              >
                <FiCheck size={16} />
                Update password
              </button>
              {message && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${message.isError
                      ? 'border-red-400/40 bg-red-500/10 text-red-100 shadow-soft/30'
                      : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200 shadow-soft/30'
                    }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-red-400/40 bg-red-500/80 p-6 shadow-soft">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-red-200">Danger zone</p>
              <h2 className="text-xl font-semibold text-white">Delete account</h2>
              <p className="text-sm text-red-100/80 mt-2 max-w-xl">
                Deleting your account removes all personal data and access. This action cannot be undone.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full border border-red-200/60 px-5 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/20"
              >
                <FiTrash2 size={16} />
                Delete my account
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-red-100/80">Are you absolutely sure? This action is irreversible.</p>
                <button
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-soft/40 hover:bg-red-400"
                >
                  <FiCheck size={16} /> Yes, delete my account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200/60 px-5 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/20"
                >
                  <FiX size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserSettings;