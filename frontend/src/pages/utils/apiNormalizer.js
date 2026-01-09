// utils/apiNormalizer.js
export function normalizeResponse(response) {
  if (response && response.data !== undefined) {
    return response.data;
  }
  return response;
}

// Usage
fetchUserData().then(response => {
  setUserData(normalizeResponse(response));
});