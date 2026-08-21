import ConfigEditor from './ConfigEditor'

export default function Limits() {
  return (
    <ConfigEditor
      category="limit"
      title="Usage limits"
      description="Per-plan limits, e.g. leads per month or AI generations per day."
      newKeyPlaceholder="limit.trial.leads_per_month"
    />
  )
}
