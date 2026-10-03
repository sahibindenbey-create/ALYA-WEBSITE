'use client';
// styled-jsx stillerini sunucu HTML'ine yazar (Next.js App Router resmi yöntemi).
// Bu olmadan <style jsx> kullanan sayfalar JS yüklenene kadar stilsiz görünür ve sayfa kayar (CLS).
import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleRegistry, createStyleRegistry } from 'styled-jsx';

export default function StyledJsxRegistry({ children }) {
  const [registry] = useState(() => createStyleRegistry());
  useServerInsertedHTML(() => {
    const styles = registry.styles();
    registry.flush();
    return <>{styles}</>;
  });
  return <StyleRegistry registry={registry}>{children}</StyleRegistry>;
}
