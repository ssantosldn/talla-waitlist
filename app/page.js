import { Suspense } from 'react';
import WaitlistContent from '@/components/WaitlistContent';

export default function WaitlistPage() {
  return (
    <Suspense fallback={null}>
      <WaitlistContent />
    </Suspense>
  );
}