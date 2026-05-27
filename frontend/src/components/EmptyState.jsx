function EmptyState({ title, text }) {
    return (
        <div className="empty-state-card">
            <h3>{title}</h3>
            <p>{text}</p>
        </div>
    );
}

export default EmptyState;