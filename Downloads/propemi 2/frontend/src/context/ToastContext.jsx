import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={id => setToasts(t => t.filter(x => x.id !== id))} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  const ICONS = { success: "✓", error: "✕", info: "i" };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onRemove(t.id)}>
          <span className="toast-icon-wrap">{ICONS[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export const useToast = () => useContext(ToastContext);