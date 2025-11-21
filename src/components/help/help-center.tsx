'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  ChevronRight, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings as SettingsIcon,
  Keyboard,
  Wifi,
  X
} from 'lucide-react';
import { Button, Modal, Input } from '@/components/ui';

interface HelpTopic {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string[];
}

const helpTopics: HelpTopic[] = [
  {
    id: 'inventory',
    title: 'Managing Inventory',
    icon: <Package className="h-5 w-5" />,
    content: [
      'Add items by clicking the "Add Item" button on the Inventory page.',
      'Fill in details like name, quantity, unit, expiration date, and location.',
      'Edit items by clicking on them in the inventory grid.',
      'Mark items as used or finished using the quick action buttons.',
      'Filter items by location (fridge, pantry, freezer) or category.',
      'Search for items using the search bar at the top.',
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping Lists',
    icon: <ShoppingCart className="h-5 w-5" />,
    content: [
      'Low stock items are automatically added to your shopping list.',
      'Manually add items by clicking "Add Item" on the Shopping page.',
      'Check off items as you shop by clicking the checkbox.',
      'Swipe left on mobile to quickly remove items.',
      'Clear completed items using the "Clear Completed" button.',
      'Shopping lists work fully offline - perfect for stores with poor signal.',
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard & Insights',
    icon: <BarChart3 className="h-5 w-5" />,
    content: [
      'View key metrics like total items, low stock count, and expiring items.',
      'See items expiring within 7 days in the Expiring Items widget.',
      'Items are sorted by urgency (expiring soonest first).',
      'Track shopping patterns and frequently purchased items.',
      'Identify unused items that have been in storage for 30+ days.',
      'Use insights to reduce food waste and optimize shopping.',
    ],
  },
  {
    id: 'categories',
    title: 'Categories & Organization',
    icon: <SettingsIcon className="h-5 w-5" />,
    content: [
      'Use predefined categories like Produce, Dairy, Meat, Pantry Staples, etc.',
      'Create custom categories in the Settings page.',
      'Assign colors and icons to categories for easy identification.',
      'Filter inventory by category to find items quickly.',
      'Organize items by location: fridge, pantry, or freezer.',
      'Use the advanced filters to combine multiple criteria.',
    ],
  },
  {
    id: 'keyboard',
    title: 'Keyboard Shortcuts',
    icon: <Keyboard className="h-5 w-5" />,
    content: [
      'Alt + 1: Navigate to Dashboard',
      'Alt + 2: Navigate to Inventory',
      'Alt + 3: Navigate to Shopping List',
      'Alt + 4: Navigate to Settings',
      'Ctrl + N: Add new item (when available)',
      'Ctrl + K or Ctrl + /: Focus search',
      'Escape: Close modals or clear focus',
      'Note: Keyboard shortcuts are available on desktop only.',
    ],
  },
  {
    id: 'offline',
    title: 'Offline Mode',
    icon: <Wifi className="h-5 w-5" />,
    content: [
      'The app works fully offline after your first visit.',
      'All data is stored locally on your device using IndexedDB.',
      'Add, edit, and delete items without an internet connection.',
      'Shopping lists remain functional offline - perfect for shopping.',
      'Changes sync automatically when you reconnect.',
      'Install the app as a PWA for the best offline experience.',
    ],
  },
];

export function HelpCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = helpTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleTopicClick = (topic: HelpTopic) => {
    setSelectedTopic(topic);
  };

  const handleBack = () => {
    setSelectedTopic(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedTopic(null);
    setSearchQuery('');
  };

  return (
    <>
      {/* Help Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 bg-white shadow-lg hover:shadow-xl"
        title="Help & Documentation"
        aria-label="Open help center"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={selectedTopic ? selectedTopic.title : 'Help Center'}
            size="lg"
          >
            <AnimatePresence mode="wait">
              {!selectedTopic ? (
                <motion.div
                  key="topics"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search help topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Topics List */}
                  <div className="space-y-2">
                    {filteredTopics.length > 0 ? (
                      filteredTopics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicClick(topic)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-blue-600">
                              {topic.icon}
                            </div>
                            <span className="font-medium text-gray-900">
                              {topic.title}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No help topics found matching "{searchQuery}"
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Need more help? Check the keyboard shortcuts by pressing{' '}
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                        Ctrl + ?
                      </kbd>{' '}
                      on desktop.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="gap-2 -ml-2"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Back to topics
                  </Button>

                  {/* Content */}
                  <div className="space-y-3">
                    {selectedTopic.content.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
