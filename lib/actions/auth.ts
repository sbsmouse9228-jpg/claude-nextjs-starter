"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export async function login(_prev: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin")
        return "이메일 또는 비밀번호가 올바르지 않습니다."
      return "로그인 중 오류가 발생했습니다."
    }
    throw error
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}
