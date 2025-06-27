import { FC } from 'react';

import { SvgBase } from '../../SvgBase';
import { IconBaseProps } from '../../types/common';

export const Cross: FC<IconBaseProps> = (props) => (
    <SvgBase viewBox="0 0 32 32" {...props}>
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.66675 25.3332L16.0001 15.9998M16.0001 15.9998L25.3334 6.6665M16.0001 15.9998L6.66675 6.6665M16.0001 15.9998L25.3334 25.3332" />
        </g>
    </SvgBase>
);
