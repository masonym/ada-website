import { getCdnPath } from "@/utils/image";
import Image from "next/image";
import Link from "next/link";
import { MouseEventHandler } from "react";

type ButtonProps = {
    title: string;
    icon?: string;
    variant?: string;
    link?: string;
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}

const Button = ({ title, icon, variant, link, className, onClick }: ButtonProps) => {
    // If onClick is provided, render a button; otherwise, render a Link
    if (onClick) {
        return (
            <button
                onClick={onClick}
                className={`flexCenter gap-3 rounded-full border ${variant} ${className || ''}`}
            >
                {icon && <Image src={getCdnPath(icon)} width={24} height={24} alt={title} />}
                <span className="bold-16 whitespace-nowrap">
                    {title}
                </span>
            </button>
        );
    }
    
    return (
        <Link
            href={link || '#'}
            className={`flexCenter gap-3 rounded-full border ${variant} ${className || ''}`}
            target={link?.startsWith('/') ? undefined : "_blank"}
        >
            {icon && <Image src={getCdnPath(icon)} width={24} height={24} alt={title} />}
            <span className="bold-16 whitespace-nowrap">
                {title}
            </span>
        </Link>
    );
}

export default Button