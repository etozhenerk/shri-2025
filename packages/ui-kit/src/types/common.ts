import { SVGProps } from 'react';

export type WithTestId = {
    'data-testid'?: string;
};

export type WithClassName = {
    className?: string;
};

export type SvgBaseProps = SVGProps<SVGSVGElement>;

export interface IconBaseProps extends SvgBaseProps {
    size?: number;
    viewBox?: string;
} 