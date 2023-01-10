interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function CTAButton({ children, ...rest }: ButtonProps) {
  return (
    <button
      className="rounded-md bg-[hsl(280,100%,70%)]/90 px-4 py-2 text-xl font-semibold tracking-tight text-white/90 hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-gray-400"
      {...rest}
    >
      {children}
    </button>
  );
}