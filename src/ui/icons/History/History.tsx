import { FC } from 'react';

import { IconBaseProps } from '@app-types/common';
import { SvgBase } from '@ui/SvgBase';

export const History: FC<IconBaseProps> = (props) => (
    <SvgBase viewBox="0 0 24 24" {...props}>
        <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21.5 4.5v6h-6" />
            <path d="M21.9 10.5c-.3-5.5-5-9.8-10.5-9.5-6 .4-10.5 5.7-9.5 11.5S7.7 22.4 13 22s9.8-5.7 9.5-11.5" />
            <path d="M12 7v5l3 3" />
        </g>
    </SvgBase>
);