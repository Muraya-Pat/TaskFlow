'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Avatar, Divider,
} from '@mui/material';
import { profileApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';

const D = {
  pageBg:        '#161b2e',
  headerBg:      'rgba(22,27,46,0.92)',
  cardBg:        '#252d42',
  border:        'rgba(167,139,250,0.08)',
  textPrimary:   '#e8eaf2',
  textSecondary: '#8892a4',
  textTertiary:  '#56607a',
  accent:        '#a78bfa',
  accentLight:   'rgba(167,139,250,0.1)',
  divider:       'rgba(167,139,250,0.08)',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: D.textPrimary,
    '& fieldset': { borderColor: 'rgba(167,139,250,0.15)' },
    '&:hover fieldset': { borderColor: 'rgba(167,139,250,0.35)' },
    '&.Mui-focused fieldset': { borderColor: D.accent, borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { color: D.textSecondary },
  '& .MuiInputLabel-root.Mui-focused': { color: D.accent },
  '& .MuiOutlinedInput-input': { color: D.textPrimary },
};

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name,           setName]           = useState('');
  const [email,          setEmail]          = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError,   setProfileError]   = useState('');
  const [profileSaving,  setProfileSaving]  = useState(false);

  const [currentPassword,    setCurrentPassword]    = useState('');
  const [newPassword,        setNewPassword]        = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess,    setPasswordSuccess]    = useState('');
  const [passwordError,      setPasswordError]      = useState('');
  const [passwordSaving,     setPasswordSaving]     = useState(false);

  const [deleteError, setDeleteError] = useState('');
  const [deleting,    setDeleting]    = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.get() as User;
        setProfile(data); setName(data.name || ''); setEmail(data.email || '');
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(''); setProfileSuccess(''); setProfileSaving(true);
    try {
      const updated = await profileApi.update({ name, email }) as User;
      setProfile(updated); setProfileSuccess('Profile updated successfully');
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally { setProfileSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(''); setPasswordSuccess('');
    if (newPassword !== confirmNewPassword) { setPasswordError('New passwords do not match'); return; }
    if (newPassword.length < 8)            { setPasswordError('Password must be at least 8 characters'); return; }
    setPasswordSaving(true);
    try {
      await profileApi.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally { setPasswordSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account? All tasks will be removed and this cannot be undone.')) return;
    setDeleting(true); setDeleteError('');
    try {
      await profileApi.deleteAccount(); logout(); router.push('/login');
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>

        <Sidebar />

        <Box sx={{ flex: 1, ml: '220px', backgroundColor: D.pageBg, minHeight: '100vh' }}>

          {/* Sticky header */}
          <Box sx={{
            px: 4, py: 2.5,
            borderBottom: `1px solid ${D.border}`,
            position: 'sticky', top: 0, zIndex: 10,
            backgroundColor: D.headerBg,
            backdropFilter: 'blur(20px)',
          }}>
            <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.35rem', color: D.textPrimary }}>
              Profile
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: D.textSecondary, mt: 0.25 }}>
              Manage your account settings
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 16 }}>
              <CircularProgress sx={{ color: D.accent }} />
            </Box>
          ) : (
            <Box sx={{ maxWidth: 580, px: 4, py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Avatar hero */}
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 2.5,
                p: 3, borderRadius: 3,
                backgroundColor: D.cardBg,
                border: `1px solid ${D.border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}>
                <Avatar sx={{
                  width: 60, height: 60,
                  bgcolor: 'rgba(167,139,250,0.14)',
                  color: D.accent,
                  fontSize: 24, fontWeight: 700,
                  border: `2px solid rgba(167,139,250,0.2)`,
                }}>
                  {profile?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: D.textPrimary, lineHeight: 1.3 }}>
                    {profile?.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: D.textSecondary, mt: 0.3 }}>
                    {profile?.email}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: D.textTertiary, mt: 0.75, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Member since {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '—'}
                  </Typography>
                </Box>
              </Box>

              {/* Personal information */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontWeight: 700, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.72rem', color: D.textTertiary }}>
                    Personal information
                  </Typography>
                  {profileSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setProfileSuccess('')}>{profileSuccess}</Alert>}
                  {profileError   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setProfileError('')}>{profileError}</Alert>}
                  <Box component="form" onSubmit={handleUpdateProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required sx={fieldSx} />
                    <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required sx={fieldSx} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit" variant="contained" disabled={profileSaving}>
                        {profileSaving ? <CircularProgress size={18} sx={{ color: '#0d1117' }} /> : 'Save changes'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Change password */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontWeight: 700, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.72rem', color: D.textTertiary }}>
                    Change password
                  </Typography>
                  {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess('')}>{passwordSuccess}</Alert>}
                  {passwordError   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setPasswordError('')}>{passwordError}</Alert>}
                  <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} fullWidth required sx={fieldSx} />
                    <TextField label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth required sx={fieldSx} />
                    <TextField label="Confirm new password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} fullWidth required sx={fieldSx} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit" variant="contained" disabled={passwordSaving}>
                        {passwordSaving ? <CircularProgress size={18} sx={{ color: '#0d1117' }} /> : 'Change password'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Danger zone */}
              <Card sx={{ border: '1px solid rgba(248,113,113,0.18) !important' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontWeight: 700, mb: 0.75, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.72rem' }}>
                    Danger zone
                  </Typography>
                  <Typography sx={{ mb: 2.5, fontSize: '0.88rem', color: D.textSecondary, lineHeight: 1.6 }}>
                    Permanently deletes your account and all associated tasks. This cannot be undone.
                  </Typography>
                  <Divider sx={{ mb: 2.5, borderColor: 'rgba(248,113,113,0.1)' }} />
                  {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
                  <Button
                    variant="outlined" onClick={handleDeleteAccount} disabled={deleting}
                    sx={{
                      borderColor: 'rgba(248,113,113,0.3)', color: '#f87171', fontSize: '0.88rem',
                      '&:hover': { borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.08)' },
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
