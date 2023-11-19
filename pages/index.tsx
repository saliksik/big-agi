import * as React from 'react';

import { AppLayout } from '~/common/layout/AppLayout';
import { Sheet, Tab, tabClasses, TabList, Tabs } from '@mui/joy';
import { AppChat } from '../src/apps/chat/AppChat';
import { PersonaSelector } from '../src/apps/chat/components/persona-selector/PersonaSelector';


function AppMobileIndex() {

  const settingsTabIndex = 0;

  const tabFixSx = { fontFamily: 'body', flex: 1, p: 0, m: 0 };

  return <>

    {/*<Box sx={{*/}
    {/*  backgroundColor: 'white',*/}
    {/*  flexGrow: 1,*/}
    {/*  display: 'flex', flexDirection: 'column',*/}
    {/*}}>*/}
    {/*<PersonaSelector conversationId={null} />*/}
    <AppChat />
    {/*</Box>*/}

    <Sheet
      variant='solid'
      color='neutral'
      invertedColors
      sx={{
        mt: 'auto',
      }}
    >

      <Tabs aria-label='Index menu' defaultValue={settingsTabIndex}>
        <TabList
          // variant='plain'
          disableUnderline
          sx={{
            '--ListItem-minHeight': '2.4rem',
            // bgcolor: 'neutral.softHoverBg',
            // mb: 2,
            m: 1,
            p: 0.5,
            borderRadius: 'md',
            fontSize: 'md',
            gap: 1,
            overflow: 'hidden',
            [`& .${tabClasses.root}[aria-selected="true"]`]: {
              // color: 'neutral.plainColor',
              // bgcolor: 'background.surface',
              boxShadow: 'md',
              fontWeight: 'md',
            },
          }}
        >
          <Tab disableIndicator value={1} sx={tabFixSx}>Chat</Tab>
          {/*<Tab disableIndicator value={3} sx={tabFixSx}>Calls</Tab>*/}
          <Tab disableIndicator value={3} sx={tabFixSx}>Apps</Tab>
          <Tab disableIndicator value={2} sx={tabFixSx}>Data</Tab>
        </TabList>
      </Tabs>

    </Sheet>

  </>;
}


export default function IndexPage() {

  return (
    <AppLayout>
      <AppMobileIndex />
    </AppLayout>
  );
}