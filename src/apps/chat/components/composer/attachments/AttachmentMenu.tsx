import * as React from 'react';

import { Box, ListDivider, ListItemDecorator, MenuItem, Radio, Typography } from '@mui/joy';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';

import { CloseableMenu } from '~/common/components/CloseableMenu';
import { copyToClipboard } from '~/common/util/clipboardUtils';

import { Attachment, useAttachmentsStore } from './store-attachments';


// enable for debugging
export const DEBUG_ATTACHMENTS = true;


export function AttachmentMenu(props: {
  menuAnchor: HTMLAnchorElement,
  attachment: Attachment,
  isPositionFirst: boolean,
  isPositionLast: boolean,
  onAttachmentInline: (attachmentId: string) => void,
  onClose: () => void,
}) {

  // derived state
  const isPositionFixed = props.isPositionFirst && props.isPositionLast;

  const {
    id: aId,
    input: aInput,
    converters: aConverters,
    converterIdx: aConverterIdx,
    outputs: aOutputs,
  } = props.attachment;

  const isUnconvertible = aConverters.length === 0;
  const isOutputMissing = aOutputs.length === 0;


  // operations

  const { onAttachmentInline, onClose } = props;

  const handleInline = React.useCallback(() => {
    onClose();
    onAttachmentInline(aId);
  }, [onClose, onAttachmentInline, aId]);

  const handleMoveUp = React.useCallback(() => {
    useAttachmentsStore.getState().moveAttachment(aId, -1);
  }, [aId]);

  const handleMoveDown = React.useCallback(() => {
    useAttachmentsStore.getState().moveAttachment(aId, 1);
  }, [aId]);

  const handleRemove = React.useCallback(() => {
    onClose();
    useAttachmentsStore.getState().removeAttachment(aId);
  }, [aId, onClose]);

  const handleSetConverterIdx = React.useCallback(async (converterIdx: number | null) =>
      useAttachmentsStore.getState().setConverterIdx(aId, converterIdx)
    , [aId]);

  const handleCopyOutputToClipboard = React.useCallback(() => {
    if (aOutputs.length >= 1) {
      const concat = aOutputs.map(output => {
        if (output.type === 'text-block')
          return output.text;
        else if (output.type === 'image-part')
          return output.base64Url;
        else
          return null;
      }).join('\n\n');
      copyToClipboard(concat, 'Converted attachment');
    }
  }, [aOutputs]);


  return (
    <CloseableMenu
      placement='top' sx={{ minWidth: 200 }}
      open anchorEl={props.menuAnchor} onClose={props.onClose}
      noTopPadding noBottomPadding
    >

      {/* Move Arrows */}
      {!isPositionFixed && <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <MenuItem
          disabled={props.isPositionFirst}
          onClick={handleMoveUp}
          sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}
        >
          <KeyboardArrowLeftIcon />
        </MenuItem>
        <MenuItem
          disabled={props.isPositionLast}
          onClick={handleMoveDown}
          sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}
        >
          <KeyboardArrowRightIcon />
        </MenuItem>
      </Box>}
      {!isPositionFixed && <ListDivider sx={{ mt: 0 }} />}

      {/* Render Converters as menu items */}
      {/*{!isUnconvertible && <ListItem>*/}
      {/*  <Typography level='body-md'>*/}
      {/*    Attach as:*/}
      {/*  </Typography>*/}
      {/*</ListItem>}*/}
      {!isUnconvertible && aConverters.map((c, idx) =>
        <MenuItem
          disabled={c.disabled}
          key={'c-' + c.id}
          onClick={async () => idx !== aConverterIdx && await handleSetConverterIdx(idx)}
        >
          <ListItemDecorator>
            <Radio checked={idx === aConverterIdx} />
          </ListItemDecorator>
          {c.unsupported
            ? <Box>Unsupported 🤔 <Typography level='body-xs'>{c.name}</Typography></Box>
            : c.name}
        </MenuItem>,
      )}
      {!isUnconvertible && <ListDivider />}

      {DEBUG_ATTACHMENTS && !!aInput && (
        <MenuItem onClick={handleCopyOutputToClipboard}>
          <Box>
            {!!aInput && <Typography level='body-xs'>
              🡐 {aInput.mimeType}, {aInput.dataSize.toLocaleString()} bytes
            </Typography>}
            {/*<Typography level='body-xs'>*/}
            {/*  Converters: {aConverters.map(((converter, idx) => ` ${converter.id}${(idx === aConverterIdx) ? '*' : ''}`)).join(', ')}*/}
            {/*</Typography>*/}
            <Typography level='body-xs'>
              🡒 {isOutputMissing ? 'empty' : aOutputs.map(output => `${output.type}, ${output.type === 'text-block' ? output.text.length.toLocaleString() : '(base64 image)'} bytes`).join(' · ')}
            </Typography>
          </Box>
        </MenuItem>
      )}
      {DEBUG_ATTACHMENTS && !!aInput && <ListDivider />}

      {/* Destructive Operations */}
      <MenuItem onClick={handleInline} disabled={isUnconvertible || isOutputMissing}>
        <ListItemDecorator><VerticalAlignBottomIcon /></ListItemDecorator>
        Inline
      </MenuItem>
      <MenuItem onClick={handleRemove}>
        <ListItemDecorator><ClearIcon /></ListItemDecorator>
        Remove
      </MenuItem>

    </CloseableMenu>
  );
}