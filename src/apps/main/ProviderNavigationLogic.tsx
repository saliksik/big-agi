import * as React from 'react';

import { getNewsIsOutdated } from '../news/store-app-news';

import { navigateToChat, navigateToNews } from '~/common/app.routes';
import { useIsMobile } from '~/common/components/useMatchMedia';


export function ProviderNavigationLogic(props: { children: React.ReactNode }) {

  // external state
  const isMobile = useIsMobile();
  const newsIsOutdated = getNewsIsOutdated();

  // startup logic
  React.useEffect(() => {
    if (newsIsOutdated)
      void navigateToNews();
    else if (!isMobile)
      void navigateToChat();
  }, [isMobile, newsIsOutdated]);
console.log('mee')
  // block rendering until the capabilities are loaded
  return props.children;
}