import ConfigEditor from './ConfigEditor'

export default function Features() {
  return (
    <ConfigEditor
      category="feature"
      title="Feature flags"
      description="Turn features on or off per rollout stage without shipping new code."
      newKeyPlaceholder="feature.ai_video"
    />
  )
}
