function ConfirmModal({ title, text, confirmText = "Підтвердити", onConfirm, onCancel }) {
    return (
        <div className="modal-backdrop">
            <div className="confirm-modal">
                <h3>{title}</h3>
                <p>{text}</p>

                <div className="cart-item-actions">
                    <button className="danger-button" onClick={onConfirm}>
                        {confirmText}
                    </button>
                    <button onClick={onCancel}>Скасувати</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
