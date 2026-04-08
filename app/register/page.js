import AuthForm from '../../components/AuthForm';

export const metadata = {
  title: 'Create Account',
  description: 'Create a 50 Best Bakeries account to rate, review, and bookmark your favorite bakeries.',
};

export default async function RegisterPage(props) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl || '/';
  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '40px 24px' }}>
      <AuthForm mode="register" callbackUrl={callbackUrl} />
    </main>
  );
}
