import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Flame, Coins, Star, Trophy, RotateCcw, Home, Eye, Gamepad2, Award, Sparkles, LayoutDashboard, Bell, LogIn, UserPlus, Dna, Cpu, Activity, Bot } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { useAuth } from '../context/AuthContext'
import UserDropdown from './auth/UserDropdown'
import { motion } from 'framer-motion'

import { NeuralCore3D } from './brand/NeuralCore3D'
import { NotificationDropdown } from './brand/NotificationDropdown'

export default function Header() {
  const { progress, resetProgress } = useGame()
  const { user } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isQuest = pathname.startsWith('/quest')
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Smart header hide/show on scroll
  useEffect(() => {
    let lastY = window.scrollY
    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(y > 30)
      if (y > lastY + 6 && y > 100) {
        setHidden(true)
      } else if (y < lastY - 6) {
        setHidden(false)
      }
      lastY = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { path: '/', label: 'Hub', icon: Home, exact: true },
    { path: '/learn/main.html', label: 'Visualize', icon: Eye, external: true },
    { path: '/quest', label: 'Quest', icon: Gamepad2 },
    { path: '/genome', label: 'Genome', icon: Dna },
    { path: '/neural-lab', label: 'Neural Lab', icon: Cpu },
    { path: '/model-lab', label: 'Model Lab', icon: Activity },
    { path: '/chat', label: 'AI Tutor', icon: Bot },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ]

  return (
    <motion.header
      className={`topbar ${scrolled ? 'topbar-scrolled' : ''} ${hidden ? 'topbar-hidden' : ''}`}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: hidden ? -90 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to="/" className="brand" data-magnetic>
        <NeuralCore3D />
        <span>
          Into the <em>Algorithm</em>
        </span>
      </Link>

      <nav className="topnav">
        {navItems.map((item) => {
          const IconComp = item.icon
          if (item.external) {
            return (
              <a key={item.path} href={item.path} className="nav-link" data-magnetic>
                <IconComp size={15} />
                <span>{item.label}</span>
              </a>
            )
          }

          const isActive = item.exact
            ? pathname === item.path
            : pathname.startsWith(item.path) && (item.path !== '/quest' || pathname === '/quest' || pathname.startsWith('/quest/level'))

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={`nav-link ${isActive ? 'active' : ''}`}
              data-magnetic
            >
              <IconComp size={15} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="nav-active-glow-line"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Authenticated State vs Guest State */}
      {user ? (
        <div className="header-auth-actions-group">
          {/* User Progress Counter Badges */}
          <div className="stats-pill">
            <span title="Streak Days">
              <Flame size={15} color="#67e8f9" /> {progress.streak || 0}d
            </span>
            <span title="Quest Coins">
              <Coins size={15} color="#fbbf24" /> {progress.coins || 0}
            </span>
            <span title="Badges Unlocked">
              <Trophy size={15} color="#34d399" /> {progress.badges?.length || 0}
            </span>
          </div>

          {/* Notification Bell */}
          <NotificationDropdown />

          {/* User Profile Dropdown */}
          <UserDropdown />
        </div>
      ) : (
        <div className="header-guest-cta-group">
          <Link to="/auth" className="guest-nav-btn login-btn" data-magnetic>
            <LogIn size={14} />
            <span>Login</span>
          </Link>
          <Link to="/auth" className="guest-nav-btn signup-btn" data-magnetic>
            <UserPlus size={14} />
            <span>Sign Up</span>
          </Link>
        </div>
      )}
    </motion.header>
  )
}
