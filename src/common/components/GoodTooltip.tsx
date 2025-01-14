import * as React from 'react';

import { Tooltip } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';


/**
 * Tooltip with text that wraps to multiple lines (doesn't go too long)
 */
export const GoodTooltip = (props: {
  title: string | React.JSX.Element | null,
  placement?: 'top' | 'bottom',
  isError?: boolean, isWarning?: boolean,
  children: React.JSX.Element,
  sx?: SxProps
}) =>
  <Tooltip
    title={props.title}
    placement={props.placement}
    variant={(props.isError || props.isWarning) ? 'soft' : undefined}
    color={props.isError ? 'danger' : props.isWarning ? 'warning' : undefined}
    sx={{ maxWidth: { sm: '50vw', md: '25vw' }, ...props.sx }}
  >
    {props.children}
  </Tooltip>;
