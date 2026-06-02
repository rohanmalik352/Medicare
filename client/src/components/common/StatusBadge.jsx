const StatusBadge = ({ status }) => {
  const map = {
    PENDING: 'badge-pending',
    ANALYZING: 'badge-analyzing',
    ASSIGNED: 'badge-assigned',
    REVIEWED: 'badge-reviewed',
  }
  return <span className={map[status] || 'badge-pending'}>{status}</span>
}

export default StatusBadge