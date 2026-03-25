import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { useThemeContext } from '@/hooks'
import { cn } from '@/lib/utils'

export default function Navbar({
  className,
  ...props
}: React.ComponentProps<'nav'>) {
  const { darkMode, toggleDarkMode } = useThemeContext()

  return (
    <nav className={cn('flex justify-between gap-4', className)} {...props}>
      <Heading as="h1">Shadcn + React Hook Form Playground</Heading>
      <Button
        size="icon-sm"
        variant="outline"
        className="rounded-full"
        onClick={() => {
          toggleDarkMode()
        }}
      >
        {darkMode ? <SunIcon /> : <MoonIcon />}
      </Button>
    </nav>
  )
}
