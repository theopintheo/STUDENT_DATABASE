// src/components/DebugView.jsx
// In your problematic component
import { DebugView } from './components/DebugView';

function YourComponent() {
  const [apiData, setApiData] = useState({ 
    success: true, 
    data: { /* your data */ } 
  });
  
  return (
    <div>
      <DebugView data={apiData} label="API Response" />
      
      {/* Then fix your actual rendering */}
      {apiData.success && (
        <div>
          {/* Render your actual UI here */}
          <h2>{apiData.data.title}</h2>
          <p>{apiData.data.description}</p>
        </div>
      )}
    </div>
  );
}
export const DebugView = ({ data, label = "Data" }) => {
  return (
    <div style={{ 
      background: '#f0f0f0', 
      padding: '10px', 
      margin: '10px 0',
      borderRadius: '4px'
    }}>
      <h4>{label}:</h4>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};