export const getFullBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL)
    return `${process.env.NEXT_PUBLIC_VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export function shortenUrl(longUrl: string) {
  return (
    longUrl.substring(0, 12) + "..." + longUrl.substring(longUrl.length - 5)
  );
} 