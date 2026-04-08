import AuthForm from '../../components/AuthForm';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your 50 Best Bakeries account to rate and review bakeries.',
};

export default async function LoginPage(props) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl || '/';
  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '40px 24px' }}>
      <AuthForm mode="login" callbackUrl={callbackUrl} />
    </main>
  );
}
