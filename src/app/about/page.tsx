import Link from 'next/link';

export default function About() {
  return (
    <div>
      <h1>About</h1>
      <p>これはAboutページです。</p>
      <Link href="/">Home</Link>
    </div>
  );
}
