import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { CollectionsSection } from '@/components/home/CollectionsSection';

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <CollectionsSection />
    </MainLayout>
  );
}
