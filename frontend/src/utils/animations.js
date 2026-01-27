// Soft animation utilities for smooth micro-interactions

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
}

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Soft hover glow effect
export const hoverGlow = {
  transition: {
    duration: 0.3,
    ease: 'easeInOut'
  },
  whileHover: {
    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)',
    scale: 1.02
  }
}
