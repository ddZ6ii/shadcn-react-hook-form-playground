type TabName = 'bug' | 'register'

type Tab = {
  value: TabName
  title: string
  renderContent: () => React.JSX.Element
}

export type { Tab, TabName }
