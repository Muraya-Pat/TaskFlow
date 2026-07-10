'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Avatar, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar, Collapse,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { profileApi, todosApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { User, Todo } from '../../types';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';

const D = {
  pageBg:        '#161b2e',
  headerBg:      'rgba(22,27,46,0.92)',
  cardBg:        '#2a334a',
  border:        'rgba(167,139,250,0.12)',
  textPrimary:   '#f0f2f8',
  textSecondary: '#b0bcd4',
  textTertiary:  '#a8b8d0',
  accent:        '#a78bfa',
  accentLight:   'rgba(167,139,250,0.12)',
  divider:       'rgba(167,139,250,0.1)',
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

const statCardSx = {
  flex: 1,
  p: 2.5,
  borderRadius: 2.5,
  backgroundColor: D.cardBg,
  border: `1px solid ${D.border}`,
  textAlign: 'center' as const,
};

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // View / edit mode
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Task stats
  const [taskStats, setTaskStats] = useState({ total: 0, inProgress: 0, done: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, todos] = await Promise.all([
          profileApi.get() as Promise<User>,
          todosApi.getAll() as Promise<Todo[]>,
        ]);
        setProfile(profileData);
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        const done = todos.filter((t) => t.status === 'done').length;
        const inProgress = todos.filter((t) => t.status === 'in_progress').length;
        setTaskStats({ total: todos.length, inProgress, done });
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const updated = await profileApi.update({ name, email }) as User;
      setProfile(updated);
      setSnackbar({ message: 'Profile updated successfully', severity: 'success' });
      setEditing(false);
    } catch (err: unknown) {
      setSnackbar({
        message: err instanceof Error ? err.message : 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(profile?.name || '');
    setEmail(profile?.email || '');
    setEditing(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setSnackbar({ message: 'New passwords do not match', severity: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setSnackbar({ message: 'Password must be at least 8 characters', severity: 'error' });
      return;
    }
    setPasswordSaving(true);
    try {
      await profileApi.changePassword(currentPassword, newPassword);
      setSnackbar({ message: 'Password changed successfully', severity: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordForm(false);
    } catch (err: unknown) {
      setSnackbar({
        message: err instanceof Error ? err.message : 'Failed to change password',
        severity: 'error',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleCancelPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPasswordForm(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await profileApi.deleteAccount();
      logout();
      router.push('/login');
    } catch (err: unknown) {
      setSnackbar({
        message: err instanceof Error ? err.message : 'Failed to delete account',
        severity: 'error',
      });
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <Box sx={{ flex: 1, ml: '220px', backgroundColor: D.pageBg, minHeight: '100vh' }}>
          {/* Sticky header */}
          <Box
            sx={{
              px: 4,
              py: 2.5,
              borderBottom: `1px solid ${D.border}`,
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: D.headerBg,
              backdropFilter: 'blur(20px)',
            }}
          >
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
              {/* ── Avatar hero ── */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: D.cardBg,
                  border: `1px solid ${D.border}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'rgba(167,139,250,0.14)',
                    color: D.accent,
                    fontSize: 24,
                    fontWeight: 700,
                    border: `2px solid rgba(167,139,250,0.2)`,
                  }}
                >
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
                    Member since{' '}
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </Typography>
                </Box>
              </Box>

              {/* ── Stats strip ── */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={statCardSx}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: D.accent, lineHeight: 1.1 }}>
                    {taskStats.total}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: D.textTertiary, mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Total tasks
                  </Typography>
                </Box>
                <Box sx={statCardSx}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24', lineHeight: 1.1 }}>
                    {taskStats.inProgress}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: D.textTertiary, mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    In progress
                  </Typography>
                </Box>
                <Box sx={statCardSx}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399', lineHeight: 1.1 }}>
                    {taskStats.done}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: D.textTertiary, mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Completed
                  </Typography>
                </Box>
              </Box>

              {/* ── Personal information ── */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <Box sx={{ width: 3, height: 18, borderRadius: 1, backgroundColor: D.accent }} />
                    <Typography sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.78rem', color: D.textTertiary }}>
                      Personal information
                    </Typography>
                  </Box>

                  {editing ? (
                    /* ── Edit mode ── */
                    <Box component="form" onSubmit={handleUpdateProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required sx={fieldSx} />
                      <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required sx={fieldSx} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={handleCancelEdit}
                          sx={{
                            borderColor: 'rgba(167,139,250,0.2)',
                            color: D.textSecondary,
                            '&:hover': { borderColor: 'rgba(167,139,250,0.4)', backgroundColor: 'rgba(255,255,255,0.03)' },
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={profileSaving}>
                          {profileSaving ? <CircularProgress size={18} sx={{ color: '#0d1117' }} /> : 'Save changes'}
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    /* ── View mode ── */
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.72rem', color: D.textTertiary, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Full name
                        </Typography>
                        <Typography sx={{ fontSize: '1rem', color: D.textPrimary, fontWeight: 450 }}>
                          {profile?.name || '—'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.72rem', color: D.textTertiary, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Email
                        </Typography>
                        <Typography sx={{ fontSize: '1rem', color: D.textPrimary, fontWeight: 450 }}>
                          {profile?.email || '—'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Button
                          variant="outlined"
                          onClick={() => setEditing(true)}
                          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderColor: 'rgba(167,139,250,0.3)',
                            color: D.accent,
                            px: 2.5,
                            '&:hover': {
                              borderColor: D.accent,
                              backgroundColor: D.accentLight,
                            },
                          }}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* ── Change password ── */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <Box sx={{ width: 3, height: 18, borderRadius: 1, backgroundColor: D.accent }} />
                    <Typography sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.78rem', color: D.textTertiary }}>
                      Change password
                    </Typography>
                  </Box>

                  {!showPasswordForm ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Password display */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(167,139,250,0.1)',
                        }}
                      >
                        <LockOutlinedIcon sx={{ fontSize: 16, color: D.textTertiary }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.7rem', color: D.textTertiary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>
                            Password
                          </Typography>
                          <Typography sx={{ fontSize: '0.95rem', color: D.textSecondary, fontFamily: 'monospace', letterSpacing: '0.12em' }}>
                            ••••••••••••
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        variant="text"
                        onClick={() => setShowPasswordForm(true)}
                        startIcon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          color: D.accent,
                          px: 0,
                          fontSize: '0.88rem',
                          '&:hover': { backgroundColor: 'transparent', color: '#c4b5fd' },
                        }}
                      >
                        Change password
                      </Button>
                    </Box>
                  ) : (
                    <Collapse in={showPasswordForm}>
                      <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} fullWidth required sx={fieldSx} />
                        <TextField label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth required sx={fieldSx} />
                        <TextField label="Confirm new password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} fullWidth required sx={fieldSx} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={handleCancelPassword}
                            sx={{
                              borderColor: 'rgba(167,139,250,0.2)',
                              color: D.textSecondary,
                              '&:hover': { borderColor: 'rgba(167,139,250,0.4)', backgroundColor: 'rgba(255,255,255,0.03)' },
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" variant="contained" disabled={passwordSaving}>
                            {passwordSaving ? <CircularProgress size={18} sx={{ color: '#0d1117' }} /> : 'Change password'}
                          </Button>
                        </Box>
                      </Box>
                    </Collapse>
                  )}
                </CardContent>
              </Card>

              {/* ── Danger zone ── */}
              <Card sx={{ border: '1px solid rgba(248,113,113,0.18) !important' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                    <Box sx={{ width: 3, height: 18, borderRadius: 1, backgroundColor: '#f87171' }} />
                    <Typography sx={{ fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.72rem' }}>
                      Danger zone
                    </Typography>
                  </Box>
                  <Typography sx={{ mb: 2.5, fontSize: '0.88rem', color: D.textSecondary, lineHeight: 1.6 }}>
                    Permanently deletes your account and all associated tasks. This cannot be undone.
                  </Typography>
                  <Divider sx={{ mb: 2.5, borderColor: 'rgba(248,113,113,0.1)' }} />
                  <Button
                    variant="outlined"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deleting}
                    sx={{
                      borderColor: 'rgba(248,113,113,0.3)',
                      color: '#f87171',
                      fontSize: '0.88rem',
                      '&:hover': { borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.08)' },
                    }}
                  >
                    Delete account
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Delete confirmation dialog ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeleteConfirmText(''); }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: D.cardBg,
              borderRadius: 2.5,
              border: '1px solid rgba(248,113,113,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
          },
        }}
      >
        <DialogTitle sx={{ color: '#f87171', fontWeight: 700, fontSize: '1.1rem', pb: 1 }}>
          Delete account
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <DialogContentText sx={{ color: D.textSecondary, fontSize: '0.88rem', mb: 2, lineHeight: 1.6 }}>
            This action is permanent. All your tasks will be removed and you will not be able to recover your account.
          </DialogContentText>
          <Typography sx={{ fontSize: '0.88rem', color: D.textSecondary, mb: 1 }}>
            Type <Typography component="span" sx={{ fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>DELETE</Typography> to confirm:
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            sx={{
              ...fieldSx,
              '& .MuiOutlinedInput-root': {
                ...fieldSx['& .MuiOutlinedInput-root'],
                backgroundColor: 'rgba(248,113,113,0.04)',
                '& fieldset': { borderColor: 'rgba(248,113,113,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(248,113,113,0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#f87171' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#f87171' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => { setDeleteDialogOpen(false); setDeleteConfirmText(''); }}
            sx={{ color: D.textSecondary, '&:hover': { color: D.textPrimary } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteAccount}
            disabled={deleteConfirmText !== 'DELETE' || deleting}
            sx={{
              backgroundColor: '#dc2626',
              '&:hover': { backgroundColor: '#b91c1c' },
              '&.Mui-disabled': { backgroundColor: 'rgba(220,38,38,0.3)' },
            }}
          >
            {deleting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Delete my account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar?.severity}
          onClose={() => setSnackbar(null)}
          sx={{
            width: '100%',
            backgroundColor: snackbar?.severity === 'success' ? '#1a3a2a' : '#3a1a1a',
            color: snackbar?.severity === 'success' ? '#34d399' : '#f87171',
            borderRadius: 2,
            '& .MuiAlert-icon': { color: snackbar?.severity === 'success' ? '#34d399' : '#f87171' },
          }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </ProtectedRoute>
  );
}
