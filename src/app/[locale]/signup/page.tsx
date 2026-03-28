'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Ripple,
  AuthTabs,
  TechOrbitDisplay,
  IconConfig
} from '@/components/blocks/modern-animated-sign-in';
import { Wallet, TrendingUp, CircleDollarSign, PiggyBank, CreditCard, PieChart, ShieldCheck, ArrowUpRight, Coins } from 'lucide-react';

const iconsArray: IconConfig[] = [
  {
    component: () => <Wallet className="text-primary w-8 h-8" />,
    className: 'size-[40px] border-none bg-transparent',
    duration: 20,
    delay: 20,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => <TrendingUp className="text-emerald-500 w-8 h-8" />,
    className: 'size-[40px] border-none bg-transparent',
    duration: 20,
    delay: 10,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => <CircleDollarSign className="text-amber-500 w-12 h-12" />,
    className: 'size-[60px] border-none bg-transparent',
    radius: 210,
    duration: 25,
    path: false,
    reverse: false,
  },
  {
    component: () => <PieChart className="text-blue-500 w-12 h-12" />,
    className: 'size-[60px] border-none bg-transparent',
    radius: 210,
    duration: 25,
    delay: 20,
    path: false,
    reverse: false,
  },
  {
    component: () => <PiggyBank className="text-pink-500 w-8 h-8" />,
    className: 'size-[40px] border-none bg-transparent',
    duration: 20,
    delay: 20,
    radius: 150,
    path: false,
    reverse: true,
  },
  {
    component: () => <ShieldCheck className="text-indigo-500 w-8 h-8" />,
    className: 'size-[40px] border-none bg-transparent',
    duration: 20,
    delay: 10,
    radius: 150,
    path: false,
    reverse: true,
  },
  {
    component: () => <CreditCard className="text-purple-500 w-10 h-10" />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 270,
    duration: 30,
    path: false,
    reverse: true,
  },
  {
    component: () => <ArrowUpRight className="text-rose-500 w-10 h-10" />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 270,
    duration: 30,
    delay: 60,
    path: false,
    reverse: true,
  },
  {
    component: () => <Coins className="text-yellow-500 w-12 h-12" />,
    className: 'size-[60px] border-none bg-transparent',
    radius: 320,
    duration: 35,
    delay: 20,
    path: false,
    reverse: false,
  },
];

export default function SignupPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    name: 'email' | 'password'
  ) => {
    const value = event.target.value;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const googleUser = userCredential.user;
      
      const userProfileRef = doc(firestore, `users/${googleUser.uid}`);
      setDocumentNonBlocking(userProfileRef, {
        email: googleUser.email,
        id: googleUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: "Signed In",
        description: "Welcome to Horizon!",
      });
    } catch (error: any) {
      setAuthError(error.message || "Could not sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setAuthError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const createdUser = userCredential.user;
      
      const userProfileRef = doc(firestore, `users/${createdUser.uid}`);
      setDocumentNonBlocking(userProfileRef, {
        email: createdUser.email,
        id: createdUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: "Account Created",
        description: "Welcome to Horizon!",
      });
    } catch (error: any) {
      setAuthError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push('/login');
  };

  const formFields = {
    header: 'Join Horizon',
    subHeader: 'Create an account to master your finances',
    errorField: authError,
    fields: [
      {
        label: 'Email',
        required: true,
        type: 'email' as const,
        placeholder: 'Enter your email address',
        value: formData.email,
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'email'),
      },
      {
        label: 'Password',
        required: true,
        type: 'password' as const,
        placeholder: 'Choose a strong password',
        value: formData.password,
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'password'),
      },
    ],
    submitButton: 'Sign Up',
    textVariantButton: "Already have an account? Log In",
    googleLogin: 'Sign up with Google',
  };

  return (
    <section className='flex max-lg:justify-center bg-background min-h-screen'>
      {/* Left Side Hero Animation */}
      <span className='relative flex flex-col justify-center w-1/2 max-lg:hidden overflow-hidden bg-black/5 dark:bg-black/20'>
        <Ripple mainCircleSize={100} />
        <TechOrbitDisplay iconsArray={iconsArray} text="Create Account" />
      </span>

      {/* Right Side Form */}
      <span className='w-1/2 h-screen flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%]'>
        <AuthTabs
          formFields={formFields}
          goTo={goToLogin}
          handleSubmit={handleSubmit}
          isLoading={isLoading || isUserLoading}
          onGoogleLogin={handleGoogleSignIn}
        />
      </span>
    </section>
  );
}
