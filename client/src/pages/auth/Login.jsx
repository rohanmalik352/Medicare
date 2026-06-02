// Inside your Login.jsx component under handleSubmit() where success is handled:
const runtimeUser = result.user
if (runtimeUser && runtimeUser.name) {
  toast.success(`Welcome back, ${runtimeUser.name}!`)
  
  // 🌟 THE FIX: Force a 50ms task deferral so React Context updates finish writing to memory first
  setTimeout(() => {
    if (runtimeUser.role === 'PATIENT') {
      navigate('/patient/dashboard')
    } else if (runtimeUser.role === 'ADMIN') {
      navigate('/admin/dashboard')
    } else {
      navigate('/doctor/dashboard')
    }
  }, 50)
} else {
  throw new Error('Authentication schema received is incomplete.')
}