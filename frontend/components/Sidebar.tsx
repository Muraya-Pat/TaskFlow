'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Box, Avatar, Typography, IconButton, Tooltip, Divider,
} from '@mui/material';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { label: 'Tasks', href: '/', icon: CheckBoxOutlinedIcon },
  { label: 'Profile', href: '/profile', icon: PersonOutlineIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Box
      component="nav"
      sx={{
        width: 220,
        flexShrink: 0,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(8, 12, 24, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        zIndex: 100,
        py: 3,
        px: 2,
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 1, mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            color: '#a78bfa',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontSize: '1.15rem',
          }}
        >
          TaskFlow
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem' }}>
          Stay in flow
        </Typography>
      </Box>

      {/* Nav links */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Box
              key={href}
              onClick={() => router.push(href)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: active ? 'rgba(167,139,250,0.12)' : 'transparent',
                color: active ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                '&:hover': {
                  backgroundColor: active
                    ? 'rgba(167,139,250,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  color: active ? '#a78bfa' : 'rgba(255,255,255,0.75)',
                },
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.875rem',
                  letterSpacing: active ? '0' : '0.01em',
                }}
              >
                {label}
              </Typography>
              {active && (
                <Box
                  sx={{
                    ml: 'auto',
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    backgroundColor: '#a78bfa',
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Bottom: user + logout */}
      <Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1,
          }}
        >
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: 'rgba(167,139,250,0.15)',
              color: '#a78bfa',
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 500,
                fontSize: '0.78rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'rgba(255,255,255,0.28)',
                fontSize: '0.68rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
          <Tooltip title="Sign out" placement="top">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{
                color: 'rgba(255,255,255,0.3)',
                '&:hover': { color: '#f87171', backgroundColor: 'rgba(248,113,113,0.08)' },
              }}
            >
              <LogoutIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
