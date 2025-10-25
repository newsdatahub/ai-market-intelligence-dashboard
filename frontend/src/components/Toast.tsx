import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import styles from './Toast.module.css';

type ToastType = 'error' | 'success' | 'info';

type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 5000; // 5 seconds
const DEFAULT_POSITION: ToastPosition = 'top-right';

const POSITION_CLASS_MAP: Record<ToastPosition, string> = {
  'top-right': styles.topRight,
  'top-center': styles.topCenter,
  'bottom-right': styles.bottomRight,
  'bottom-center': styles.bottomCenter,
};

export const ToastProvider: React.FC<{ children: React.ReactNode; position?: ToastPosition }> = ({
  children,
  position = DEFAULT_POSITION
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = DEFAULT_DURATION) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const value: ToastContextValue = {
    showToast,
    error,
    success,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className={`${styles.container} ${POSITION_CLASS_MAP[position]}`}>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={removeToast}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  };

  const icon = type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️';

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${isVisible ? styles.visible : styles.enter}`}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
