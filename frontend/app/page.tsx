'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, Card, CardContent,
  TextField, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert,
  ToggleButtonGroup, ToggleButton, Divider, Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { todosApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Todo } from '../types';
import ProtectedRoute from '../components/ProtectedRoute';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success'> = {
  to_be_done: 'default',
  in_progress: 'warning',
  done: 'success',
};

const STATUS_LABELS: Record<string, string> = {
  to_be_done: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
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

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await todosApi.create(newTitle.trim(), newDescription.trim() || undefined);
      setNewTitle('');
      setNewDescription('');
      setCreateOpen(false);
      fetchTodos();
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

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh' }}>

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

        {/* Main content */}
        <Box sx={{ maxWidth: 720, mx: 'auto', px: 3, py: 4 }}>

          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  placeholder="Search tasks..."
                  size="small"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
                    <ToggleButton value="to_be_done">To Do</ToggleButton>
                    <ToggleButton value="in_progress">In Progress</ToggleButton>
                    <ToggleButton value="done">Done</ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    type="date"
                    size="small"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    sx={{ width: 160 }}
                  />
                  {(statusFilter || searchFilter || dateFilter) && (
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
              </Box>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Todo list */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#a78bfa' }} />
            </Box>
          ) : todos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">
                {searchFilter || statusFilter || dateFilter
                  ? 'No tasks match your filters.'
                  : 'No tasks yet. Create your first one!'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {todos.map((todo) => (
                <Card key={todo.id}>
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            textDecoration: todo.status === 'done' ? 'line-through' : 'none',
                            color: todo.status === 'done' ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {todo.title}
                        </Typography>
                        {todo.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {todo.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {new Date(todo.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                          <Select
                            value={todo.status}
                            onChange={(e) => handleStatusChange(todo.id, e.target.value)}
                            sx={{ fontSize: '0.8rem' }}
                          >
                            <MenuItem value="to_be_done">To Do</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="done">Done</MenuItem>
                          </Select>
                        </FormControl>
                        <Chip
                          label={STATUS_LABELS[todo.status]}
                          color={STATUS_COLORS[todo.status]}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => setDeleteId(todo.id)}
                          sx={{ color: 'text.secondary', '&:hover': { color: '#f87171' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
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