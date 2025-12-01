export default function Toast({ message, type = 'error' }) {
  return (
    <div className={`toast toast-${type}`}>
      {type === 'error' && '❌ '}
      {type === 'success' && '✅ '}
      {message}
    </div>
  );
}
