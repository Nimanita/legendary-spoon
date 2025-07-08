export function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  export function getPriorityColor(score) {
    if (score >= 0.8) return 'bg-red-400'
    if (score >= 0.4) return 'bg-purple-400'
    return 'bg-blue-300'
  }