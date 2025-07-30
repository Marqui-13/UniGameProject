import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/game' && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  return <Component {...pageProps} />;
}