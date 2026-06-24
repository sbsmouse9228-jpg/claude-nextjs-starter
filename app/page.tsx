import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Zap,
  Palette,
  Layout,
  Shield,
  Smartphone,
  Package,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Zap,
    title: "빠른 성능",
    description: "Turbopack 기본 탑재로 초고속 개발 서버와 빌드를 경험하세요.",
  },
  {
    icon: Palette,
    title: "다크 모드",
    description: "next-themes로 시스템 설정에 따른 자동 다크/라이트 전환을 지원합니다.",
  },
  {
    icon: Layout,
    title: "대시보드 레이아웃",
    description: "사이드바와 통계 카드를 갖춘 완성형 대시보드 템플릿이 포함되어 있습니다.",
  },
  {
    icon: Shield,
    title: "TypeScript",
    description: "완전한 타입 안전성으로 런타임 오류를 사전에 방지하세요.",
  },
  {
    icon: Smartphone,
    title: "반응형 디자인",
    description: "모바일 우선 설계로 모든 화면 크기에서 완벽하게 동작합니다.",
  },
  {
    icon: Package,
    title: "shadcn/ui 컴포넌트",
    description: "접근성을 갖춘 고품질 UI 컴포넌트를 바로 사용할 수 있습니다.",
  },
]

const techStack = [
  "Next.js 16",
  "React 19",
  "TypeScript 5",
  "Tailwind CSS v4",
  "shadcn/ui",
  "Lucide React",
  "next-themes",
]

export default async function Home() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center gap-6 py-24 md:py-32 text-center px-4">
          <Badge variant="outline" className="text-xs px-3 py-1">
            Next.js 16 + TypeScript 스타터킷
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            모던 웹 개발의 <span className="text-primary">출발점</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            최신 기술 스택으로 구성된 스타터킷으로 프로덕션 수준의 웹 애플리케이션을
            빠르게 시작하세요.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
              시작하기
              <ArrowRight className="ml-1 size-4" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              <ExternalLink className="mr-1 size-4" />
              GitHub 보기
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-3">포함된 기능</h2>
              <p className="text-muted-foreground">
                개발 생산성을 높이는 모든 것이 준비되어 있습니다.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="size-5 text-primary" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-3">기술 스택</h2>
            <p className="text-muted-foreground mb-8">
              검증된 최신 기술로 구성되어 있습니다.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-sm px-3 py-1 h-auto">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <div className="mx-auto max-w-2xl text-center rounded-3xl bg-muted/50 px-8 py-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-muted-foreground mb-8">
                대시보드 템플릿을 확인하고 나만의 웹 애플리케이션을 구축해보세요.
              </p>
              <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
                대시보드 보기
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
