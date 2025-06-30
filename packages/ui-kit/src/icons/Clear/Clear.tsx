import { FC } from 'react';

import { IconBaseProps } from '../../types/common';
import { SvgBase } from '../SvgBase';

export const Clear: FC<IconBaseProps> = (props) => (
    <SvgBase viewBox="0 0 22 22" {...props}>
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.16675 20.3334L10.5001 11.0001M10.5001 11.0001L19.8334 1.66675M10.5001 11.0001L1.16675 1.66675M10.5001 11.0001L19.8334 20.3334" />
        </g>
    </SvgBase>
);
