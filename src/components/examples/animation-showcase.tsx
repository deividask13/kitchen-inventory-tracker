'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  StaggeredList,
  StaggeredGrid,
  LoadingSpinner,
  LoadingDots,
  LoadingSkeleton,
  useToast,
  toast,
  PageTransition,
  FadeTransition,
  SlideTransition,
  ScaleTransition
} from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks';
import { 
  pageVariants, 
  buttonVariants, 
  listItemVariants,
  getVariants 
} from '@/lib/utils/animation-variants';

/**
 * Animation Showcase Component
 * Demonstrates all the animation and interaction polish features
 * This component serves as both documentation and testing for animations
 */
export function AnimationShowcase() {
  const [showTransitions, setShowTransitions] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [listItems, setListItems] = useState([
    'Animated List Item 1',
    'Animated List Item 2', 
    'Animated List Item 3',
    'Animated List Item 4'
  ]);
  
  const { addToast } = useToast();
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleAddListItem = () => {
    const newItem = `New Item ${listItems.length + 1}`;
    setListItems(prev => [...prev, newItem]);
  };

  const handleRemoveListItem = (index: number) => {
    setListItems(prev => prev.filter((_, i) => i !== index));
  };

  const showToastExample = (type: 'success' | 'error' | 'warning' | 'info') => {
    const toastConfig = {
      success: toast.success('Success!', 'This is a success message'),
      error: toast.error('Error!', 'This is an error message'),
      warning: toast.warning('Warning!', 'This is a warning message'),
      info: toast.info('Info!', 'This is an info message')
    };
    
    addToast(toastConfig[type]);
  };

  const gridItems = Array.from({ length: 6 }, (_, i) => (
    <Card key={i} className="p-4">
      <h3 className="font-semibold">Grid Item {i + 1}</h3>
      <p className="text-sm text-gray-600 mt-2">
        This item demonstrates staggered grid animations
      </p>
    </Card>
  ));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <motion.div
        variants={getVariants(pageVariants, prefersReducedMotion)}
        initial="initial"
        animate="in"
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Animation & Interaction Showcase
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This showcase demonstrates all the animation and interaction polish features 
          implemented in the Kitchen Inventory Tracker. All animations respect 
          reduced motion preferences.
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Reduced Motion:</strong> {prefersReducedMotion ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </motion.div>

      {/* Button Interactions */}
      <Card>
        <CardHeader>
          <CardTitle>Button Micro-Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button loading>Loading Button</Button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Hover and click buttons to see scale animations and loading states
          </p>
        </CardContent>
      </Card>

      {/* Toast Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="default" 
              onClick={() => showToastExample('success')}
            >
              Success Toast
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showToastExample('error')}
            >
              Error Toast
            </Button>
            <Button 
              variant="outline" 
              onClick={() => showToastExample('warning')}
            >
              Warning Toast
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => showToastExample('info')}
            >
              Info Toast
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Click buttons to see animated toast notifications with different types
          </p>
        </CardContent>
      </Card>

      {/* Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States & Skeleton Screens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Loading Spinners</h4>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">Small</span>
                </div>
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="md" />
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="lg" />
                  <span className="text-sm">Large</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Loading Dots</h4>
              <div className="flex items-center gap-6">
                <LoadingDots size="sm" />
                <LoadingDots size="md" />
                <LoadingDots size="lg" />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Skeleton Screens</h4>
              <div className="space-y-4">
                <LoadingSkeleton lines={3} />
                <LoadingSkeleton lines={2} avatar />
              </div>
            </div>

            <Button 
              onClick={() => setShowLoading(!showLoading)}
              variant="outline"
            >
              Toggle Loading Demo
            </Button>
            
            {showLoading && (
              <div className="p-4 border rounded-lg">
                <LoadingSkeleton lines={4} avatar />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staggered Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Staggered List Animations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={handleAddListItem}>Add Item</Button>
              <Button 
                variant="outline" 
                onClick={() => handleRemoveListItem(listItems.length - 1)}
                disabled={listItems.length === 0}
              >
                Remove Last
              </Button>
            </div>
            
            <StaggeredList staggerDelay={0.1}>
              {listItems.map((item, index) => (
                <motion.div
                  key={`${item}-${index}`}
                  className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <span>{item}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveListItem(index)}
                  >
                    Remove
                  </Button>
                </motion.div>
              ))}
            </StaggeredList>
          </div>
        </CardContent>
      </Card>

      {/* Staggered Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Staggered Grid Animations</CardTitle>
        </CardHeader>
        <CardContent>
          <StaggeredGrid columns={3} staggerDelay={0.08}>
            {gridItems}
          </StaggeredGrid>
        </CardContent>
      </Card>

      {/* Transition Components */}
      <Card>
        <CardHeader>
          <CardTitle>Transition Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Button 
              onClick={() => setShowTransitions(!showTransitions)}
              variant="outline"
            >
              Toggle Transitions Demo
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Fade Transition</h4>
                <FadeTransition isVisible={showTransitions}>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">Fade content</p>
                  </div>
                </FadeTransition>
              </div>

              <div>
                <h4 className="font-medium mb-2">Slide Transition</h4>
                <SlideTransition isVisible={showTransitions} direction="up">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800">Slide content</p>
                  </div>
                </SlideTransition>
              </div>

              <div>
                <h4 className="font-medium mb-2">Scale Transition</h4>
                <ScaleTransition isVisible={showTransitions}>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-purple-800">Scale content</p>
                  </div>
                </ScaleTransition>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Performance & Accessibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Implemented Features</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Respects prefers-reduced-motion media query</li>
                <li>• Smooth page transitions using Framer Motion</li>
                <li>• Micro-interactions for buttons and form elements</li>
                <li>• Staggered animations for lists and grids</li>
                <li>• Loading states with skeleton screens</li>
                <li>• Toast notification system</li>
                <li>• Optimized for 60fps performance</li>
                <li>• Proper ARIA labels and accessibility</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🎯 Animation Principles</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Consistent timing and easing curves</li>
                <li>• Meaningful motion that guides user attention</li>
                <li>• Reduced motion fallbacks for accessibility</li>
                <li>• Performance-optimized transforms and opacity</li>
                <li>• Spring physics for natural feel</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}