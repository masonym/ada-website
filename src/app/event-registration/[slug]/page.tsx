import { notFound } from 'next/navigation';
import { EVENTS } from '@/constants/events';
import { REGISTRATION_TYPES } from '@/constants/registrations';
import RegistrationForm from '../[eventId]/components/RegistrationForm';
import { RegistrationType } from '@/types/event-registration/registration';

// Define the shape of the registration data from the constants
interface RegistrationData {
  id?: string | number;
  name?: string;
  title: string;
  description?: string;
  price?: number | string;
  type?: 'paid' | 'free' | 'sponsor';
  isActive?: boolean;
  requiresAttendeeInfo?: boolean;
  isGovtFreeEligible?: boolean;
  perks?: string[];
  availabilityInfo?: string;
  maxQuantityPerOrder?: number;
  earlyBirdPrice?: number | string;
  earlyBirdDeadline?: string;
  quantityAvailable?: number;
  headerImage?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  regularPrice?: number | string;
  receptionPrice?: string;
}

export default function EventRegistrationPage({
  params,
}: {
  params: { slug: string };
}) {
  // Find the event by slug
  const event = EVENTS.find((e) => e.slug === params.slug);
  
  if (!event) {
    notFound();
  }

  // Find the registration types for this event
  const eventRegistration = REGISTRATION_TYPES.find((rt) => rt.id.toString() === event.id.toString());
  
  if (!eventRegistration) {
    notFound();
  }

  // Map the registration types to the format expected by the RegistrationForm
  const registrationTypes: RegistrationType[] = (eventRegistration.registrations as RegistrationData[]).map(reg => {
    // Create a base registration object with all required fields
    const baseRegistration: RegistrationType = {
      id: reg.id !== undefined ? String(reg.id) : '',
      name: reg.name || reg.title || 'Registration',
      description: reg.description || '',
      price: reg.price !== undefined ? Number(reg.price) : 0,
      type: reg.type || 'paid',
      isActive: reg.isActive !== false,
      requiresAttendeeInfo: reg.requiresAttendeeInfo !== false,
      isGovtFreeEligible: reg.isGovtFreeEligible || false,
      perks: Array.isArray(reg.perks) ? reg.perks : [],
      availabilityInfo: reg.availabilityInfo,
      maxQuantityPerOrder: reg.maxQuantityPerOrder || 10,
      earlyBirdPrice: reg.earlyBirdPrice !== undefined ? Number(reg.earlyBirdPrice) : undefined,
      earlyBirdDeadline: reg.earlyBirdDeadline,
      quantityAvailable: reg.quantityAvailable,
    };

    // Create the extended type with UI fields
    return {
      ...baseRegistration,
      // UI fields for RegistrationCard
      title: reg.title || reg.name || 'Registration',
      headerImage: reg.headerImage || '',
      subtitle: reg.subtitle || '',
      buttonText: reg.buttonText || 'Register Now',
      buttonLink: reg.buttonLink || '#',
      regularPrice: reg.regularPrice !== undefined ? Number(reg.regularPrice) : (reg.price !== undefined ? Number(reg.price) : 0),
      receptionPrice: reg.receptionPrice,
    } as RegistrationType & {
      title: string;
      headerImage: string;
      subtitle: string;
      buttonText: string;
      buttonLink: string;
      regularPrice: number;
      receptionPrice?: string;
    };
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Register for {event.title}
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <RegistrationForm 
          event={{
            id: event.id,
            title: event.title,
            slug: event.slug,
          }} 
          registrationTypes={registrationTypes} 
        />
      </div>
    </div>
  );
}
