"use client";

import React, { ReactNode } from 'react';
import { Disclosure as HeadlessDisclosure } from '@headlessui/react';

interface DisclosureProps {
  children: ReactNode;
  defaultOpen?: boolean;
  as?: React.ElementType;
}

interface DisclosurePanelProps {
  children: ReactNode;
  as?: React.ElementType;
}

interface DisclosureButtonProps {
  children: ReactNode;
  as?: React.ElementType;
}

const Disclosure = ({ children, defaultOpen = false, as = 'div' }: DisclosureProps) => {
  return (
    <HeadlessDisclosure as={as} defaultOpen={defaultOpen}>
      {children}
    </HeadlessDisclosure>
  );
};

const Panel = ({ children, as = 'div' }: DisclosurePanelProps) => {
  return (
    <HeadlessDisclosure.Panel as={as}>
      {children}
    </HeadlessDisclosure.Panel>
  );
};

const Button = ({ children, as = 'button' }: DisclosureButtonProps) => {
  return (
    <HeadlessDisclosure.Button as={as}>
      {children}
    </HeadlessDisclosure.Button>
  );
};

Disclosure.Panel = Panel;
Disclosure.Button = Button;

export { Disclosure }; 