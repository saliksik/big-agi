import * as React from 'react';

import { Box, IconButton, ListItemDecorator, MenuItem } from '@mui/joy';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';

import { CloseableMenu } from '~/common/components/CloseableMenu';
import { ConfirmationModal } from '~/common/components/ConfirmationModal';

import type { Attachment, AttachmentId } from './store-attachments';
import type { ComposerOutputPartType } from '../composer.types';
import { AttachmentItem } from './AttachmentItem';
import { AttachmentMenu } from './AttachmentMenu';


/**
 * Renderer of attachments, with menus, etc.
 */
export function Attachments(props: {
  attachments: Attachment[]
  ejectableOutputPartTypes: ComposerOutputPartType[],
  onAttachmentInlineText: (attachmentId: AttachmentId) => void,
  onAttachmentsClear: () => void,
  onAttachmentsInlineText: () => void,
}) {

  // state
  const [confirmClearAttachments, setConfirmClearAttachments] = React.useState<boolean>(false);
  const [itemMenu, setItemMenu] = React.useState<{ anchor: HTMLAnchorElement, attachmentId: AttachmentId } | null>(null);
  const [overallMenuAnchor, setOverallMenuAnchor] = React.useState<HTMLAnchorElement | null>(null);

  // derived state
  const { attachments, onAttachmentsClear, onAttachmentInlineText, onAttachmentsInlineText } = props;
  const hasAttachments = attachments.length >= 1;

  const itemMenuAnchor = itemMenu?.anchor;
  const itemMenuAttachmentId = itemMenu?.attachmentId;
  const itemMenuAttachment = itemMenuAttachmentId ? attachments.find(a => a.id === itemMenu.attachmentId) : undefined;
  const itemMenuIndex = itemMenuAttachment ? attachments.indexOf(itemMenuAttachment) : -1;


  // item menu

  const handleItemMenuShow = React.useCallback((attachmentId: AttachmentId, anchor: HTMLAnchorElement) => {
    handleOverallMenuHide();
    setItemMenu({ anchor, attachmentId });
  }, []);

  const handleItemMenuHide = React.useCallback(() => {
    setItemMenu(null);
  }, []);


  // item menu operations

  const handleAttachmentInlineText = React.useCallback((attachmentId: string) => {
    handleItemMenuHide();
    onAttachmentInlineText(attachmentId);
  }, [handleItemMenuHide, onAttachmentInlineText]);


  // menu

  const handleOverallMenuHide = () => setOverallMenuAnchor(null);

  const handleOverallMenuToggle = (event: React.MouseEvent<HTMLAnchorElement>) =>
    setOverallMenuAnchor(anchor => anchor ? null : event.currentTarget);


  // overall operations

  const handleAttachmentsInlineText = React.useCallback(() => {
    handleOverallMenuHide();
    onAttachmentsInlineText();
  }, [onAttachmentsInlineText]);

  const handleClearAttachments = () => setConfirmClearAttachments(true);

  const handleClearAttachmentsConfirmed = React.useCallback(() => {
    handleOverallMenuHide();
    setConfirmClearAttachments(false);
    onAttachmentsClear();
  }, [onAttachmentsClear]);


  // no components without attachments
  if (!hasAttachments)
    return null;

  return <>

    {/* Attachments bar */}
    <Box sx={{ position: 'relative' }}>

      {/* Horizontally scrollable Attachments */}
      <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, height: '100%', pr: 5 }}>
        {attachments.map((attachment) =>
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            menuShown={attachment.id === itemMenuAttachmentId}
            onClick={handleItemMenuShow}
            supportedOutputPartTypes={props.ejectableOutputPartTypes}
          />,
        )}
      </Box>

      {/* Overall Menu button */}
      <IconButton
        variant='plain' onClick={handleOverallMenuToggle}
        sx={{
          // borderRadius: 'sm',
          borderRadius: 0,
          position: 'absolute', right: 0, top: 0,
          backgroundColor: 'neutral.softDisabledBg',
        }}
      >
        <ExpandLessIcon />
      </IconButton>

    </Box>


    {/* Attachment Menu */}
    {!!itemMenuAnchor && !!itemMenuAttachment && (
      <AttachmentMenu
        menuAnchor={itemMenuAnchor}
        attachment={itemMenuAttachment}
        isPositionFirst={itemMenuIndex === 0}
        isPositionLast={itemMenuIndex === attachments.length - 1}
        onAttachmentInlineText={handleAttachmentInlineText}
        onClose={handleItemMenuHide}
        supportedOutputPartTypes={props.ejectableOutputPartTypes}
      />
    )}


    {/* Overall Menu */}
    {!!overallMenuAnchor && (
      <CloseableMenu
        placement='top-start'
        open anchorEl={overallMenuAnchor} onClose={handleOverallMenuHide}
        noTopPadding noBottomPadding
      >
        <MenuItem onClick={handleAttachmentsInlineText}>
          <ListItemDecorator><VerticalAlignBottomIcon /></ListItemDecorator>
          Inline <span style={{ opacity: 0.5 }}>text attachments</span>
        </MenuItem>
        <MenuItem onClick={handleClearAttachments}>
          <ListItemDecorator><ClearIcon /></ListItemDecorator>
          Clear
        </MenuItem>
      </CloseableMenu>
    )}

    {/* 'Clear' Confirmation */}
    {confirmClearAttachments && (
      <ConfirmationModal
        open onClose={() => setConfirmClearAttachments(false)} onPositive={handleClearAttachmentsConfirmed}
        title='Confirm Removal'
        positiveActionText='Remove All'
        confirmationText={`This action will remove all (${attachments.length}) attachments. Do you want to proceed?`}
      />
    )}

  </>;
}