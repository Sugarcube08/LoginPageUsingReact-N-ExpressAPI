// src/views/users/UserProfile.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    FiEdit,
    FiSave,
    FiX,
    FiUser,
    FiMail,
    FiHash,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle
} from 'react-icons/fi';
import { apiService } from '../../services/ApiService';
import type { ApiConfig } from '../../services/ApiService';
import type { UserProfileData } from '../../types/typeUserProfile';

const UserProfile = () => {
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [formData, setFormData] = useState({ name: '', username: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const getApiMessage = useCallback((err: any, fallback: string) => {
        const data = err?.response?.data;
        if (!data) {
            return err?.message ?? fallback;
        }

        if (typeof data === 'string') {
            return data;
        }

        if (data?.message) {
            return data.message;
        }

        if (data?.error) {
            return data.error;
        }

        return err?.message ?? fallback;
    }, []);

    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
            setLoading(true);
            setError(null);

            const request: ApiConfig = {
                url: '/users/user',
                method: 'GET',
            };

            try {
                const response = await apiService(request);
                const data = response?.data;

                if (active && data) {
                    setProfile(data);
                    setFormData({
                        name: data.name ?? '',
                        username: data.username ?? ''
                    });
                }
            } catch (err: any) {
                if (active) {
                    setError(getApiMessage(err, 'Unable to load profile at the moment.'));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            active = false;
        };
    }, []);

    const formattedJoined = useMemo(() => {
        if (!profile?.createdAt) return '—';
        try {
            return new Date(profile.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return profile.createdAt;
        }
    }, [profile?.createdAt]);

    const handleChange = (field: 'name' | 'username') => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const beginEdit = () => {
        if (!profile) return;
        setError(null);
        setSuccess(null);
        setFormData({
            name: profile.name ?? '',
            username: profile.username ?? ''
        });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        if (!profile) return;
        setFormData({
            name: profile.name ?? '',
            username: profile.username ?? ''
        });
        setIsEditing(false);
        setSaving(false);
        setSuccess(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!profile) return;

        const trimmedName = formData.name.trim();
        const trimmedUsername = formData.username.trim();

        if (!trimmedName || !trimmedUsername) {
            setError('Both name and username are required.');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        const request: ApiConfig = {
            url: '/users/user',
            method: 'POST',
            body: {
                name: trimmedName,
                username: trimmedUsername
            },
        };

        try {
            const response = await apiService(request);
            const raw = response?.data ?? response;
            const message = raw?.message ?? response?.message ?? 'Profile updated successfully.';
            setProfile((prev) => (prev ? {
                ...prev,
                name: trimmedName,
                username: trimmedUsername
            } : prev));
            setFormData({ name: trimmedName, username: trimmedUsername });
            setSuccess(message);
            setIsEditing(false);
        } catch (err: any) {
            setError(getApiMessage(err, 'Failed to update profile.'));
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!success && !error) return;

        const timeout = window.setTimeout(() => {
            setSuccess(null);
            setError(null);
        }, 2500);

        return () => window.clearTimeout(timeout);
    }, [success, error]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="rounded-3xl border border-strong bg-glass p-6 shadow-soft">
                    <div className="space-y-5">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-12 rounded-2xl bg-muted animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="rounded-3xl border border-red-400/40 bg-red-500/10 p-6 shadow-elevated text-red-100">
                <div className="flex items-center gap-3">
                    <FiAlertTriangle className="text-red-200" />
                    <div>
                        <h2 className="text-lg font-semibold">Unable to load profile</h2>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    const profileInitial = (profile.name || profile.username || 'U').slice(0, 1).toUpperCase();

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-strong bg-glass p-6 shadow-soft">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-semibold shadow-soft/50">
                            {profileInitial}
                        </div>
                        <div>
                            <h1 className="text-4xl font-semibold text-primary">
                                Profile
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-secondary">
                            {isEditing ? 'Editing mode' : 'View only'}
                        </span>
                        <button
                            type="button"
                            onClick={() => (isEditing ? cancelEdit() : beginEdit())}
                            className="inline-flex items-center gap-2 rounded-full bg-layer px-4 py-2 text-sm font-semibold text-secondary shadow-soft/40 transition-colors hover:text-primary"
                        >
                            {isEditing ? (
                                <>
                                    <FiX size={16} />
                                    Cancel edit
                                </>
                            ) : (
                                <>
                                    <FiEdit size={16} />
                                    Edit profile
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {[{
                        label: 'Display name',
                        value: profile.name || '—',
                        icon: FiUser

                    }, {
                        label: 'Username',
                        value: profile.username,
                        icon: FiHash
                    }, {
                        label: 'Email',
                        value: profile.email,
                        icon: FiMail
                    }, {
                        label: 'Joined',
                        value: formattedJoined,
                        icon: FiClock
                    }].map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="flex items-center gap-3 rounded-2xl border border-subtle bg-layer px-4 py-3 shadow-soft/30"
                        >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-secondary">
                                <Icon size={16} />
                            </span>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-secondary">{label}</p>
                                <p className="text-sm font-semibold text-primary break-all">{value || '—'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-3xl border border-strong bg-glass p-6 shadow-soft">
                <div className="space-y-4">
                    {success && (
                        <div className="notification-fade flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-soft/40">
                            <FiCheckCircle size={16} />
                            <span>{success}</span>
                        </div>
                    )}

                    {error && profile && (
                        <div className="notification-fade flex items-center gap-3 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-soft/40">
                            <FiAlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <p className="text-sm text-secondary">
                        {isEditing
                            ? 'Save your edits to update your public profile information.'
                            : 'Select “Edit profile” to update your name or username.'}
                    </p>
                </div>
                <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isEditing ? 'mt-6 max-h-[1200px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4 pointer-events-none'
                        }`}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <label className="space-y-2 text-sm font-medium text-secondary">
                                <span className="uppercase tracking-wide">Display name</span>
                                <div className="relative">
                                    <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange('name')}
                                        disabled={!isEditing || saving}
                                        className="w-full rounded-xl border border-subtle bg-layer px-4 py-3 pl-11 text-sm text-primary shadow-soft/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60"
                                        placeholder="Your full name"
                                        maxLength={120}
                                    />
                                </div>
                            </label>

                            <label className="space-y-2 text-sm font-medium text-secondary">
                                <span className="uppercase tracking-wide">Username</span>
                                <div className="relative">
                                    <FiHash className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={handleChange('username')}
                                        disabled={!isEditing || saving}
                                        className="w-full rounded-xl border border-subtle bg-layer px-4 py-3 pl-11 text-sm text-primary shadow-soft/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60"
                                        placeholder="Preferred username"
                                        maxLength={120}
                                    />
                                </div>
                            </label>

                            <label className="space-y-2 text-sm font-medium text-secondary">
                                <span className="uppercase tracking-wide">Email</span>
                                <div className="relative">
                                    <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input
                                        type="email"
                                        value={profile.email || ''}
                                        disabled
                                        className="w-full rounded-xl border border-subtle bg-muted/80 px-4 py-3 pl-11 text-sm text-secondary"
                                    />
                                </div>
                            </label>

                            <label className="space-y-2 text-sm font-medium text-secondary">
                                <span className="uppercase tracking-wide">Member since</span>
                                <div className="relative">
                                    <FiClock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input
                                        type="text"
                                        value={formattedJoined}
                                        disabled
                                        className="w-full rounded-xl border border-subtle bg-muted/80 px-4 py-3 pl-11 text-sm text-secondary"
                                    />
                                </div>
                            </label>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="inline-flex items-center gap-2 rounded-full border border-subtle px-5 py-2 text-sm font-semibold text-secondary hover:text-primary transition-colors"
                            >
                                <FiX size={16} />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft/60 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 00-10 10h4z" />
                                        </svg>
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        <FiSave size={16} />
                                        Save changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default UserProfile;