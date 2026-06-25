type ClassValue = string | number | boolean | null | undefined | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}