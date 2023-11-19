import * as React from 'react';

import { AppNews } from '../../src/apps/news/AppNews';

import { AppLayout } from '~/common/layout/AppLayout';
import { useNewsMarkAsSeen } from '../../src/apps/news/store-app-news';


export default function NewsPage() {
  // update the last seen news version
  useNewsMarkAsSeen();

  return (
    <AppLayout suspendAutoModelsSetup>
      <AppNews />
    </AppLayout>
  );
}