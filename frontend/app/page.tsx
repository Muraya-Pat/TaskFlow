'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  TextField, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Alert,
  Divider, Skeleton, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EastIcon from '@mui/icons-material/East';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { todosApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Todo } from '../types';
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';

const COLUMNS: { key: 'to_be_done' | 'in_progress' | 'done'; label: string; accent: string }[] = [
  { key: 'to_be_done', label: 'To Do', accent: '#8b8a9b' },
  { key: 'in_progress', label: 'In Progress', accent: '#fbbf24' },
  { key: 'done', label: 'Done', accent: '#34d399' },
];

const NEXT_STATUS: Record<string, { key: string; label: string } | null> = {
  to_be_done: { key: 'in_progress', label: 'Start' },
  in_progress: { key: 'done', label: 'Mark done' },
  done: null,
};

function CardSkeleton() {
  return (
    <Card sx={{ opacity: 0.6 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
          <Skeleton variant="rounded" width={44} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 99 }} />
        </Box>
        <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Skeleton variant="text" width="50%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Divider sx={{ opacity: 0.06, my: 1.5 }} />
        <Skeleton variant="rounded" width={80} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const dateTriggerRef = useRef<HTMLDivElement>(null);

  const [dateValue, setDateValue] = useState<Dayjs | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [presetStatus, setPresetStatus] = useState<string | undefined>(undefined);

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
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchFilter, dateFilter]);

  const fetchCounts = useCallback(async () => {
    try {
      const data = await todosApi.getAll() as Todo[];
      setAllTodos(data);
    } catch {
      // counts are non-critical
    }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const openCreate = (status?: string) => {
    setPresetStatus(status);
    setNewTitle('');
    setNewDescription('');
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await todosApi.create(newTitle.trim(), newDescription.trim() || undefined);
      setCreateOpen(false);
      fetchTodos();
      fetchCounts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
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
      setError(err instanceof Error ? err.message : 'Failed to update task');
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
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = !!(statusFilter || searchFilter || dateFilter);

  const counts: Record<string, number> = {
    to_be_done: allTodos.filter((t) => t.status === 'to_be_done').length,
    in_progress: allTodos.filter((t) => t.status === 'in_progress').length,
    done: allTodos.filter((t) => t.status === 'done').length,
  };

  const CountBadge = ({ status }: { status: string }) => {
    const colors: Record<string, { bg: string; text: string }> = {
      to_be_done: { bg: 'rgba(139,138,155,0.2)', text: '#b8b7c5' },
      in_progress: { bg: 'rgba(251,191,36,0.18)', text: '#fbbf24' },
      done: { bg: 'rgba(52,211,153,0.18)', text: '#34d399' },
    };
    const c = colors[status];
    return (
      <Box
        component="span"
        sx={{
          ml: 0.75,
          minWidth: 18,
          height: 18,
          px: 0.5,
          borderRadius: 99,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.65rem',
          fontWeight: 700,
          backgroundColor: c.bg,
          color: c.text,
        }}
      >
        {counts[status]}
      </Box>
    );
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>

        <Sidebar />

        {/* Main content area — offset by sidebar width */}
        <Box
          sx={{
            flex: 1,
            ml: '220px',
            position: 'relative',
            zIndex: 1,
            minHeight: '100vh',
          }}
        >
          {/* ── Header ── */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: 'rgba(10,15,30,0.90)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Row 1 — title + New task */}
            <Box sx={{ px: 4, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  My Tasks
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {allTodos.length} {allTodos.length === 1 ? 'task' : 'tasks'}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: 17 }} />}
                onClick={() => openCreate()}
                sx={{ borderRadius: 2, px: 2, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                New task
              </Button>
            </Box>

            {/* Row 2 — filters */}
            <Box sx={{ px: 4, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>

              {/* Search */}
              <TextField
                placeholder="Search tasks…"
                size="small"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.22)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchFilter ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchFilter('')} sx={{ p: 0.25 }}>
                          <CloseIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
                sx={{
                  minWidth: 160,
                  maxWidth: 240,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.82rem',
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.16)' },
                    '&.Mui-focused fieldset': { borderColor: 'rgba(167,139,250,0.5)' },
                  },
                }}
              />

              {/* Status pill group */}
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 3, px: 1.25, py: 0.6,
              }}>
                {[
                  { key: '', label: 'All', accent: 'rgba(255,255,255,0.6)' },
                  { key: 'to_be_done', label: 'To Do', accent: '#8b8a9b' },
                  { key: 'in_progress', label: 'In Progress', accent: '#fbbf24' },
                  { key: 'done', label: 'Done', accent: '#34d399' },
                ].map(({ key, label, accent }) => {
                  const active = statusFilter === key;
                  const isAllPill = key === '';
                  const borderColor = active
                    ? (isAllPill ? 'rgba(255,255,255,0.5)' : accent)
                    : (isAllPill ? 'rgba(255,255,255,0.25)' : `${accent}77`);
                  return (
                    <Box
                      key={key}
                      onClick={() => setStatusFilter(key)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.5,
                        px: 1.1, py: 0.35, borderRadius: 2, cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: active ? 600 : 400,
                        color: active ? accent : 'rgba(255,255,255,0.35)',
                        backgroundColor: active ? 'rgba(255,255,255,0.09)' : 'transparent',
                        border: `1px solid ${borderColor}`,
                        boxShadow: active ? '3px 3px 8px rgba(0,0,0,0.45), -1px -1px 4px rgba(255,255,255,0.05)' : 'none',
                        transition: 'all 0.15s ease', whiteSpace: 'nowrap', userSelect: 'none',
                        '&:hover': { color: active ? accent : 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.05)' },
                      }}
                    >
                      {key && <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accent, opacity: active ? 1 : 0.45, flexShrink: 0 }} />}
                      {label}
                      {key && (
                        <Box component="span" sx={{
                          minWidth: 15, height: 15, px: 0.3, borderRadius: 99,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6rem', fontWeight: 700,
                          backgroundColor: active ? `${accent}22` : 'rgba(255,255,255,0.06)',
                          color: active ? accent : 'rgba(255,255,255,0.28)',
                        }}>
                          {counts[key]}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Date picker */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    ref={dateTriggerRef}
                    onClick={() => setDatePickerOpen(true)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 0.75,
                      px: 1.5, height: 34, borderRadius: 2, border: '1px solid',
                      borderColor: dateFilter ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.08)',
                      backgroundColor: dateFilter ? 'rgba(167,139,250,0.06)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      '&:hover': { borderColor: dateFilter ? 'rgba(167,139,250,0.55)' : 'rgba(255,255,255,0.16)' },
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 13, color: dateFilter ? '#a78bfa' : 'rgba(255,255,255,0.3)' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: dateFilter ? '#a78bfa' : 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', userSelect: 'none' }}>
                      {dateValue ? dateValue.format('MMM D, YYYY') : 'Date'}
                    </Typography>
                    {dateFilter && (
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDateValue(null); setDateFilter(''); }} sx={{ p: 0.15 }}>
                        <CloseIcon sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }} />
                      </IconButton>
                    )}
                  </Box>
                  <DatePicker
                    value={dateValue}
                    open={datePickerOpen}
                    onOpen={() => setDatePickerOpen(true)}
                    onClose={() => setDatePickerOpen(false)}
                    onChange={(val: Dayjs | null) => {
                      setDateValue(val);
                      setDateFilter(val ? val.format('YYYY-MM-DD') : '');
                      setDatePickerOpen(false);
                    }}
                    slotProps={{
                      textField: { sx: { display: 'none' } },
                      popper: {
                        placement: 'bottom-start',
                        anchorEl: dateTriggerRef.current,
                        sx: {
                          '& .MuiPaper-root': {
                            backgroundColor: '#0f1628',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
                            borderRadius: 3,
                          },
                          '& .MuiPickersDay-root': {
                            color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', borderRadius: 2,
                            '&:hover': { backgroundColor: 'rgba(167,139,250,0.15)' },
                            '&.Mui-selected': { backgroundColor: '#a78bfa', color: '#0a0f1e', fontWeight: 700 },
                          },
                          '& .MuiPickersCalendarHeader-label': { color: 'rgba(255,255,255,0.85)', fontWeight: 600 },
                          '& .MuiIconButton-root': { color: 'rgba(255,255,255,0.5)' },
                          '& .MuiDayCalendar-weekDayLabel': { color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' },
                          '& .MuiPickersDay-today:not(.Mui-selected)': { border: '1px solid rgba(167,139,250,0.45)', color: '#a78bfa' },
                        },
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>

              {/* Clear */}
              {hasFilters && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => { setStatusFilter(''); setSearchFilter(''); setDateFilter(''); setDateValue(null); }}
                  sx={{ fontSize: '0.75rem', color: 'rgba(52,211,153,0.7)', borderColor: 'rgba(52,211,153,0.25)', px: 1.5, py: 0.15, borderRadius: 0.5, '&:hover': { color: '#34d399', borderColor: 'rgba(52,211,153,0.5)', backgroundColor: 'rgba(52,211,153,0.06)' } }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ px: 4, py: 3 }}>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Kanban board */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: statusFilter ? '1fr' : { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2.5,
                alignItems: 'start',
              }}
            >
              {COLUMNS.filter((col) => !statusFilter || col.key === statusFilter).map((col) => {
                const colTodos = todos.filter((t) => t.status === col.key);

                return (
                  <Box
                    key={col.key}
                    sx={{
                      backgroundColor: 'rgba(12,18,35,0.6)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 3,
                      p: 2,
                      minHeight: 240,
                    }}
                  >
                    {/* Column header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                        px: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            backgroundColor: col.accent,
                            boxShadow: `0 0 6px ${col.accent}66`,
                          }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.03em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                          {col.label}
                        </Typography>
                      </Box>
                      <Chip
                        label={loading ? '—' : colTodos.length}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          color: 'text.secondary',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      />
                    </Box>

                    <Divider sx={{ opacity: 0.06, mb: 1.5 }} />

                    {/* Loading skeletons */}
                    {loading ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <CardSkeleton />
                        <CardSkeleton />
                      </Box>
                    ) : colTodos.length === 0 ? (
                      /* Empty state */
                      <Box
                        onClick={() => openCreate(col.key)}
                        sx={{
                          border: '1.5px dashed rgba(255,255,255,0.1)',
                          borderRadius: 2.5,
                          py: 4,
                          px: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'rgba(167,139,250,0.3)',
                            backgroundColor: 'rgba(167,139,250,0.03)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(255,255,255,0.2)',
                            fontSize: 18,
                            fontWeight: 300,
                          }}
                        >
                          +
                        </Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.75rem' }}>
                          Add a task
                        </Typography>
                      </Box>
                    ) : (
                      /* Task cards */
                      <Box
                        sx={
                          statusFilter
                            ? {
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                                gap: 1.5,
                                alignItems: 'start',
                              }
                            : { display: 'flex', flexDirection: 'column', gap: 1.5 }
                        }
                      >
                        {colTodos.map((todo) => {
                          const next = NEXT_STATUS[todo.status];
                          return (
                            <Card
                              key={todo.id}
                              sx={{
                                position: 'relative',
                                '&:hover .delete-btn': { opacity: 1 },
                              }}
                            >
                              <CardContent
                                sx={{
                                  p: 0,
                                  '&:last-child': { pb: 0 },
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                              >
                                {/* Card body */}
                                <Box sx={{ p: 2, pb: 1.5 }}>
                                  {/* Title row with date pill */}
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        lineHeight: 1.4,
                                        textDecoration: todo.status === 'done' ? 'line-through' : 'none',
                                        color: todo.status === 'done' ? 'text.secondary' : 'text.primary',
                                        flex: 1,
                                      }}
                                    >
                                      {todo.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                      {/* Date pill */}
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: '0.65rem',
                                          color: 'rgba(255,255,255,0.22)',
                                          backgroundColor: 'rgba(255,255,255,0.04)',
                                          border: '1px solid rgba(255,255,255,0.07)',
                                          borderRadius: 99,
                                          px: 1,
                                          py: 0.25,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {new Date(todo.createdAt).toLocaleDateString('en-GB', {
                                          day: 'numeric', month: 'short',
                                        })}
                                      </Typography>
                                      {/* Delete */}
                                      <IconButton
                                        className="delete-btn"
                                        size="small"
                                        onClick={() => setDeleteId(todo.id)}
                                        sx={{
                                          opacity: 0,
                                          transition: 'opacity 0.15s ease',
                                          color: 'rgba(255,255,255,0.25)',
                                          p: 0.25,
                                          '&:hover': { color: '#f87171', backgroundColor: 'rgba(248,113,113,0.08)' },
                                        }}
                                      >
                                        <DeleteIcon sx={{ fontSize: 13 }} />
                                      </IconButton>
                                    </Box>
                                  </Box>

                                  {/* Description — 2-line clamp */}
                                  {todo.description && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        fontSize: '0.78rem',
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {todo.description}
                                    </Typography>
                                  )}
                                </Box>

                                {/* Card footer — Move-to action */}
                                {next && (
                                  <>
                                    <Divider sx={{ opacity: 0.07 }} />
                                    <Box
                                      onClick={() => handleStatusChange(todo.id, next.key)}
                                      sx={{
                                        px: 2,
                                        py: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        cursor: 'pointer',
                                        borderRadius: '0 0 14px 14px',
                                        transition: 'background-color 0.15s ease',
                                        '&:hover': {
                                          backgroundColor: 'rgba(167,139,250,0.06)',
                                        },
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: '0.72rem',
                                          color: 'rgba(167,139,250,0.6)',
                                          fontWeight: 500,
                                        }}
                                      >
                                        {next.label}
                                      </Typography>
                                      <EastIcon sx={{ fontSize: 11, color: 'rgba(167,139,250,0.4)' }} />
                                    </Box>
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Create Task Dialog */}
        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ pb: 1 }}>New task</DialogTitle>
          <Divider sx={{ opacity: 0.08 }} />
          <DialogContent sx={{ pt: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                fullWidth
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleCreate(); }}
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
              This cannot be undone.
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
