import React, { useState } from 'react';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { BroadcastBanner } from './BroadcastBanner';
import { HeroSection } from './HeroSection';
import { FeatureMatrix } from './FeatureMatrix';
import { PricingGrid, PricingTier } from './PricingGrid';
import { PurchaseModal } from './PurchaseModal';
import { KeyChecker } from './KeyChecker';
import { LegalModal, LegalTab } from '../common/LegalModal';
import { ServiceStatusConfig } from '../../types/license';
import { soundService } from '../../services/soundService';

interface StorefrontViewProps {
  statusConfig: ServiceStatusConfig | null;
  onNavigateAdmin: () => void;
  onNavigateCabinet?: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  statusConfig,
  onNavigateAdmin,
  onNavigateCabinet,
}) => {
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('terms');
  const [activeCheckKey, setActiveCheckKey] = useState<string>('');

  const handleSelectTier = (tier: PricingTier) => {
    soundService.playTone('click');
    setSelectedTier(tier);
    setPurchaseModalOpen(true);
  };

  const handleOpenLegal = (tab: LegalTab = 'terms') => {
    soundService.playTone('click');
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  const handleOpenKeyChecker = () => {
    soundService.playTone('click');
    const element = document.getElementById('checker');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyObtained = (key: string) => {
    setActiveCheckKey(key);
    // After purchase, smoothly highlight the key checker
    setTimeout(() => {
      handleOpenKeyChecker();
    }, 400);
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col selection:bg-cyber-cyan/30 selection:text-white">
      {/* Top dynamic broadcast banner */}
      <BroadcastBanner statusConfig={statusConfig} />

      {/* Navigation header */}
      <Navbar
        statusConfig={statusConfig}
        currentView="storefront"
        onNavigate={(view) => {
          if (view === 'admin') onNavigateAdmin();
          else if (view === 'cabinet' && onNavigateCabinet) onNavigateCabinet();
        }}
        onOpenKeyChecker={handleOpenKeyChecker}
      />

      {/* Main content sections */}
      <main className="flex-1">
        {/* Hero Banner with CTA */}
        <HeroSection
          onCheckKeyClick={handleOpenKeyChecker}
          onExplorePricingClick={() => {
            soundService.playTone('burst');
            const el = document.getElementById('pricing');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Interactive Feature Matrix & Module Showcase */}
        <section id="features" className="relative scroll-mt-24">
          <FeatureMatrix />
        </section>

        {/* Pricing & Subscription Tiers Grid */}
        <section id="pricing" className="relative scroll-mt-24 py-16">
          <PricingGrid onSelectTier={handleSelectTier} />
        </section>

        {/* Instant Public License Key Checker */}
        <section id="checker" className="relative scroll-mt-24 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <KeyChecker initialKey={activeCheckKey} />
          </div>
        </section>
      </main>

      {/* Footer with Legal links and Admin route */}
      <Footer
        onNavigateAdmin={onNavigateAdmin}
        onOpenKeyChecker={handleOpenKeyChecker}
        onOpenLegal={handleOpenLegal}
      />

      {/* Platega-integrated Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModalOpen}
        tier={selectedTier}
        onClose={() => setPurchaseModalOpen(false)}
        onKeyObtained={handleKeyObtained}
        onOpenLegal={handleOpenLegal}
      />

      {/* Interactive Liquid Glass Legal Documents Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        defaultTab={legalTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </div>
  );
};
