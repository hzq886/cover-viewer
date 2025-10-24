"use client";

import { type ReactNode } from "react";

type ViewerModalProps = {
  open: boolean;
  onClose: () => void;
  poster: ReactNode;
  info: ReactNode;
};

function ViewerModal({ open, onClose, poster, info }: ViewerModalProps) {
  if (!open) return null;

  return (
    <div className="viewer-modal" role="dialog" aria-modal="true">
      <div className="viewer-modal__backdrop" onClick={onClose} />
      <div className="viewer-modal__content">
        <button
          type="button"
          className="viewer-modal__close"
          onClick={onClose}
          aria-label="关闭"
        >
          ×
        </button>
        <div className="viewer-modal__body">
          {poster ? (
            <div className="viewer-modal__panel viewer-modal__poster">
              {poster}
            </div>
          ) : null}
          {info ? (
            <div className="viewer-modal__panel viewer-modal__info">
              {info}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ViewerModal;
