// src/components/ApiResponseHandler.jsx
const ApiResponseHandler = ({ response, children, onError }) => {
  if (!response) return <div>No response</div>;
  
  if (response.success === false) {
    return (
      <div className="error">
        <h3>Error occurred</h3>
        <pre>{JSON.stringify(response.error, null, 2)}</pre>
        {onError && <button onClick={onError}>Retry</button>}
      </div>
    );
  }
  
  return children(response.data);
};

// Usage:
<ApiResponseHandler response={apiResponse}>
  {(data) => (
    <div>
      <h2>{data.name}</h2>
      <DebugView data={data} />
    </div>
  )}
</ApiResponseHandler>