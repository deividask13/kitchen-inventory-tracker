'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useSettingsStore } from '@/stores';

interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
  icon?: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Welcome to Kitchen Inventory Tracker',
    description: 'Manage your kitchen inventory and generate shopping lists efficiently. Track items with expiration dates, locations, and quantities.',
    icon: '🏠',
  },
  {
    title: 'Track Your Inventory',
    description: 'Add items to your inventory with details like quantity, expiration date, and location (fridge, pantry, or freezer). Get alerts for expiring items.',
    icon: '📦',
  },
  {
    title: 'Smart Shopping Lists',
    description: 'Automatically generate shopping lists from low stock items. Check off items as you shop, even offline.',
    icon: '🛒',
  },
  {
    title: 'Get Smart Insights',
    description: 'View your dashboard for insights about expiring items, usage patterns, and shopping frequency. Make informed decisions about your inventory.',
    icon: '📊',
  },
  {
    title: 'Works Offline',
    description: 'Use the app offline with full functionality. All your data is stored locally and syncs when you\'re back online.',
    icon: '📱',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'On desktop, use keyboard shortcuts for quick navigation: Alt+1 (Dashboard), Alt+2 (Inventory), Alt+3 (Shopping), Ctrl+N (Add Item).',
    icon: '⌨️',
  },
];

export function OnboardingFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useSettingsStore();

  useEffect(() => {
    // Show onboarding on first visit
    if (!hasCompletedOnboarding) {
      // Delay slightly to allow page to load
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setHasCompletedOnboarding(true);
    setIsOpen(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    setIsOpen(false);
    setCurrentStep(0);
  };

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleSkip}
          title=""
          size="lg"
        >
          <div className="relative">
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Skip onboarding"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Progress indicator */}
            <div className="flex gap-2 mb-8">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center py-8"
              >
                {/* Icon */}
                {step.icon && (
                  <div className="text-6xl mb-6" role="img" aria-label={step.title}>
                    {step.icon}
                  </div>
                )}

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex-1">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-500">
                {currentStep + 1} of {onboardingSteps.length}
              </div>

              <div className="flex-1 flex justify-end gap-2">
                {!isLastStep && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="gap-2"
                >
                  {isLastStep ? (
                    <>
                      Get Started
                      <Check className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
