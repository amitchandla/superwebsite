import ConfigEditor from './ConfigEditor'

export default function Prompts() {
  return (
    <ConfigEditor
      category="prompt"
      title="AI prompts"
      description="System prompts used by the Growth Advisor and other AI features. Only editable here, never hardcoded in the app."
      newKeyPlaceholder="prompt.daily_growth_advisor"
    />
  )
}
