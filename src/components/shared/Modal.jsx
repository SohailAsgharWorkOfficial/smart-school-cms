function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="split-header">
          <h3>{title}</h3>
          <button className="icon-button" type="button" onClick={onClose}>
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
