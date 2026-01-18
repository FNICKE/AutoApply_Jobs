// src/components/common/Button.jsx
function Button({ children, onClick, variant = 'primary', className = '' }) {
  const base = 'px-4 py-2 rounded font-semibold transition-colors'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button