export const unAuthorized = () => {
  localStorage.removeItem('accessToken')
  const event = new Event('unauthorized')
  window.dispatchEvent(event)
}