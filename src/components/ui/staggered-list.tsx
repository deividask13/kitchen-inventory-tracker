'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks';
import { 
  listContainerVariants, 
  listItemVariants, 
  gridContainerVariants, 
  gridItemVariants,
  getVariants 
} from '@/lib/utils/animation-variants';
import { cn } from '@/lib/utils';

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  layout?: 'list' | 'grid';
}

export function StaggeredList({ 
  children, 
  className, 
  staggerDelay = 0.1,
  layout = 'list'
}: StaggeredListProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const containerVariants = layout === 'grid' ? gridContainerVariants : listContainerVariants;
  const itemVariants = layout === 'grid' ? gridItemVariants : listItemVariants;
  
  const finalContainerVariants = getVariants(containerVariants, prefersReducedMotion);
  const finalItemVariants = getVariants(itemVariants, prefersReducedMotion);

  // Modify stagger timing if not reduced motion
  if (!prefersReducedMotion && finalContainerVariants.visible && typeof finalContainerVariants.visible === 'object') {
    const visibleVariant = finalContainerVariants.visible as any;
    finalContainerVariants.visible = {
      ...visibleVariant,
      transition: {
        ...visibleVariant.transition,
        staggerChildren: staggerDelay
      }
    };
  }

  return (
    <motion.div
      variants={finalContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={finalItemVariants}
          whileHover={layout === 'grid' && !prefersReducedMotion ? 'hover' : undefined}
          layout
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface StaggeredGridProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  columns?: number;
}

export function StaggeredGrid({ 
  children, 
  className, 
  staggerDelay = 0.08,
  columns = 3
}: StaggeredGridProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const containerVariants = getVariants(gridContainerVariants, prefersReducedMotion);
  const itemVariants = getVariants(gridItemVariants, prefersReducedMotion);

  // Modify stagger timing if not reduced motion
  if (!prefersReducedMotion && containerVariants.visible && typeof containerVariants.visible === 'object') {
    const visibleVariant = containerVariants.visible as any;
    containerVariants.visible = {
      ...visibleVariant,
      transition: {
        ...visibleVariant.transition,
        staggerChildren: staggerDelay
      }
    };
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'grid gap-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={!prefersReducedMotion ? 'hover' : undefined}
          layout
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onRemove?: () => void;
}

export function AnimatedListItem({ 
  children, 
  className, 
  delay = 0,
  onRemove 
}: AnimatedListItemProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const variants = getVariants(listItemVariants, prefersReducedMotion);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      transition={prefersReducedMotion ? {} : { delay }}
      className={className}
      onAnimationComplete={(definition) => {
        if (definition === 'exit' && onRemove) {
          onRemove();
        }
      }}
    >
      {children}
    </motion.div>
  );
}

interface ReorderableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function ReorderableList<T>({ 
  items, 
  onReorder, 
  renderItem, 
  keyExtractor,
  className 
}: ReorderableListProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    // Fallback to regular list for reduced motion
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={keyExtractor(item)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div className={className} layout>
      {items.map((item, index) => (
        <motion.div
          key={keyExtractor(item)}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 24
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={(event, info) => {
            const threshold = 50;
            if (Math.abs(info.offset.y) > threshold) {
              // Handle reordering logic here
              const newItems = [...items];
              const draggedItem = newItems[index];
              newItems.splice(index, 1);
              
              const newIndex = info.offset.y > 0 
                ? Math.min(index + 1, items.length - 1)
                : Math.max(index - 1, 0);
              
              newItems.splice(newIndex, 0, draggedItem);
              onReorder(newItems);
            }
          }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}