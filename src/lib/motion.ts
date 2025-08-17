import { Variants } from 'framer-motion'

export const motionVariants = {
  // Quick in animation (opacity + translateY 8px)
  quickIn: {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  },
  
  // Soft scale for cards on hover
  softScale: {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  },
  
  // Fade in
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  
  // Fade (simple opacity transition)
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  
  // Slide up
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  
  // Slide down
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  
  // Slide left
  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  
  // Slide right
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  
  // Stagger children
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  
  // Modal/drawer animations
  modal: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }
    },
    exit: { opacity: 0, scale: 0.95, y: 20 },
  },
  
  // Drawer animations
  drawer: {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }
    },
    exit: { x: '100%' },
  },
  
  // List item animations
  listItem: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  
  // Page transitions
  page: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      }
    },
    exit: { opacity: 0, y: -20 },
  },
} as const

// Transition presets
export const transitions = {
  quick: { duration: 0.2, ease: 'easeOut' },
  smooth: { duration: 0.3, ease: 'easeOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
} as const

// Helper function to create staggered animations
export const createStaggeredAnimation = (delay: number = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
    },
  },
})

// Helper function to create hover animations
export const createHoverAnimation = (scale: number = 1.02): Variants => ({
  initial: { scale: 1 },
  hover: { scale },
  tap: { scale: 0.98 },
})
