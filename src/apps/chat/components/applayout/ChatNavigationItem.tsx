import * as React from 'react';

import { Avatar, Box, IconButton, ListItem, ListItemDecorator, MenuItem, Sheet, Typography } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { SystemPurposes } from '../../../../data';

import { InlineTextarea } from '~/common/components/InlineTextarea';
import { conversationTitle, DConversation, DConversationId, useChatStore } from '~/common/state/store-chats';
import { useUIPreferencesStore } from '~/common/state/store-ui';


const DEBUG_CONVERSATION_IDs = false;


export const ChatNavigationItemMemo = React.memo(ChatNavigationItem);

function ChatNavigationItem(props: {
  conversation: DConversation,
  isActive: boolean,
  isLonely: boolean,
  maxChatMessages: number,
  showSymbols: boolean,
  onConversationActivate: (conversationId: DConversationId, closeMenu: boolean) => void,
  onConversationDelete: (conversationId: DConversationId) => void,
}) {

  const { conversation, isActive } = props;

  // state
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [deleteArmed, setDeleteArmed] = React.useState(false);

  // external state
  const doubleClickToEdit = useUIPreferencesStore(state => state.doubleClickToEdit);

  // derived state
  const { id: conversationId } = conversation;
  const isNew = conversation.messages.length === 0;
  const messageCount = conversation.messages.length;
  const assistantTyping = !!conversation.abortController;
  const systemPurposeId = conversation.systemPurposeId;
  const title = conversationTitle(conversation, 'new conversation');
  // const setUserTitle = state.setUserTitle;

  // auto-close the arming menu when clicking away
  // NOTE: there currently is a bug (race condition) where the menu closes on a new item right after opening
  //       because the isActive prop is not yet updated
  React.useEffect(() => {
    if (deleteArmed && !isActive)
      setDeleteArmed(false);
  }, [deleteArmed, isActive]);


  const handleConversationActivate = () => props.onConversationActivate(conversationId, false);

  const handleTitleEdit = () => setIsEditingTitle(true);

  const handleTitleEdited = (text: string) => {
    setIsEditingTitle(false);
    useChatStore.getState().setUserTitle(conversationId, text);
  };

  const handleDeleteButtonShow = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isActive)
      props.onConversationActivate(conversationId, false);
    else
      setDeleteArmed(true);
  };

  const handleDeleteButtonHide = () => setDeleteArmed(false);

  const handleConversationDelete = (event: React.MouseEvent) => {
    if (deleteArmed) {
      setDeleteArmed(false);
      event.stopPropagation();
      props.onConversationDelete(conversationId);
    }
  };


  const textSymbol = SystemPurposes[systemPurposeId]?.symbol || '❓';
  // const buttonSx: SxProps = { ml: 1, ...(isActive ? { color: 'white' } : {}) };

  const progress = props.maxChatMessages ? 100 * messageCount / props.maxChatMessages : 0;

  return (
    <Sheet
      variant={isActive ? 'solid' : 'plain'} color='neutral'
      invertedColors={isActive}
      // selected={isActive}
      sx={{
        // py: 0,
        position: 'relative',
        border: 'none', // note, there's a default border of 1px and invisible.. hmm
        ...(isActive ? {
          // borderRadius: 'md',
          boxShadow: 'md',
          // overflow: 'hidden',
          '--ListItem-minHeight': '44px',
        } : {
          backgroundColor: 'transparent',
        }),
      }}
    >

      {/* Optional progress bar, underlay */}
      {progress > 0 && !isActive && (
        <Box sx={{
          backgroundColor: 'neutral.softActiveBg',
          position: 'absolute', left: 0, bottom: 0, width: progress + '%', height: 4,
        }} />
      )}

      {/* First Row */}
      <MenuItem
        onClick={() => isActive || handleConversationActivate()}
        sx={isActive ? {
          mb: 0, pb: 0,
        } : {}}
      >

        {/* Icon */}
        {props.showSymbols && <ListItemDecorator>
          {assistantTyping
            ? (
              <Avatar
                alt='typing' variant='plain'
                src='https://i.giphy.com/media/jJxaUysjzO9ri/giphy.webp'
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--joy-radius-sm)',
                }}
              />
            ) : (
              <Typography sx={{ fontSize: '18px' }}>
                {isNew ? '' : textSymbol}
              </Typography>
            )}
        </ListItemDecorator>}

        {/* Text */}
        {!isEditingTitle ? (

          <Box onDoubleClick={() => doubleClickToEdit ? handleTitleEdit() : null} sx={{ flexGrow: 1 }}>
            {DEBUG_CONVERSATION_IDs ? conversationId.slice(0, 10) : title}{assistantTyping && '...'}
          </Box>

        ) : (

          <InlineTextarea initialText={title} onEdit={handleTitleEdited} sx={{ ml: -1.5, mr: -0.5, flexGrow: 1 }} />

        )}

      </MenuItem>


      {isActive && <ListItem sx={{
        pt: 0, mt: 0,
      }}>

        <Box sx={{ display: 'flex', gap: 1 }}>

          <IconButton size='sm' onClick={handleDeleteButtonHide}>
            <CloseIcon />
            XXX
          </IconButton>

        </Box>

        {/* Delete */}
        {!props.isLonely && <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          {deleteArmed && <IconButton size='sm' data-skip-inverted-colors variant='soft' color='danger' onClick={handleConversationDelete}>
            <DeleteOutlineIcon />
          </IconButton>}

          {deleteArmed && <IconButton size='sm' onClick={handleDeleteButtonHide}>
            <CloseIcon />
          </IconButton>}

          {!deleteArmed && <IconButton
            // variant={isActive ? 'solid' : 'outlined'}
            size='sm'
            onClick={handleDeleteButtonShow}
            sx={{ ml: 'auto' }}
          >
            <DeleteOutlineIcon />
          </IconButton>}
        </Box>}

      </ListItem>}


      {/* // TODO: Commented code */}
      {/* Edit */}
      {/*<IconButton*/}
      {/*  variant='plain' color='neutral'*/}
      {/*  onClick={() => props.onEditTitle(props.conversationId)}*/}
      {/*  sx={{*/}
      {/*    opacity: 0, transition: 'opacity 0.3s', ml: 'auto',*/}
      {/*  }}>*/}
      {/*  <EditIcon />*/}
      {/*</IconButton>*/}


    </Sheet>

  );
}