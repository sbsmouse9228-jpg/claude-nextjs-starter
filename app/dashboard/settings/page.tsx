"use client"

import { useState } from "react"
import { Settings, Bell, User, Shield, Check } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [notifications, setNotifications] = useState([true, true, false])

  const handleSaveProfile = () => {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const handleChangePassword = () => {
    setPasswordChanged(true)
    setTimeout(() => setPasswordChanged(false), 2000)
  }

  const toggleNotification = (index: number) => {
    setNotifications(prev => prev.map((val, i) => (i === index ? !val : val)))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground mt-1">계정 및 앱 설정을 관리합니다.</p>
      </div>

      <div className="space-y-6">
        {/* 프로필 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <CardTitle>프로필 정보</CardTitle>
            </div>
            <CardDescription>공개 프로필 정보를 수정합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">이름</label>
                <Input placeholder="홍길동" defaultValue="김철수" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">이메일</label>
                <Input type="email" placeholder="example@email.com" defaultValue="kim@example.com" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium">소개</label>
                <Input placeholder="간단한 자기소개를 입력하세요" />
              </div>
              <div className="sm:col-span-2 pt-2 flex items-center gap-3">
                <Button size="sm" onClick={handleSaveProfile}>
                  {profileSaved && <Check className="mr-1 size-4" />}
                  {profileSaved ? "저장됨" : "변경사항 저장"}
                </Button>
                {profileSaved && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    프로필이 저장되었습니다.
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-muted-foreground" />
              <CardTitle>알림 설정</CardTitle>
            </div>
            <CardDescription>이메일 및 푸시 알림 수신 여부를 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-lg">
              {[
                { label: "새 사용자 가입 알림", desc: "새 사용자가 가입하면 이메일로 알림을 받습니다." },
                { label: "결제 완료 알림", desc: "결제가 완료되면 이메일로 알림을 받습니다." },
                { label: "보안 경고 알림", desc: "비정상적인 로그인 시도 시 즉시 알림을 받습니다." },
              ].map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-4 rounded-lg border border-border/50 p-4">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications[i]}
                    onClick={() => toggleNotification(i)}
                    className={cn(
                      "shrink-0 h-5 w-9 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      notifications[i] ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mx-0.5",
                        notifications[i] ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 보안 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-muted-foreground" />
              <CardTitle>보안</CardTitle>
            </div>
            <CardDescription>계정 보안을 강화합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">현재 비밀번호</label>
                <Input type="password" placeholder="현재 비밀번호" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">새 비밀번호</label>
                <Input type="password" placeholder="새 비밀번호" />
              </div>
              <div className="sm:col-span-2 pt-2 flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleChangePassword}>
                  {passwordChanged && <Check className="mr-1 size-4" />}
                  {passwordChanged ? "변경됨" : "비밀번호 변경"}
                </Button>
                {passwordChanged && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    비밀번호가 변경되었습니다.
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
