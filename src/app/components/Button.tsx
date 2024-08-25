import Image from "next/image";
import Link from "next/link";

type ButtonProps = {
    title: string;
    icon?: string;
    variant?: string;
    link: string;
    className?: string;
}

const Button = ({ title, icon, variant, link, className }: ButtonProps) => {
    return (
        <Link
            href={link}
            className={`flexCenter gap-3 rounded-full border ${variant} ${className}`}
        >
            {icon && <Image src={icon} width={24} height={24} alt={title} />}
            <span className="bold-16 whitespace-nowrap">
                {title}
            </span>
        </Link>
    )
}

export default Button