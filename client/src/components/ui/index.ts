/**
 * UI Components Index
 *
 * CONCEPT: Central export file for all UI primitive components.
 * Import components from '@/components/ui' for cleaner imports.
 *
 * Usage:
 *   import { Button, Input, Dialog } from '@/components/ui';
 */

// Button
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

// Input
export { Input } from './input';
export type { InputProps } from './input';

// Label
export { Label } from './label';

// Select
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './select';

// Dialog
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

// Avatar
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export type { AvatarProps } from './avatar';

// Dropdown Menu
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';

// Progress
export { Progress } from './progress';
export type { ProgressProps } from './progress';
