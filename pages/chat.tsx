import * as React from 'react';

import { AppChat } from '../src/apps/chat/AppChat';

import { AppLayout } from '~/common/layout/AppLayout';


export default function ChatPage() {
  return (
    <AppLayout>
      <AppChat />
    </AppLayout>
  );
}