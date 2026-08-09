import React, { useState, useRef, useEffect } from 'react'
import { Bell, Trophy, Cpu, Bot, Sparkles, Trash2, CheckSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'

export function NotificationDropdown() {
  const { user } = useAuth()
  const { progress } = useGame()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const userId = user?.id || 'guest'
  const storageKey = `ml_notifications_${userId}`

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Error reading notifications:', e)
    }

    // Default notifications if none exist
    return [
      {
        id: 'default-welcome',
        type: 'system',
        title: 'Welcome to Into the Algorithm!',
        description: 'Explore the Neural Simulator Lab and chat with the AI Tutor to master ML.',
        time: new Date(Date.now() - 60000 * 5).toISOString(), // 5 mins ago
        read: false
      },
      {
        id: 'default-quest',
        type: 'quest',
        title: 'Quest Mode Active',
        description: 'Earn coins, unlock achievement badges, and keep your daily streak alive.',
        time: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        read: false
      },
      {
        id: 'default-atlas',
        type: 'ai',
        title: 'ATLAS Coach is Online',
        description: 'Your elite AI Laboratory Mentor is ready to evaluate model datasets.',
        time: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        read: false
      }
    ]
  })

  // Persist notifications to local storage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications))
    } catch (e) {
      console.error('Error saving notifications:', e)
    }
  }, [notifications, storageKey])

  // Track dynamic events (new badges) from context
  useEffect(() => {
    if (!progress.badges || progress.badges.length === 0) return

    // Find any badges that aren't already represented in notifications
    const existingBadgeNotifications = new Set(
      notifications
        .filter(n => n.type === 'badge')
        .map(n => n.badgeId)
    )

    const newBadgeAlerts = []
    progress.badges.forEach(badgeId => {
      if (!existingBadgeNotifications.has(badgeId)) {
        newBadgeAlerts.push({
          id: `badge-${badgeId}-${Date.now()}`,
          type: 'badge',
          badgeId,
          title: 'New Achievement Unlocked!',
          description: `You unlocked the ${badgeId.toUpperCase()} badge. +10 Coins awarded!`,
          time: new Date().toISOString(),
          read: false
        })
      }
    })

    if (newBadgeAlerts.length > 0) {
      setNotifications(prev => [...newBadgeAlerts, ...prev])
    }
  }, [progress.badges])

  // Track dynamic events (coin balance changes)
  const prevCoinsRef = useRef(progress.coins || 0)
  useEffect(() => {
    const currentCoins = progress.coins || 0
    if (currentCoins > prevCoinsRef.current) {
      const diff = currentCoins - prevCoinsRef.current
      const newAlert = {
        id: `coins-${Date.now()}`,
        type: 'coins',
        title: 'Reward Earned!',
        description: `You received +${diff} Quest Coins. Keep up the great work!`,
        time: new Date().toISOString(),
        read: false
      }
      setNotifications(prev => [newAlert, ...prev])
    }
    prevCoinsRef.current = currentCoins
  }, [progress.coins])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper to format timestamps human-readably
  const formatTime = (isoString) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      return new Date(isoString).toLocaleDateString()
    } catch {
      return ''
    }
  }

  // Helper to select icon based on type
  const getIcon = (type) => {
    switch (type) {
      case 'badge':
        return <Trophy size={15} color="#fbbf24" />
      case 'quest':
        return <Sparkles size={15} color="#ec4899" />
      case 'ai':
        return <Bot size={15} color="#a855f7" />
      case 'system':
        return <Cpu size={15} color="#06b6d4" />
      default:
        return <Sparkles size={15} color="#3b82f6" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const handleToggle = () => setIsOpen(!isOpen)

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const handleMarkItemRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className="user-dropdown-wrapper" ref={dropdownRef}>
      {/* Notification Bell Trigger Button */}
      <button
        type="button"
        className={`nav-icon-btn ${isOpen ? 'active' : ''}`}
        title="Notifications"
        onClick={handleToggle}
        data-magnetic
      >
        <Bell size={16} />
        {unreadCount > 0 && <span className="bell-badge-dot" />}
      </button>

      {/* Glassmorphic Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass-dropdown-menu notif-dropdown-menu"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '290px' }}
          >
            {/* Header info */}
            <div className="dropdown-head-box" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <strong style={{ color: '#fff', fontSize: '0.88rem' }}>Notifications</strong>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="nav-icon-btn"
                  style={{ width: '26px', height: '26px', border: 'none', background: 'rgba(255,255,255,0.06)' }}
                >
                  <CheckSquare size={13} color="#94a3b8" />
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  title="Clear all notifications"
                  className="nav-icon-btn"
                  style={{ width: '26px', height: '26px', border: 'none', background: 'rgba(255,255,255,0.06)' }}
                >
                  <Trash2 size={13} color="#ef4444" />
                </button>
              </div>
            </div>

            {/* List Box */}
            <div className="dropdown-links-list" style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '0.2rem' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>
                  No notifications yet.
                </div>
              ) : (
                notifications.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleMarkItemRead(item.id)}
                    className="dropdown-link-item"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                      padding: '0.55rem 0.5rem',
                      borderRadius: '10px',
                      background: item.read ? 'transparent' : 'rgba(59, 130, 246, 0.06)',
                      border: item.read ? '1px solid transparent' : '1px solid rgba(59, 130, 246, 0.15)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.04)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        marginTop: '0.1rem'
                      }}
                    >
                      {getIcon(item.type)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', flexShrink: 0 }}>
                          {formatTime(item.time)}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.35, wordBreak: 'break-word' }}>
                        {item.description}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
