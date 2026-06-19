'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, Card, CardContent,
  TextField, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem,
  FormControl, CircularProgress, Alert,
  ToggleButtonGroup, ToggleButton, Avatar, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { todosApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Todo } from '../types';
import ProtectedRoute from '../components/ProtectedRoute';

const STATUS_LABELS: Record<string, string> = {
  to_be_done: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

// Column definitions for the kanban board
const COLUMNS: { key: 'to_be_done' | 'in_progress' | 'done'; label: string; accent: string }[] = [
  { key: 'to_be_done', label: 'To Do', accent: '#8b8a9b' },
  { key: 'in_progress', label: 'In Progress', accent: '#fbbf24' },
  { key: 'done', label: 'Done', accent: '#34d399' },
];

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [allTodos, setAllTodos] = useState<Todo[]>([]); // unfiltered — used only for accurate counts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Create todo dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete confirmation dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filters: Record<string, string> = {};
      if (statusFilter) filters.status = statusFilter;
      if (searchFilter) filters.search = searchFilter;
      if (dateFilter) filters.date = dateFilter;

      const data = await todosApi.getAll(filters) as Todo[];
      setTodos(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchFilter, dateFilter]);

  // Fetch ALL todos (no filters) just to compute accurate category counts
  const fetchCounts = useCallback(async () => {
    try {
      const data = await todosApi.getAll() as Todo[];
      setAllTodos(data);
    } catch {
      // counts are non-critical — ignore errors here
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await todosApi.create(newTitle.trim(), newDescription.trim() || undefined);
      setNewTitle('');
      setNewDescription('');
      setCreateOpen(false);
      fetchTodos();
      fetchCounts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await todosApi.updateStatus(id, status);
      fetchTodos();
      fetchCounts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await todosApi.delete(deleteId);
      setDeleteId(null);
      fetchTodos();
      fetchCounts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const hasFilters = !!(statusFilter || searchFilter || dateFilter);

  // Accurate per-category counts (always from the unfiltered list)
  const counts: Record<string, number> = {
    to_be_done: allTodos.filter((t) => t.status === 'to_be_done').length,
    in_progress: allTodos.filter((t) => t.status === 'in_progress').length,
    done: allTodos.filter((t) => t.status === 'done').length,
  };

  // Color-coded badge background per category (matches the column accent dots)
  const COUNT_COLORS: Record<string, string> = {
    to_be_done: 'rgba(139, 138, 155, 0.25)',  // grey
    in_progress: 'rgba(251, 191, 36, 0.22)',  // amber
    done: 'rgba(52, 211, 153, 0.22)',         // green
  };
  const COUNT_TEXT_COLORS: Record<string, string> = {
    to_be_done: '#b8b7c5',
    in_progress: '#fbbf24',
    done: '#34d399',
  };

  // Small circular count badge for the filter buttons
  const CountBadge = ({ status }: { status: string }) => (
    <Box
      component="span"
      sx={{
        ml: 1,
        minWidth: 18,
        height: 18,
        px: 0.5,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.68rem',
        fontWeight: 600,
        backgroundColor: COUNT_COLORS[status],
        color: COUNT_TEXT_COLORS[status],
      }}
    >
      {counts[status]}
    </Box>
  );

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

        {/* Aurora background — soft, restrained glows that match the theme */}
        <Box
          aria-hidden
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `
              radial-gradient(60vw 60vw at 12% 8%, rgba(124, 58, 237, 0.10) 0%, transparent 60%),
              radial-gradient(50vw 50vw at 88% 90%, rgba(167, 139, 250, 0.08) 0%, transparent 60%)
            `,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Navbar */}
          <Box
            sx={{
              px: 3, py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: 'rgba(10,15,30,0.8)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#a78bfa', fontWeight: 600 }}>
              TaskFlow
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontSize: 14 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton onClick={() => router.push('/profile')} size="small">
                <PersonIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={handleLogout} size="small">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Body */}
          <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 4 }}>

            {/* Header + actions */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  My Tasks
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
              >
                New task
              </Button>
            </Box>

            {/* Filter bar */}
            <Card
              sx={{
                mb: 3,
                backgroundColor: 'rgba(15, 22, 40, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    placeholder="Search tasks..."
                    size="small"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <ToggleButtonGroup
                    value={statusFilter}
                    exclusive
                    onChange={(_, val) => setStatusFilter(val ?? '')}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        px: 2,
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(167,139,250,0.15)',
                          color: '#a78bfa',
                          borderColor: 'rgba(167,139,250,0.3)',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="to_be_done">To Do<CountBadge status="to_be_done" /></ToggleButton>
                    <ToggleButton value="in_progress">In Progress<CountBadge status="in_progress" /></ToggleButton>
                    <ToggleButton value="done">Done<CountBadge status="done" /></ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    type="date"
                    size="small"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    sx={{ width: 160 }}
                  />
                  {hasFilters && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        setStatusFilter('');
                        setSearchFilter('');
                        setDateFilter('');
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Kanban board */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#a78bfa' }} />
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  // When a status filter is active, only the matching column shows,
                  // so use a single full-width track instead of 3 columns.
                  gridTemplateColumns: statusFilter
                    ? '1fr'
                    : { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 2.5,
                  alignItems: 'start',
                }}
              >
                {COLUMNS
                  .filter((col) => !statusFilter || col.key === statusFilter)
                  .map((col) => {
                  const colTodos = todos.filter((t) => t.status === col.key);
                  return (
                    <Box
                      key={col.key}
                      sx={{
                        backgroundColor: 'rgba(15, 22, 40, 0.5)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 3,
                        p: 2,
                        minHeight: 200,
                      }}
                    >
                      {/* Column header */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1.5,
                          px: 0.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.accent }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {col.label}
                          </Typography>
                        </Box>
                        <Chip
                          label={colTodos.length}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            color: 'text.secondary',
                          }}
                        />
                      </Box>
                      <Divider sx={{ opacity: 0.08, mb: 1.5 }} />

                      {/* Column cards */}
                      {colTodos.length === 0 ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', textAlign: 'center', py: 3, opacity: 0.6 }}
                        >
                          No tasks
                        </Typography>
                      ) : (
                        <Box
                          sx={
                            statusFilter
                              ? {
                                  // Filtered view: tasks flow left-to-right, max 3 per row (desktop),
                                  // single column on mobile.
                                  display: 'grid',
                                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                                  gap: 1.5,
                                  alignItems: 'start',
                                }
                              : { display: 'flex', flexDirection: 'column', gap: 1.5 }
                          }
                        >
                          {colTodos.map((todo) => (
                            <Card key={todo.id}>
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      textDecoration: todo.status === 'done' ? 'line-through' : 'none',
                                      color: todo.status === 'done' ? 'text.secondary' : 'text.primary',
                                    }}
                                  >
                                    {todo.title}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => setDeleteId(todo.id)}
                                    sx={{ color: 'text.secondary', mt: -0.5, mr: -0.5, '&:hover': { color: '#f87171' } }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>

                                {todo.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                                    {todo.description}
                                  </Typography>
                                )}

                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                                  {new Date(todo.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                  })}
                                </Typography>

                                <FormControl size="small" fullWidth sx={{ mt: 1.5 }}>
                                  <Select
                                    value={todo.status}
                                    onChange={(e) => handleStatusChange(todo.id, e.target.value)}
                                    sx={{ fontSize: '0.78rem' }}
                                  >
                                    <MenuItem value="to_be_done">To Do</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="done">Done</MenuItem>
                                  </Select>
                                </FormControl>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        {/* Create Todo Dialog */}
        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ pb: 1 }}>New task</DialogTitle>
          <Divider sx={{ opacity: 0.1 }} />
          <DialogContent sx={{ pt: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                fullWidth
                autoFocus
              />
              <TextField
                label="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button variant="text" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!newTitle.trim() || creating}
            >
              {creating ? <CircularProgress size={18} sx={{ color: '#0a0f1e' }} /> : 'Create task'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button variant="text" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleDelete}
              disabled={deleting}
              sx={{ backgroundColor: '#f87171', color: '#fff', '&:hover': { backgroundColor: '#ef4444' } }}
            >
              {deleting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ProtectedRoute>
  );
}
