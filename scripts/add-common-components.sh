#!/usr/bin/env bash
# scripts/add-common-components.sh
# สร้าง common UI components + barrel export สำหรับโปรเจกต์ React (Tailwind + lucide-react)

set -euo pipefail

ROOT_DIR="$(pwd)"
COMMON_DIR="src/components/common"
SCRIPT_NAME="$(basename "$0")"

echo "[$SCRIPT_NAME] Starting..."
mkdir -p "$COMMON_DIR"

backup_if_exists () {
  local f="$1"
  if [[ -f "$f" ]]; then
    cp -f "$f" "${f}.bak"
    echo "  - backup: ${f}.bak"
  fi
}

write_file () {
  local path="$1"
  shift
  backup_if_exists "$path"
  cat > "$path" <<'EOF'
$CONTENT$
EOF
  echo "  - wrote: $path"
}

# ------------ LoadingSpinner.jsx ------------
CONTENT=$'import React from \'react\'\nimport { Loader2 } from \'lucide-react\'\n\nfunction LoadingSpinner({ size = \'md\', text = \'กำลังโหลด...\' }) {\n  const sizeClasses = {\n    sm: \'w-4 h-4\',\n    md: \'w-8 h-8\',\n    lg: \'w-12 h-12\'\n  }\n\n  return (\n    <div className="flex flex-col items-center justify-center p-8">\n      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-500 mb-2`} />\n      {text && (\n        <p className="text-gray-600 text-sm font-thai">{text}</p>\n      )}\n    </div>\n  )\n}\n\nexport default LoadingSpinner\n'
write_file "$COMMON_DIR/LoadingSpinner.jsx"

# ------------ ErrorBoundary.jsx ------------
CONTENT=$'import React from \'react\'\nimport { AlertTriangle, RefreshCw } from \'lucide-react\'\n\nclass ErrorBoundary extends React.Component {\n  constructor(props) {\n    super(props)\n    this.state = { hasError: false, error: null }\n  }\n\n  static getDerivedStateFromError(error) {\n    return { hasError: true, error }\n  }\n\n  componentDidCatch(error, errorInfo) {\n    console.error(\'Error Boundary caught an error:\', error, errorInfo)\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return (\n        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">\n          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">\n            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />\n            <h2 className="text-2xl font-bold text-gray-800 mb-2 font-thai">เกิดข้อผิดพลาด</h2>\n            <p className="text-gray-600 mb-6 font-thai">ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด</p>\n            <button\n              onClick={() => window.location.reload()}\n              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto font-thai"\n            >\n              <RefreshCw className="w-4 h-4" /> รีเฟรชหน้า\n            </button>\n          </div>\n        </div>\n      )\n    }\n    return this.props.children\n  }\n}\n\nexport default ErrorBoundary\n'
write_file "$COMMON_DIR/ErrorBoundary.jsx"

# ------------ Avatar.jsx ------------
CONTENT=$'import React from \'react\'\n\nfunction Avatar({ \n  src, \n  name = \'\', \n  size = \'md\', \n  className = \'\', \n  fallbackBg = \'bg-gradient-to-br from-purple-400 to-pink-400\' \n}) {\n  const sizeClasses = {\n    xs: \'w-6 h-6 text-xs\',\n    sm: \'w-8 h-8 text-sm\',\n    md: \'w-12 h-12 text-base\',\n    lg: \'w-16 h-16 text-lg\',\n    xl: \'w-24 h-24 text-2xl\',\n    \'2xl\': \'w-32 h-32 text-4xl\'\n  }\n\n  const generateInitials = (name) => {\n    if (!name) return \'?\'\n    const words = name.split(\' \')\n    if (words.length >= 2) {\n      return (words[0][0] + words[1][0]).toUpperCase()\n    }\n    return name.substring(0, 2).toUpperCase()\n  }\n\n  const generateAvatarUrl = (name) => {\n    if (!name) return null\n    const seed = encodeURIComponent(name)\n    const backgrounds = [\'b6e3f4\', \'c084fc\', \'fde68a\', \'a7f3d0\', \'fda4af\', \'fb7185\']\n    const bgColor = backgrounds[Math.floor(Math.random() * backgrounds.length)]\n    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${bgColor}`\n  }\n\n  const avatarSrc = src || generateAvatarUrl(name)\n\n  return (\n    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center ${className}`}>\n      {avatarSrc ? (\n        <img\n          src={avatarSrc}\n          alt={name}\n          className="w-full h-full object-cover"\n          onError={(e) => {\n            e.target.style.display = \'none\'\n            e.target.nextSibling.style.display = \'flex\'\n          }}\n        />\n      ) : null}\n      <div\n        className={`w-full h-full ${fallbackBg} flex items-center justify-center text-white font-bold font-thai ${!avatarSrc ? \'flex\' : \'hidden\'}`}\n      >\n        {generateInitials(name)}\n      </div>\n    </div>\n  )\n}\n\nexport default Avatar\n'
write_file "$COMMON_DIR/Avatar.jsx"

# ------------ Button.jsx ------------
CONTENT=$'import React from \'react\'\nimport { Loader2 } from \'lucide-react\'\n\nfunction Button({\n  children,\n  variant = \'primary\',\n  size = \'md\',\n  loading = false,\n  disabled = false,\n  icon: Icon,\n  className = \'\',\n  ...props\n}) {\n  const baseClasses = \'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-thai\'\n  \n  const variants = {\n    primary: \'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white focus:ring-purple-500\',\n    secondary: \'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-blue-500\',\n    success: \'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white focus:ring-green-500\',\n    danger: \'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white focus:ring-red-500\',\n    warning: \'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white focus:ring-yellow-500\'\n  }\n\n  const sizes = {\n    sm: \'px-3 py-1.5 text-sm\',\n    md: \'px-4 py-2 text-base\',\n    lg: \'px-6 py-3 text-lg\'\n  }\n\n  const isDisabled = disabled || loading\n\n  return (\n    <button\n      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}\n      disabled={isDisabled}\n      {...props}\n    >\n      {loading ? (\n        <Loader2 className="w-4 h-4 animate-spin" />\n      ) : Icon ? (\n        <Icon className="w-4 h-4" />\n      ) : null}\n      {children}\n    </button>\n  )\n}\n\nexport default Button\n'
write_file "$COMMON_DIR/Button.jsx"

# ------------ Card.jsx ------------
CONTENT=$'import React from \'react\'\n\nfunction Card({ \n  children, \n  className = \'\', \n  padding = \'p-6\',\n  hover = false,\n  gradient = false \n}) {\n  const baseClasses = \'bg-white rounded-2xl shadow-lg\'\n  const hoverClasses = hover ? \'hover:shadow-xl hover:-translate-y-1 transition-all duration-200\' : \'\'\n  const gradientClasses = gradient ? \'bg-gradient-to-br from-white via-purple-50 to-pink-50\' : \'\'\n\n  return (\n    <div className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${padding} ${className}`}>\n      {children}\n    </div>\n  )\n}\n\nexport default Card\n'
write_file "$COMMON_DIR/Card.jsx"

# ------------ Modal.jsx ------------
CONTENT=$'import React, { useEffect } from \'react\'\nimport { X } from \'lucide-react\'\n\nfunction Modal({ \n  isOpen, \n  onClose, \n  title, \n  children, \n  size = \'md\',\n  showCloseButton = true \n}) {\n  const sizes = {\n    sm: \'max-w-md\',\n    md: \'max-w-lg\',\n    lg: \'max-w-2xl\',\n    xl: \'max-w-4xl\'\n  }\n\n  useEffect(() => {\n    if (isOpen) {\n      document.body.style.overflow = \'hidden\'\n    } else {\n      document.body.style.overflow = \'unset\'\n    }\n\n    return () => {\n      document.body.style.overflow = \'unset\'\n    }\n  }, [isOpen])\n\n  if (!isOpen) return null\n\n  return (\n    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">\n      {/* Backdrop */}\n      <div \n        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"\n        onClick={onClose}\n      />\n      \n      {/* Modal */}\n      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden`}>\n        {/* Header */}\n        {(title || showCloseButton) && (\n          <div className="flex items-center justify-between p-6 border-b border-gray-200">\n            {title && (\n              <h3 className="text-xl font-bold text-gray-800 font-thai">{title}</h3>\n            )}\n            {showCloseButton && (\n              <button\n                onClick={onClose}\n                className="p-2 hover:bg-gray-100 rounded-full transition-colors"\n              >\n                <X className="w-5 h-5 text-gray-500" />\n              </button>\n            )}\n          </div>\n        )}\n        \n        {/* Content */}\n        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">\n          {children}\n        </div>\n      </div>\n    </div>\n  )\n}\n\nexport default Modal\n'
write_file "$COMMON_DIR/Modal.jsx"

# ------------ index.js (barrel) ------------
CONTENT=$'export { default as LoadingSpinner } from \'./LoadingSpinner\'\nexport { default as ErrorBoundary } from \'./ErrorBoundary\'\nexport { default as Avatar } from \'./Avatar\'\nexport { default as Button } from \'./Button\'\nexport { default as Card } from \'./Card\'\nexport { default as Modal } from \'./Modal\'\n'
write_file "$COMMON_DIR/index.js"

echo "[$SCRIPT_NAME] Done."
echo "Tip: ถ้ายังไม่ได้ติดตั้งไอคอน ให้รัน:  npm i lucide-react"
