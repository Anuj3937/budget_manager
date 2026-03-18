"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore, setDocumentNonBlocking } from "@/firebase";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isSignUp?: boolean;
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

type UserFormValues = z.infer<typeof formSchema>;

export function UserAuthForm({
  className,
  isSignUp = false,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        
        const user = userCredential.user;
        const userProfileRef = doc(firestore, `users/${user.uid}`);
        
        setDocumentNonBlocking(userProfileRef, {
            email: user.email,
            id: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });

        toast({
          title: "Account Created",
          description: "Welcome to Horizon!",
        });
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: "Signed In",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      const userProfileRef = doc(firestore, `users/${user.uid}`);

      setDocumentNonBlocking(userProfileRef, {
          id: user.uid,
          email: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast({
        title: "Signed In Anonymously",
        description: "Welcome! Your data will be stored temporarily.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Could not sign in anonymously.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const userProfileRef = doc(firestore, `users/${user.uid}`);
      
      setDocumentNonBlocking(userProfileRef, {
        email: user.email,
        id: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: "Signed In with Google",
        description: "Welcome to Horizon!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Could not sign in with Google.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              autoCapitalize="none"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              autoCorrect="off"
              disabled={isLoading}
              {...register("password")}
            />
            {errors?.password && (
              <p className="px-1 text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSignUp ? "Sign Up with Email" : "Sign In with Email"}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleSignIn}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true" focusable="false"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"></path></svg>
          )}
          Google
        </Button>
        <Button variant="outline" type="button" disabled={isLoading} onClick={handleAnonymousSignIn}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Sign In Anonymously
        </Button>
      </div>
    </div>
  );
}
