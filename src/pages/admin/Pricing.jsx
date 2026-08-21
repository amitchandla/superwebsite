import ConfigEditor from './ConfigEditor'

export default function Pricing() {
  return (
    <ConfigEditor
      category="pricing"
      title="Pricing"
      description="Plans and prices shown on the landing page and billing screens. Changes apply immediately, no deploy needed."
      newKeyPlaceholder="pricing.starter_plan"
    />
  )
}
