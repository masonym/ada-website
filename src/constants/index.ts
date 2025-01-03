// NAVIGATION
export const NAV_LINKS = [
  { href: '/', key: 'home', label: 'Home' },
  // { href: '/', key: 'services', label: 'Services' },
  { href: '/events', key: 'upcoming_events', label: 'Upcoming Events' },
  { href: '/events/past-events', key: 'past_events', label: 'Past Events' },
  { href: '/about', key: 'about ', label: 'About Us' },
  { href: '/contact-us', key: 'contact_us', label: 'Contact Us' },
];

// FOOTER SECTION
export const FOOTER_LINKS = [
  {
    title: 'Learn More',
    links: [
      { label: 'About ADA', href: '/about' },
      // 'Press Releases',
      // 'Environment',
      // 'Jobs',
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Contact Us', href: '/contact-us' },
    ],
  },
  // {
  //   title: 'Our Community',
  //   links: ['Climbing xixixi', 'Hiking hilink', 'Hilink kinthill'],
  // },
];

export const FOOTER_CONTACT_INFO = {
  title: 'Contact Us',
  links: [
    { label: 'Phone', value: '(771) 474-1077', href: "tel:7714741077" },
    { label: 'Email', value: 'info@americandefensealliance.org', href: "mailto:info@americandefensealliance.org" },
  ],
};

import { SiFacebook, SiX, SiInstagram, SiYoutube, SiLinkedin } from '@icons-pack/react-simple-icons';

export const SOCIALS = {
  title: 'Social',
  links: [
    { Icon: SiFacebook, title: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61565887852430' },
    { Icon: SiX, title: 'X/Twitter', href: 'https://x.com/AmDefAlliance' },
    { Icon: SiInstagram, title: 'Instagram', href: 'https://www.instagram.com/americandefensealliance/' },
    { Icon: SiYoutube, title: 'YouTube', href: 'https://www.youtube.com/@AmericanDefenseAlliance' },
    { Icon: SiLinkedin, title: 'LinkedIn', href: 'https://www.linkedin.com/company/american-defense-alliance/' },
  ],
};

export const ABOUT_TEXT = [
  {
    title: "Our Mission",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget sem felis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Etiam arcu ex, bibendum consequat vulputate at, feugiat sodales lacus. Praesent ac justo rutrum, dignissim neque nec, fermentum est. Curabitur in justo non neque iaculis elementum. Etiam tempor sodales felis, eu luctus quam maximus ac. Vestibulum vitae diam vel arcu tincidunt luctus ut ut dui. Quisque ornare tempus felis, vel suscipit sapien faucibus ac. Donec eleifend pharetra venenatis. Fusce accumsan, nunc a lobortis scelerisque, risus tortor ultricies risus, ac ultrices tortor dui sed massa."
  },
  {
    title: "Our History",
    description: "Duis sit amet posuere sapien. Etiam blandit porttitor finibus. Vestibulum et scelerisque ligula. Suspendisse purus neque, tristique viverra lacus non, euismod laoreet sem. Donec cursus mattis tincidunt. Nam a suscipit dolor. Suspendisse dictum orci ex, ut euismod tellus finibus et. Aenean nec pellentesque neque."
  },
  {
    title: "Our Vision",
    description: "Stuff about that"
  },
  {
    title: "Our Principles",
    description: "In sit amet vehicula enim, ut bibendum odio. Vestibulum suscipit odio a nunc semper, et commodo felis luctus. Maecenas volutpat facilisis ipsum euismod eleifend. Ut tincidunt at urna id porttitor. Morbi at felis a metus tempor faucibus. Nullam in quam sed erat feugiat semper. Praesent eget nisi et quam fermentum semper."
  }
]