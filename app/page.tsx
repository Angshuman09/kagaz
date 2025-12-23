"use client";

import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function Home() {
  const {user} = useUser();
  const createUser = useMutation(api.user.createUser);
  // console.log(user)
  useEffect(()=>{
    user && checkUser();
  },[user])

  const checkUser = async ()=>{
    const result = await createUser({
      email: user?.primaryEmailAddress?.emailAddress as string,
      userName: user?.firstName as string,
      imageUrl: user?.imageUrl as string
    })

    console.log(result)
  }
  return (
    <UserButton/>
  )
}
