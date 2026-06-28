'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  TextField, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Alert,
  Divider, Skeleton, InputAdornment, ToggleButtonGroup, ToggleButton,
  MenuItem, Select, FormControl, InputLabel, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EastIcon from '@mui/icons-material/East';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckIcon from '@mui/icons-material/Check';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { todosApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Todo, TodoPriority } from '../types';
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';

// ── Design tokens (Option B — Ink on Fog) ─────────────────────────────────
// Three depth layers: sidebar #0d1117 → content bg #161b2e → column #1e2540 → card #252d42
// Signature: status-colored left glow on every card

const D = {
  pageBg:      '#161b2e',
  headerBg:    'rgba(22,27,46,0.92)',
  columnBg:    '#1e2540',
  cardBg:      '#252d42',
  border:      'rgba(167,139,250,0.08)',
  borderHover: 'rgba(167,139,250,0.2)',
  textPrimary: '#e8eaf2',
  textSecondary: '#8892a4',
  textTertiary: '#56607a',
  accent:      '#a78bfa',
  accentLight: 'rgba(167,139,250,0.1)',
  accentMid:   'rgba(167,139,250,0.16)',
  divider:     'rgba(167,139,250,0.08)',
};

// Status system — signature glow colors per column
const COLUMNS: {
  key: 'to_be_done' | 'in_progress' | 'done';
  label: string;
  accent: string;
  glow: string;
  bg: string;
}[] = [
  { key: 'to_be_done',  label: 'To Do',      accent: '#9d8fce', glow: 'rgba(157,143,206,0.22)', bg: 'rgba(157,143,206,0.08)' },
  { key: 'in_progress', label: 'In Progress', accent: '#f59e0b', glow: 'rgba(245,158,11,0.22)',  bg: 'rgba(245,158,11,0.08)'  },
  { key: 'done',        label: 'Done',        accent: '#34d399', glow: 'rgba(52,211,153,0.22)',   bg: 'rgba(52,211,153,0.08)'  },
];

const NEXT_STATUS: Record<string, { key: string; label: string } | null> = {
  to_be_done:  { key: 'in_progress', label: 'Start'     },
  in_progress: { key: 'done',        label: 'Mark done' },
  done:        null,
};

const PRIORITY_CONFIG: Record<TodoPriority, { label: string; color: string; bg: string; border: string }> = {
  high:   { label: 'High',   color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.28)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.28)'  },
  low:    { label: 'Low',    color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.28)'  },
};

const STATUS_COLORS: Record<string, { accent: string; glow: string; bg: string }> = {
  to_be_done:  { accent: '#9d8fce', glow: 'rgba(157,143,206,0.22)', bg: 'rgba(157,143,206,0.1)' },
  in_progress: { accent: '#f59e0b', glow: 'rgba(245,158,11,0.22)',  bg: 'rgba(245,158,11,0.1)'  },
  done:        { accent: '#34d399', glow: 'rgba(52,211,153,0.22)',   bg: 'rgba(52,211,153,0.1)'  },
};

const STATUS_LABELS: Record<string, string> = {
  to_be_done:  'To Do',
  in_progress: 'In Progress',
  done:        'Done',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDueDate(dateStr: string | null): { text: string; overdue: boolean; today: boolean } | null {
  if (!dateStr) return null;
  const due = dayjs(dateStr);
  const now = dayjs();
  const overdue  = due.isBefore(now, 'day');
  const today    = due.isSame(now, 'day');
  const tomorrow = due.isSame(now.add(1, 'day'), 'day');
  let text: string;
  if (today)         text = 'Today';
  else if (tomorrow) text = 'Tomorrow';
  else               text = due.format('MMM D');
  return { text, overdue, today };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card sx={{
      backgroundColor: D.cardBg,
      border: '1px solid rgba(167,139,250,0.15)',
      boxShadow: '0 0 0 1px rgba(167,139,250,0.06), 0 4px 16px rgba(0,0,0,0.3)',
      minHeight: 110,
    }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 0 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Skeleton variant="text" width="62%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
          <Skeleton variant="rounded" width={46} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 99 }} />
        </Box>
        <Skeleton variant="text" width="85%" height={15} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Skeleton variant="text" width="60%" height={15} sx={{ bgcolor: 'rgba(255,255,255,0.03)', mb: 1.5 }} />
        <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
          <Skeleton variant="rounded" width={52} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 99 }} />
          <Skeleton variant="rounded" width={70} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 99 }} />
        </Box>
        <Divider sx={{ opacity: 0.08, mt: 1.5, mb: 0 }} />
        <Skeleton variant="text" width={72} height={34} sx={{ bgcolor: 'rgba(255,255,255,0.03)' }} />
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: TodoPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.6,
      px: 1, py: 0.3, borderRadius: 99,
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.02em',
      color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </Box>
  );
}

function DueDateBadge({ dueDate, isDone, completedAt }: {
  dueDate: string | null;
  isDone: boolean;
  completedAt?: string | null;
}) {
  if (isDone) {
    const completed = completedAt ? dayjs(completedAt).format('MMM D, YYYY') : null;
    if (!completed) return null;
    return (
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.5,
        px: 1, py: 0.3, borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
        color: '#34d399', backgroundColor: 'rgba(52,211,153,0.1)',
        border: '1px solid rgba(52,211,153,0.25)',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        <CalendarTodayIcon sx={{ fontSize: 10 }} />
        Done {completed}
      </Box>
    );
  }
  const info = formatDueDate(dueDate);
  if (!info) return null;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: 1, py: 0.3, borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
      color:           info.overdue ? '#f87171' : info.today ? '#f59e0b' : D.textSecondary,
      backgroundColor: info.overdue ? 'rgba(248,113,113,0.1)' : info.today ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${info.overdue ? 'rgba(248,113,113,0.28)' : info.today ? 'rgba(245,158,11,0.28)' : 'rgba(255,255,255,0.08)'}`,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      <CalendarTodayIcon sx={{ fontSize: 10 }} />
      {info.text}{info.overdue ? ' · Overdue' : ''}
    </Box>
  );
}

// ── Task Card ──────────────────────────────────────────────────────────────

interface TaskCardProps {
  todo: Todo;
  listView?: boolean;
  onStatusChange: (id: string, status: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

function TaskCard({ todo, listView, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const next   = NEXT_STATUS[todo.status];
  const isDone = todo.status === 'done';
  const sc     = STATUS_COLORS[todo.status];

  if (listView) {
    return (
      <Card sx={{
        position: 'relative',
        borderLeft: `3px solid ${sc.accent}`,
        '&:hover': { boxShadow: `0 6px 20px rgba(0,0,0,0.35), 0 0 0 1px ${sc.accent}22`, transform: 'none' },
      }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 2.5 }}>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{
                fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4, color: D.textPrimary,
                textDecoration: isDone ? 'line-through' : 'none',
                opacity: isDone ? 0.65 : 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {todo.title}
              </Typography>
              {todo.description && (
                <Tooltip title={todo.description} placement="bottom-start" enterDelay={400}>
                  <Typography sx={{
                    fontSize: '0.82rem', lineHeight: 1.4, mt: 0.25, color: D.textSecondary,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    cursor: 'default',
                  }}>
                    {todo.description}
                  </Typography>
                </Tooltip>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
              <PriorityBadge priority={todo.priority} />
              <DueDateBadge dueDate={todo.dueDate} isDone={isDone} completedAt={todo.completedAt} />
              <Box sx={{
                px: 1.1, py: 0.3, borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                color: sc.accent, backgroundColor: sc.bg,
                border: `1px solid ${sc.accent}44`, whiteSpace: 'nowrap',
              }}>
                {STATUS_LABELS[todo.status]}
              </Box>
            </Box>

            {/* Always-visible actions — quiet at rest, full on hover/focus */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {next && (
                <Tooltip title={next.label}>
                  <IconButton size="small" onClick={() => onStatusChange(todo.id, next.key)}
                    sx={{
                      color: D.accent, p: 0.6,
                      opacity: 0.45, transition: 'opacity 0.15s ease, background-color 0.15s ease',
                      '&:hover': { opacity: 1, backgroundColor: D.accentLight },
                      '&:focus-visible': { opacity: 1 },
                    }}>
                    <EastIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton size="small" onClick={() => onEdit(todo)}
                sx={{
                  color: D.textSecondary, p: 0.6,
                  opacity: 0.45, transition: 'opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease',
                  '&:hover': { opacity: 1, color: D.accent, backgroundColor: D.accentLight },
                  '&:focus-visible': { opacity: 1 },
                }}>
                <EditIcon sx={{ fontSize: 15 }} />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(todo.id)}
                sx={{
                  color: D.textSecondary, p: 0.6,
                  opacity: 0.45, transition: 'opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease',
                  '&:hover': { opacity: 1, color: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)' },
                  '&:focus-visible': { opacity: 1 },
                }}>
                <DeleteIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Kanban card — glassmorphic border + corner flag (rendered inside card via overflow:hidden)
  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${sc.accent}40`,
      boxShadow: `0 0 0 1px ${sc.accent}18, 0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)`,
      backdropFilter: 'blur(12px)',
      background: `linear-gradient(145deg, ${sc.accent}0a 0%, rgba(37,45,66,0.95) 40%, rgba(30,37,64,0.9) 100%)`,
      '&:hover': {
        border: `1px solid ${sc.accent}70`,
        boxShadow: `0 0 0 1px ${sc.accent}30, 0 8px 28px rgba(0,0,0,0.45), 0 0 20px ${sc.glow}, inset 0 1px 0 rgba(255,255,255,0.07)`,
        transform: 'translateY(-2px)',
      },
      transition: 'box-shadow 0.22s ease, border-color 0.22s ease, transform 0.18s ease',
    }}>

      {/* Corner flag — inside card, clipped by overflow:hidden */}
      {isDone ? (
        /* Done — top-right triangular fold with checkmark */
        <Box sx={{
          position: 'absolute', top: 0, right: 0, zIndex: 2,
          width: 44, height: 44,
          background: `linear-gradient(225deg, ${sc.accent} 50%, transparent 50%)`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
          pt: 0.6, pr: 0.6,
        }}>
          <CheckIcon sx={{ fontSize: 13, color: '#0d1117', fontWeight: 900 }} />
        </Box>
      ) : (
        /* To Do / In Progress — top-left pill tab */
        <Box sx={{
          position: 'absolute', top: 0, left: 0, zIndex: 2,
          width: 5, height: 36,
          borderRadius: '0 0 6px 0',
          backgroundColor: sc.accent,
          boxShadow: `2px 0 12px ${sc.glow}`,
        }} />
      )}

      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2.5, pb: 1.5, pl: isDone ? 2.5 : 2.8 }}>

          {/* Top row: title + always-visible actions */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5, mb: 1 }}>
            <Typography sx={{
              fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.45, flex: 1, color: D.textPrimary,
              textDecoration: isDone ? 'line-through' : 'none',
              opacity: isDone ? 0.55 : 1,
              ...(isDone && { pr: 3.5 }),
            }}>
              {todo.title}
            </Typography>
            {!isDone && (
              <Box sx={{ display: 'flex', gap: 0, flexShrink: 0 }}>
                <IconButton size="small" onClick={() => onEdit(todo)} aria-label="Edit task"
                  sx={{
                    color: D.textSecondary, p: 0.4,
                    opacity: 0.4, transition: 'opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease',
                    '&:hover': { opacity: 1, color: D.accent, backgroundColor: D.accentLight },
                    '&:focus-visible': { opacity: 1 },
                  }}>
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(todo.id)} aria-label="Delete task"
                  sx={{
                    color: D.textSecondary, p: 0.4,
                    opacity: 0.4, transition: 'opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease',
                    '&:hover': { opacity: 1, color: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)' },
                    '&:focus-visible': { opacity: 1 },
                  }}>
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Edit/Delete for done cards — below title, small row */}
          {isDone && (
            <Box sx={{ display: 'flex', gap: 0, mb: 0.5 }}>
              <IconButton size="small" onClick={() => onEdit(todo)} aria-label="Edit task"
                sx={{
                  color: D.textSecondary, p: 0.4,
                  opacity: 0.35, transition: 'opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease',
                  '&:hover': { opacity: 1, color: D.accent, backgroundColor: D.accentLight },
                }}>
                <EditIcon sx={{ fontSize: 13 }} />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(todo.id)} aria-label="Delete task"
                sx={{
                  color: D.textSecondary, p: 0.4,
                  opacity: 0.35, transition: 'opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease',
                  '&:hover': { opacity: 1, color: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)' },
                }}>
                <DeleteIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          )}

          {todo.description && (
            <Tooltip title={todo.description} placement="bottom-start" enterDelay={600}
              slotProps={{ tooltip: { sx: { maxWidth: 280, fontSize: '0.8rem', lineHeight: 1.5 } } }}>
              <Typography sx={{
                fontSize: '0.82rem', lineHeight: 1.55, mb: 1.25, color: D.textSecondary,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                cursor: 'default',
              }}>
                {todo.description}
              </Typography>
            </Tooltip>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <PriorityBadge priority={todo.priority} />
            <DueDateBadge dueDate={todo.dueDate} isDone={isDone} completedAt={todo.completedAt} />
          </Box>
        </Box>

        {/* Footer action button */}
        {next && (
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Button
              fullWidth size="small"
              onClick={() => onStatusChange(todo.id, next.key)}
              endIcon={<EastIcon sx={{ fontSize: 13 }} />}
              sx={{
                backgroundColor: `${sc.accent}18`,
                color: sc.accent,
                fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.01em',
                borderRadius: 1.5, py: 0.7, boxShadow: 'none',
                transition: 'background-color 0.15s ease',
                '&:hover': { backgroundColor: `${sc.accent}28`, boxShadow: 'none' },
                '&:active': { backgroundColor: `${sc.accent}35` },
              }}
            >
              {next.label}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useAuth();

  const [todos, setTodos]       = useState<Todo[]>([]);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter,   setDateFilter]   = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const dateTriggerRef = useRef<HTMLDivElement>(null);
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);

  const [createOpen,        setCreateOpen]        = useState(false);
  const [newTitle,          setNewTitle]          = useState('');
  const [newDescription,    setNewDescription]    = useState('');
  const [newPriority,       setNewPriority]       = useState<TodoPriority>('medium');
  const [newDueDate,        setNewDueDate]        = useState<Dayjs | null>(null);
  const [creating,          setCreating]          = useState(false);
  const [newDefaultStatus,  setNewDefaultStatus]  = useState<string>('');

  const [editTodo,        setEditTodo]        = useState<Todo | null>(null);
  const [editTitle,       setEditTitle]       = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority,    setEditPriority]    = useState<TodoPriority>('medium');
  const [editDueDate,     setEditDueDate]     = useState<Dayjs | null>(null);
  const [saving,          setSaving]          = useState(false);

  const [deleteId,  setDeleteId]  = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchTodos = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const filters: Record<string, string> = {};
      if (statusFilter) filters.status = statusFilter;
      if (searchFilter) filters.search = searchFilter;
      if (dateFilter)   filters.date   = dateFilter;
      setTodos(await todosApi.getAll(filters) as Todo[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally { setLoading(false); }
  }, [statusFilter, searchFilter, dateFilter]);

  const fetchCounts = useCallback(async () => {
    try { setAllTodos(await todosApi.getAll() as Todo[]); } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchTodos();  }, [fetchTodos]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openCreate = (defaultStatus = '') => {
    setNewTitle(''); setNewDescription(''); setNewPriority('medium');
    setNewDueDate(dayjs().add(1, 'day'));
    setNewDefaultStatus(defaultStatus);
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDueDate) return;
    setCreating(true);
    try {
      await todosApi.create(newTitle.trim(), newDescription.trim() || undefined, newPriority, newDueDate.format('YYYY-MM-DD'), newDefaultStatus || undefined);
      setCreateOpen(false); fetchTodos(); fetchCounts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally { setCreating(false); }
  };

  const openEdit = (todo: Todo) => {
    setEditTodo(todo); setEditTitle(todo.title);
    setEditDescription(todo.description ?? '');
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate ? dayjs(todo.dueDate) : null);
  };

  const handleEdit = async () => {
    if (!editTodo || !editTitle.trim()) return;
    setSaving(true);
    try {
      await todosApi.update(editTodo.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        dueDate: editDueDate ? editDueDate.format('YYYY-MM-DD') : null,
      });
      setEditTodo(null); fetchTodos(); fetchCounts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await todosApi.updateStatus(id, status); fetchTodos(); fetchCounts(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to update task'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await todosApi.delete(deleteId); setDeleteId(null); fetchTodos(); fetchCounts(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to delete task'); }
    finally { setDeleting(false); }
  };

  const hasFilters = !!(statusFilter || searchFilter || dateFilter);

  const counts: Record<string, number> = {
    to_be_done:  allTodos.filter((t) => t.status === 'to_be_done').length,
    in_progress: allTodos.filter((t) => t.status === 'in_progress').length,
    done:        allTodos.filter((t) => t.status === 'done').length,
  };

  // ── Shared popper/select styles ───────────────────────────────────────────

  const datePickerPopperSx = {
    '& .MuiPaper-root': {
      backgroundColor: '#1e2540',
      border: `1px solid ${D.border}`,
      boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
      borderRadius: 3,
    },
    '& .MuiPickersDay-root': {
      color: D.textPrimary, fontSize: '0.82rem', borderRadius: 2,
      '&:hover': { backgroundColor: D.accentLight },
      '&.Mui-selected': { backgroundColor: D.accent, color: '#0d1117', fontWeight: 700 },
    },
    '& .MuiPickersCalendarHeader-label': { color: D.textPrimary, fontWeight: 600 },
    '& .MuiIconButton-root': { color: D.textSecondary },
    '& .MuiDayCalendar-weekDayLabel': { color: D.textTertiary, fontSize: '0.72rem' },
    '& .MuiPickersDay-today:not(.Mui-selected)': { border: `1px solid ${D.accent}55`, color: D.accent },
  };

  const selectSx = {
    fontSize: '0.9rem', color: D.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.04)',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(167,139,250,0.15)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(167,139,250,0.35)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: D.accent },
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>

          <Sidebar />

          {/* Mid-tone content panel */}
          <Box sx={{
            flex: 1, ml: '220px',
            backgroundColor: D.pageBg,
            position: 'relative', zIndex: 1, minHeight: '100vh',
          }}>

            {/* ── Sticky Header ── */}
            <Box sx={{
              position: 'sticky', top: 0, zIndex: 10,
              backgroundColor: '#111827',
              backdropFilter: 'blur(20px)',
              borderBottom: `1px solid rgba(167,139,250,0.18)`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
            }}>
              {/* Row 1 */}
              <Box sx={{ px: 4, pt: 3, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25 }}>
                    <Typography sx={{
                      fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2,
                      fontSize: '1.5rem', color: D.textPrimary,
                    }}>
                      My Tasks
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: D.textTertiary, fontWeight: 500 }}>
                      {allTodos.length} {allTodos.length === 1 ? 'task' : 'tasks'}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                  onClick={() => openCreate()}
                  sx={{ borderRadius: 2.5, px: 2.5, py: 1, fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                >
                  New task
                </Button>
              </Box>

              {/* Row 2 — filters */}
              <Box sx={{ px: 4, pb: 2.5, display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>

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
                          <SearchIcon sx={{ fontSize: 16, color: D.textTertiary }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchFilter ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchFilter('')} sx={{ p: 0.3 }}>
                            <CloseIcon sx={{ fontSize: 13, color: D.textTertiary }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                  sx={{
                    minWidth: 170, maxWidth: 250,
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.88rem', borderRadius: 2.5,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      color: D.textPrimary,
                      '& fieldset': { borderColor: 'rgba(167,139,250,0.12)' },
                      '&:hover fieldset': { borderColor: 'rgba(167,139,250,0.3)' },
                      '&.Mui-focused fieldset': { borderColor: D.accent },
                    },
                  }}
                />

                {/* Separator */}
                <Box sx={{ width: '1px', height: 24, backgroundColor: 'rgba(167,139,250,0.12)', mx: 1.5, flexShrink: 0 }} />

                {/* Status pills */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(167,139,250,0.14)`,
                  borderRadius: 3, px: 1.25, py: 0.5,
                }}>
                  {[
                    { key: '',            label: 'All',         accent: D.accent  },
                    { key: 'to_be_done',  label: 'To Do',       accent: '#9d8fce' },
                    { key: 'in_progress', label: 'In Progress', accent: '#f59e0b' },
                    { key: 'done',        label: 'Done',        accent: '#34d399' },
                  ].map(({ key, label, accent }) => {
                    const active = statusFilter === key;
                    const count = key ? counts[key] : allTodos.length;
                    return (
                      <Box
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 0.65,
                          px: 1.4, py: 0.55,
                          borderRadius: 99,
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: active ? 700 : 500,
                          whiteSpace: 'nowrap',
                          userSelect: 'none',
                          color: active ? accent : D.textSecondary,
                          background: active
                            ? `linear-gradient(135deg, ${accent}28 0%, ${accent}14 100%)`
                            : 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                          border: `1px solid ${active ? `${accent}55` : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: active ? `inset 0 1px 0 rgba(255,255,255,0.1)` : 'inset 0 1px 0 rgba(255,255,255,0.07)',
                          transition: 'all 0.18s ease',
                          '&:hover': {
                            color: accent,
                            background: `linear-gradient(135deg, ${accent}1e 0%, ${accent}0c 100%)`,
                            border: `1px solid ${accent}44`,
                          },
                        }}
                      >
                        <Box sx={{
                          width: 6, height: 6, borderRadius: '50%',
                          backgroundColor: accent,
                          opacity: active ? 1 : 0.5,
                          flexShrink: 0,
                        }} />
                        {label}
                        <Box component="span" sx={{
                          minWidth: 18, height: 18, px: 0.5, borderRadius: 99,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 700,
                          backgroundColor: active ? `${accent}30` : 'rgba(255,255,255,0.08)',
                          color: active ? accent : D.textSecondary,
                        }}>
                          {count}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {/* Separator */}
                <Box sx={{ width: '1px', height: 24, backgroundColor: 'rgba(167,139,250,0.12)', mx: 1.5, flexShrink: 0 }} />

                {/* Date filter */}
                <Box sx={{ position: 'relative' }}>
                  <Box
                    ref={dateTriggerRef}
                    onClick={() => setDatePickerOpen(true)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 0.75,
                      px: 1.5, height: 36, borderRadius: 2.5, border: '1px solid',
                      borderColor: dateFilter ? `${D.accent}44` : 'rgba(167,139,250,0.12)',
                      backgroundColor: dateFilter ? D.accentLight : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      '&:hover': { borderColor: `${D.accent}66` },
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 14, color: dateFilter ? D.accent : D.textTertiary }} />
                    <Typography sx={{ fontSize: '0.84rem', color: dateFilter ? D.accent : D.textSecondary, whiteSpace: 'nowrap', userSelect: 'none', fontWeight: dateFilter ? 600 : 400 }}>
                      {dateValue ? dateValue.format('MMM D, YYYY') : 'Filter by date'}
                    </Typography>
                    {dateFilter && (
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDateValue(null); setDateFilter(''); }} sx={{ p: 0.2 }}>
                        <CloseIcon sx={{ fontSize: 12, color: D.textSecondary }} />
                      </IconButton>
                    )}
                  </Box>
                  <DatePicker
                    value={dateValue}
                    open={datePickerOpen}
                    onOpen={() => setDatePickerOpen(true)}
                    onClose={() => setDatePickerOpen(false)}
                    onChange={(val: Dayjs | null) => {
                      setDateValue(val); setDateFilter(val ? val.format('YYYY-MM-DD') : '');
                      setDatePickerOpen(false);
                    }}
                    slotProps={{
                      textField: { sx: { display: 'none' } },
                      popper: { placement: 'bottom-start', anchorEl: dateTriggerRef.current, sx: datePickerPopperSx },
                    }}
                  />
                </Box>

                {hasFilters && (
                  <Button
                    size="small" variant="outlined"
                    onClick={() => { setStatusFilter(''); setSearchFilter(''); setDateFilter(''); setDateValue(null); }}
                    sx={{
                      fontSize: '0.78rem', px: 1.5, py: 0.4, borderRadius: 2,
                      color: '#34d399', borderColor: 'rgba(52,211,153,0.3)',
                      '&:hover': { color: '#34d399', borderColor: 'rgba(52,211,153,0.6)', backgroundColor: 'rgba(52,211,153,0.08)' },
                    }}
                  >
                    Clear filters
                  </Button>
                )}

                {/* View toggle */}
                <Box sx={{ ml: 'auto' }}>
                  <ToggleButtonGroup
                    value={viewMode} exclusive
                    onChange={(_, val) => { if (val) setViewMode(val); }}
                    size="small"
                    sx={{
                      height: 34,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${D.border}`,
                      borderRadius: 2,
                      '& .MuiToggleButton-root': {
                        border: 'none', color: D.textTertiary, px: 1.25,
                        '&.Mui-selected': { backgroundColor: D.accentMid, color: D.accent },
                        '&:hover': { backgroundColor: D.accentLight },
                      },
                    }}
                  >
                    <ToggleButton value="kanban" aria-label="Board view">
                      <Tooltip title="Board view"><ViewKanbanIcon sx={{ fontSize: 18 }} /></Tooltip>
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="List view">
                      <Tooltip title="List view"><ViewListIcon sx={{ fontSize: 18 }} /></Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </Box>

            {/* ── Content ── */}
            <Box sx={{ px: 4, py: 3.5 }}>
              {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

              {/* ── BANDED ROWS VIEW (kanban) ── */}
              {viewMode === 'kanban' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {COLUMNS.filter((col) => !statusFilter || col.key === statusFilter).map((col, colIdx) => {
                    const colTodos = todos.filter((t) => t.status === col.key);
                    const isLast = colIdx === COLUMNS.filter((c) => !statusFilter || c.key === statusFilter).length - 1;
                    return (
                      <Box key={col.key} sx={{ mb: isLast ? 0 : 5 }}>

                        {/* ── Section header ── */}
                        <Box sx={{
                          display: 'flex', alignItems: 'center', gap: 0,
                          mb: 2.5, position: 'relative',
                        }}>
                          {/* Left accent bar */}
                          <Box sx={{
                            width: 3, height: 36, borderRadius: 99,
                            backgroundColor: col.accent,
                            boxShadow: `0 0 14px ${col.glow}`,
                            flexShrink: 0, mr: 1.5,
                          }} />

                          {/* Label + count */}
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25, flex: 1 }}>
                            <Typography sx={{
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: col.accent,
                              lineHeight: 1,
                            }}>
                              {col.label}
                            </Typography>
                            <Typography sx={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: D.textTertiary,
                              letterSpacing: '0.02em',
                            }}>
                              {loading ? '—' : `${colTodos.length} ${colTodos.length === 1 ? 'task' : 'tasks'}`}
                            </Typography>
                          </Box>

                          {/* Hairline rule extending to right */}
                          <Box sx={{
                            flex: 1,
                            height: '1px',
                            background: `linear-gradient(90deg, ${col.accent}30 0%, ${col.accent}08 60%, transparent 100%)`,
                            ml: 2,
                          }} />

                          {/* Add task shortcut */}
                          <Box
                            onClick={() => openCreate(col.key)}
                            sx={{
                              ml: 2, display: 'flex', alignItems: 'center', gap: 0.5,
                              px: 1.25, py: 0.5, borderRadius: 99,
                              border: `1px solid ${col.accent}28`,
                              color: col.accent, fontSize: '0.72rem', fontWeight: 600,
                              cursor: 'pointer', opacity: 0.7,
                              transition: 'all 0.18s ease',
                              '&:hover': { opacity: 1, backgroundColor: `${col.accent}12`, borderColor: `${col.accent}55` },
                            }}
                          >
                            <AddIcon sx={{ fontSize: 12 }} />
                            Add
                          </Box>
                        </Box>

                        {/* ── Cards ── */}
                        {loading ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                            <CardSkeleton /><CardSkeleton />
                          </Box>
                        ) : colTodos.length === 0 ? (
                          <Box onClick={() => openCreate(col.key)} sx={{
                            border: `1.5px dashed ${col.accent}22`, borderRadius: 2,
                            py: 3, px: 2.5, display: 'flex', alignItems: 'center', gap: 1.25,
                            cursor: 'pointer', color: D.textTertiary, fontSize: '0.82rem', fontWeight: 500,
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: `${col.accent}44`, color: col.accent, backgroundColor: `${col.accent}06` },
                          }}>
                            <AddIcon sx={{ fontSize: 15 }} />
                            No tasks here — add one
                          </Box>
                        ) : (
                          <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                            gap: 1.5,
                            alignItems: 'start',
                          }}>
                            {colTodos.map((todo) => (
                              <TaskCard key={todo.id} todo={todo}
                                onStatusChange={handleStatusChange} onEdit={openEdit} onDelete={(id) => setDeleteId(id)} />
                            ))}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* ── LIST VIEW ── */}
              {viewMode === 'list' && (
                <Box>
                  {COLUMNS.filter((col) => !statusFilter || col.key === statusFilter).map((col) => {
                    const colTodos = todos.filter((t) => t.status === col.key);
                    if (!loading && colTodos.length === 0 && statusFilter) return null;
                    return (
                      <Box key={col.key} sx={{ mb: 3.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.accent, boxShadow: `0 0 8px ${col.glow}` }} />
                          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.07em', textTransform: 'uppercase', color: col.accent }}>
                            {col.label}
                          </Typography>
                          <Chip label={loading ? '—' : colTodos.length} size="small"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, backgroundColor: `${col.accent}20`, color: col.accent, border: `1px solid ${col.accent}55` }}
                          />
                        </Box>

                        {loading ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <CardSkeleton /><CardSkeleton />
                          </Box>
                        ) : colTodos.length === 0 ? (
                          <Box onClick={() => openCreate(col.key)} sx={{
                            border: `1.5px dashed rgba(167,139,250,0.14)`, borderRadius: 2.5,
                            py: 2.5, px: 2, display: 'flex', alignItems: 'center', gap: 1,
                            cursor: 'pointer', color: D.textTertiary, fontSize: '0.82rem',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: `${col.accent}44`, color: col.accent, backgroundColor: D.accentLight },
                          }}>
                            <AddIcon sx={{ fontSize: 15 }} /> Add a task
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            {colTodos.map((todo) => (
                              <TaskCard key={todo.id} todo={todo} listView
                                onStatusChange={handleStatusChange} onEdit={openEdit} onDelete={(id) => setDeleteId(id)} />
                            ))}
                          </Box>
                        )}
                        <Divider sx={{ mt: 3, borderColor: D.divider }} />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>

          {/* ── Create Dialog ── */}
          <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>New task</DialogTitle>
            <Divider sx={{ borderColor: D.divider }} />
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  fullWidth autoFocus onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleCreate(); }} />
                <TextField label="Description (optional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                  fullWidth multiline rows={3} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select value={newPriority} label="Priority" onChange={(e) => setNewPriority(e.target.value as TodoPriority)} sx={selectSx}>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                  <DatePicker label="Due date" value={newDueDate} onChange={(val) => setNewDueDate(val)}
                    slotProps={{
                      textField: { size: 'small', sx: { flex: 1 }, required: true },
                      popper: { sx: datePickerPopperSx },
                    }}
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button variant="text" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreate} disabled={!newTitle.trim() || !newDueDate || creating}>
                {creating ? <CircularProgress size={18} sx={{ color: '#0d1117' }} /> : 'Create task'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* ── Edit Dialog ── */}
          <Dialog open={!!editTodo} onClose={() => setEditTodo(null)} fullWidth maxWidth="sm">
            <DialogTitle>Edit task</DialogTitle>
            <Divider sx={{ borderColor: D.divider }} />
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                  fullWidth autoFocus onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleEdit(); }} />
                <TextField label="Description (optional)" value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                  fullWidth multiline rows={3} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select value={editPriority} label="Priority" onChange={(e) => setEditPriority(e.target.value as TodoPriority)} sx={selectSx}>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                  <DatePicker label="Due date" value={editDueDate} onChange={(val) => setEditDueDate(val)}
                    slotProps={{
                      textField: { size: 'small', sx: { flex: 1 } },
                      popper: { sx: datePickerPopperSx },
                    }}
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button variant="text" onClick={() => setEditTodo(null)}>Cancel</Button>
              <Button variant="contained" onClick={handleEdit} disabled={!editTitle.trim() || saving}>
                {saving ? <CircularProgress size={18} sx={{ color: '#0d1117' }} /> : 'Save changes'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* ── Delete Dialog ── */}
          <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
            <DialogTitle>Delete task?</DialogTitle>
            <DialogContent>
              <Typography sx={{ color: D.textSecondary, fontSize: '0.9rem' }}>This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button variant="text" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="contained" onClick={handleDelete} disabled={deleting}
                sx={{ backgroundColor: '#f87171', color: '#0d1117', '&:hover': { backgroundColor: '#ef4444', boxShadow: '0 4px 12px rgba(248,113,113,0.35)' } }}>
                {deleting ? <CircularProgress size={18} sx={{ color: '#0d1117' }} /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>

        </Box>
      </LocalizationProvider>
    </ProtectedRoute>
  );
}
