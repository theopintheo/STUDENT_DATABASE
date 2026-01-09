// ✅ This is fine - API returns object
export async function fetchUserData() {
  const response = await fetch('/api/user');
  const data = await response.json();
  return {
    success: true,
    data: { name: 'John', email: 'john@example.com' }
  };
}