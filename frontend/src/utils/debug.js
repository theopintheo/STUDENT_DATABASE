// src/utils/debug.js
export function safeRender(obj) {
  if (typeof obj === 'object' && obj !== null) {
    return <pre style={{ 
      background: '#ffebee', 
      color: '#c62828', 
      padding: '10px',
      border: '1px solid #ffcdd2',
      borderRadius: '4px'
    }}>
      ⚠️ Object cannot be rendered directly. Use JSON.stringify:<br/>
      {JSON.stringify(obj, null, 2)}
    </pre>;
  }
  return obj;
}