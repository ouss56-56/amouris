'use client'

import { useEffect } from 'react'
import { useI18n } from '@/i18n/i18n-context'

export function DynamicHtmlAttributes() {
  const { language, dir } = useI18n()

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = dir
  }, [language, dir])

  return null
}
