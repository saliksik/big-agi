import * as React from 'react';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { persist } from 'zustand/middleware';

import { incrementalVersion } from './news.data';


interface AppNewsState {
  appLoadCount: number;
  lastSeenNewsVersion: number;
}

const useAppNewsStore = create<AppNewsState>()(persist(
  () => ({
    appLoadCount: 0,
    lastSeenNewsVersion: 0,
  }), {
    name: 'app-app-news',
  },
));


export function getNewsIsOutdated() {
  const { appLoadCount, lastSeenNewsVersion } = useAppNewsStore.getState();
  return lastSeenNewsVersion < incrementalVersion && appLoadCount > 2;
}

export function useNewsMarkAsSeen() {
  React.useEffect(
    () => useAppNewsStore.setState({ lastSeenNewsVersion: incrementalVersion }),
    [],
  );
}

// top-level-function: increment the usage count
useAppNewsStore.setState(state => ({ appLoadCount: state.appLoadCount + 1 }));
