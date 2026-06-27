'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Avatar,
  Divider,
} from '@mui/material';
import { profileApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.get() as User;
        setProfile(data);
        setName(data.name || '');
        setEmail(data.email || '');
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);
    try {
      const updated = await profileApi.update({ name, email }) as User;
      setProfile(updated);
      setProfileSuccess('Profile updated');
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    setPasswordSaving(true);
    try {
      await profileApi.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account? All tasks will be removed and this cannot be undone.')) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await profileApi.deleteAccount();
      logout();
      router.push('/login');
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>

        <Sidebar />

        {/* Aurora */}
        <Box
          aria-hidden
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `
              radial-gradient(60vw 60vw at 12% 8%, rgba(124,58,237,0.09) 0%, transparent 60%),
              radial-gradient(50vw 50vw at 88% 90%, rgba(167,139,250,0.06) 0%, transparent 60%)
            `,
          }}
        />

        <Box
          sx={{
            flex: 1,
            ml: '220px',
            position: 'relative',
            zIndex: 1,
            minHeight: '100vh',
          }}
        >
          {/* Top bar */}
          <Box
            sx={{
              px: 4,
              py: 2.5,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: 'rgba(10,15,30,0.85)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Profile
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Manage your account
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 16 }}>
              <CircularProgress sx={{ color: '#a78bfa' }} />
            </Box>
          ) : (
            <Box sx={{ maxWidth: 560, px: 4, py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Avatar + name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: 'rgba(167,139,250,0.14)',
                    color: '#a78bfa',
                    fontSize: 20,
                    fontWeight: 700,
                    border: '1px solid rgba(167,139,250,0.2)',
                  }}
                >
                  {profile?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {profile?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {profile?.email}
                  </Typography>
                </Box>
              </Box>

              {/* Personal information */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                    Personal information
                  </Typography>

                  {profileSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setProfileSuccess('')}>
                      {profileSuccess}
                    </Alert>
                  )}
                  {profileError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setProfileError('')}>
                      {profileError}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleUpdateProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
                    <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit" variant="contained" disabled={profileSaving}>
                        {profileSaving ? <CircularProgress size={18} sx={{ color: '#0a0f1e' }} /> : 'Save changes'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Change password */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                    Change password
                  </Typography>

                  {passwordSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess('')}>
                      {passwordSuccess}
                    </Alert>
                  )}
                  {passwordError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError('')}>
                      {passwordError}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} fullWidth required />
                    <TextField label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth required />
                    <TextField label="Confirm new password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} fullWidth required />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit" variant="contained" disabled={passwordSaving}>
                        {passwordSaving ? <CircularProgress size={18} sx={{ color: '#0a0f1e' }} /> : 'Change password'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Account info */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                    Account
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since{' '}
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })
                      : '—'}
                  </Typography>
                </CardContent>
              </Card>

              {/* Danger zone */}
              <Card sx={{ border: '1px solid rgba(248,113,113,0.18) !important' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                    Danger zone
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.82rem' }}>
                    Deleting your account is permanent. All your tasks will be removed.
                  </Typography>

                  {deleteError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {deleteError}
                    </Alert>
                  )}

                  <Button
                    variant="outlined"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    sx={{
                      borderColor: 'rgba(248,113,113,0.35)',
                      color: '#f87171',
                      fontSize: '0.82rem',
                      '&:hover': {
                        borderColor: '#f87171',
                        backgroundColor: 'rgba(248,113,113,0.06)',
                      },
                    }}
                  >
                    {deleting ? <CircularProgress size={18} sx={{ color: '#f87171' }} /> : 'Delete account'}
                  </Button>
                </CardContent>
              </Card>

            </Box>
          )}
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
