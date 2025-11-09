import { useEffect, useState } from 'react';
import Icon, { ICONS } from '../../components/common/Icon';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <Icon name={ICONS.CHECK} className="w-6 h-6 text-success-500" />,
    error: <Icon name={ICONS.ERROR} className="w-6 h-6 text-error-500" />,
    warning: <Icon name={ICONS.WARNING} className="w-6 h-6 text-warning-500" />,
  };

  const bgColors = {
    success: 'bg-success-50 border-success-200',
    error: 'bg-error-50 border-error-200',
    warning: 'bg-warning-50 border-warning-200',
  };

  const textColors = {
    success: 'text-success-800',
    error: 'text-error-800',
    warning: 'text-warning-800',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[type]} ${textColors[type]} min-w-[300px] max-w-md`}
      >
        {icons[type]}
        <p className="flex-1 font-medium text-sm">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="hover:opacity-70 transition"
        >
          <Icon name={ICONS.CLOSE} className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Toast container hook
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
}