'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Package, 
  AlertTriangle, 
  Clock,
  Minus,
  Plus,
  Check,
  X,
  Edit3
} from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { useTouchGestures, useHapticFeedback, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils';
import type { InventoryItem } from '@/lib/types';

interface InventoryCardProps {
  item: InventoryItem;
  onMarkAsUsed: (id: string, quantity: number) => void;
  onMarkAsFinished: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onEdit: (item: InventoryItem) => void;
  className?: string;
}

export function InventoryCard({
  item,
  onMarkAsUsed,
  onMarkAsFinished,
  onUpdateQuantity,
  onEdit,
  className
}: InventoryCardProps) {
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(item.quantity);
  const { triggerHaptic } = useHapticFeedback();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Touch gestures for mobile interactions
  const cardRef = useTouchGestures<HTMLDivElement>({
    onSwipeLeft: () => {
      if (!item.isFinished) {
        triggerHaptic('medium');
        handleMarkAsFinished();
      }
    },
    onSwipeRight: () => {
      if (!item.isFinished && item.quantity > 0) {
        triggerHaptic('light');
        handleMarkAsUsed();
      }
    },
    onDoubleTap: () => {
      triggerHaptic('light');
      onEdit(item);
    },
  });

  // Calculate expiration status
  const getExpirationStatus = () => {
    if (!item.expirationDate) return null;
    
    const now = new Date();
    const expDate = new Date(item.expirationDate);
    const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry) };
    if (daysUntilExpiry <= 3) return { status: 'critical', days: daysUntilExpiry };
    if (daysUntilExpiry <= 7) return { status: 'warning', days: daysUntilExpiry };
    return { status: 'good', days: daysUntilExpiry };
  };

  const expirationStatus = getExpirationStatus();

  // Get location icon and color
  const getLocationInfo = (location: string) => {
    switch (location) {
      case 'fridge':
        return { icon: '🧊', color: 'text-blue-600 bg-blue-50' };
      case 'freezer':
        return { icon: '❄️', color: 'text-cyan-600 bg-cyan-50' };
      case 'pantry':
        return { icon: '🏠', color: 'text-amber-600 bg-amber-50' };
      default:
        return { icon: '📦', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const locationInfo = getLocationInfo(item.location);

  // Handle quantity updates
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(0, tempQuantity + delta);
    setTempQuantity(newQuantity);
  };

  const handleQuantityConfirm = () => {
    onUpdateQuantity(item.id, tempQuantity);
    setIsUpdatingQuantity(false);
  };

  const handleQuantityCancel = () => {
    setTempQuantity(item.quantity);
    setIsUpdatingQuantity(false);
  };

  // Quick action handlers
  const handleMarkAsUsed = () => {
    onMarkAsUsed(item.id, 1);
  };

  const handleMarkAsFinished = () => {
    onMarkAsFinished(item.id);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
      exit={prefersReducedMotion ? {} : { 
        opacity: 0, 
        scale: 0.9, 
        x: -100,
        transition: { duration: 0.2, ease: 'easeIn' }
      }}
      whileHover={prefersReducedMotion ? {} : { 
        y: -4, 
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      }}
      whileTap={prefersReducedMotion ? {} : { 
        scale: 0.98,
        transition: { type: 'spring', stiffness: 600, damping: 15 }
      }}
      transition={prefersReducedMotion ? {} : { 
        type: 'spring',
        stiffness: 300,
        damping: 24
      }}
      className={cn('select-none', className)}
    >
      <Card 
        variant="elevated" 
        padding="none"
        className={cn(
          'overflow-hidden transition-all duration-200',
          item.isFinished && 'opacity-60',
          item.isLow && !item.isFinished && 'ring-2 ring-orange-200',
          expirationStatus?.status === 'critical' && 'ring-2 ring-red-200',
          expirationStatus?.status === 'expired' && 'ring-2 ring-red-400'
        )}
      >
        <CardContent className="p-4">
          {/* Header with name and edit button */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-semibold text-gray-900 truncate text-responsive-base',
                item.isFinished && 'line-through text-gray-500'
              )}>
                {item.name}
              </h3>
              <p className="text-responsive-xs text-gray-500 capitalize">{item.category}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                triggerHaptic('light');
                onEdit(item);
              }}
              className="h-8 w-8 text-gray-400 hover-hover:hover:text-gray-600 touch-target"
              aria-label={`Edit ${item.name}`}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Status indicators */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Location badge */}
            <div className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              locationInfo.color
            )}>
              <span>{locationInfo.icon}</span>
              <span className="capitalize">{item.location}</span>
            </div>

            {/* Low stock indicator */}
            {item.isLow && !item.isFinished && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-orange-700 bg-orange-100">
                <AlertTriangle className="h-3 w-3" />
                <span>Low Stock</span>
              </div>
            )}

            {/* Expiration indicator */}
            {expirationStatus && (
              <div className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                expirationStatus.status === 'expired' && 'text-red-700 bg-red-100',
                expirationStatus.status === 'critical' && 'text-red-600 bg-red-50',
                expirationStatus.status === 'warning' && 'text-yellow-700 bg-yellow-100',
                expirationStatus.status === 'good' && 'text-green-700 bg-green-100'
              )}>
                <Clock className="h-3 w-3" />
                <span>
                  {expirationStatus.status === 'expired' 
                    ? `Expired ${expirationStatus.days}d ago`
                    : `${expirationStatus.days}d left`
                  }
                </span>
              </div>
            )}

            {/* Finished indicator */}
            {item.isFinished && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                <X className="h-3 w-3" />
                <span>Finished</span>
              </div>
            )}
          </div>

          {/* Quantity section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              {isUpdatingQuantity ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    className="h-8 w-8"
                    disabled={tempQuantity <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-medium min-w-[3rem] text-center">
                    {tempQuantity} {item.unit}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    className="h-8 w-8"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setIsUpdatingQuantity(true)}
                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  disabled={item.isFinished}
                >
                  {item.quantity} {item.unit}
                </button>
              )}
            </div>

            {/* Quantity update controls */}
            {isUpdatingQuantity && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleQuantityConfirm}
                  className="h-8 w-8 text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleQuantityCancel}
                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Expiration date */}
          {item.expirationDate && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                Expires: {new Date(item.expirationDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 italic">{item.notes}</p>
            </div>
          )}

          {/* Quick actions */}
          {!item.isFinished && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  triggerHaptic('light');
                  handleMarkAsUsed();
                }}
                className="flex-1 touch-target"
                disabled={item.quantity <= 0}
              >
                <Minus className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Use 1</span>
                <span className="xs:hidden">Use</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  triggerHaptic('medium');
                  handleMarkAsFinished();
                }}
                className="flex-1 touch-target"
              >
                <X className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Finished</span>
                <span className="xs:hidden">Done</span>
              </Button>
            </div>
          )}

          {/* Touch gesture hints for mobile */}
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400 touch:block hidden">
            <p>Swipe → to use • Swipe ← to finish • Double tap to edit</p>
          </div>

          {/* Last used info */}
          {item.lastUsed && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Last used: {new Date(item.lastUsed).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}