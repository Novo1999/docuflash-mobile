import { useEffect, useRef } from 'react'

export function useDebouncedEffect(effect: () => void, deps: React.DependencyList, delay = 300) {
  const effectRef = useRef(effect)

  useEffect(() => {
    effectRef.current = effect
  }, [effect])

  useEffect(() => {
    const timer = setTimeout(() => effectRef.current(), delay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...deps])
}
