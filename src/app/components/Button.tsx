import Image from "next/image";
import Link from "next/link";

type ButtonProps = {
    title: string;
    icon?: string;
    variant?: string;
    link: string;
}

const Button = ({ title, icon, variant, link }: ButtonProps) => {
    return (
        <Link
            href={link}
            className={`flexCenter gap-3 rounded-full border ${variant}`}
        >
            {icon && <Image src={icon} width={24} height={24} alt={title} />}
            <span className="bold-16 whitespace-nowrap">
                {title}
            </span>
        </Link>
    )
}

export default Button