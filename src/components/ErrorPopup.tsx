import { motion, AnimatePresence } from 'framer-motion'

interface ErrorPopupProps {
  message: string
  onClose: () => void
}

export function ErrorPopup({ message, onClose }: ErrorPopupProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg"
      >
        <div className="flex items-center gap-2">
          <span>{message}</span>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 