`$ARGUMENTS`라는 이름의 React 함수형 컴포넌트를 생성합니다.

다음 단계를 수행하세요:

1. 컴포넌트 이름은 `$ARGUMENTS`입니다. PascalCase인지 확인하고, 아니라면 자동으로 변환하세요.
2. `src/components/$ARGUMENTS.tsx` 파일을 아래 템플릿으로 생성하세요:

```tsx
interface $ARGUMENTSProps {
  className?: string;
}

export default function $ARGUMENTS({ className }: $ARGUMENTSProps) {
  return (
    <div className={className}>
      <p>$ARGUMENTS</p>
    </div>
  );
}
```

3. 파일 생성 후 경로와 컴포넌트 내용을 사용자에게 알려주세요.
