'use client';

import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ClientResponsiveLayout from '@/components/client/ClientResponsiveLayout';

import ResponsiveSessionList from './SessionList';


const Desktop = memo(({ children }: PropsWithChildren) => {
  return (
    <>
      <ResponsiveSessionList />
      <Flexbox
        flex={1}
        id={'lobe-conversion-container'}
        style={{ background: 'none', position: 'relative' }}
      >
        {children}
      </Flexbox>
    </>
  );
});

export default ClientResponsiveLayout({ Desktop, Mobile: () => import('../Mobile') });
