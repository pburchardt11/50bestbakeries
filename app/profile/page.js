import ProfileContent from '../../components/ProfileContent';

export const metadata = {
  title: 'My Bakery Profile',
  description: 'View your reviewed bakeries, favorites, and want-to-visit list.',
};

export default function ProfilePage() {
  return (
    <main style={{ minHeight: '80vh', maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      <ProfileContent />
    </main>
  );
}
