import { notFound } from 'next/navigation';
import { EVENTS } from '@/constants/events';
import { REGISTRATION_TYPES } from '@/constants/registrations';
import RegistrationForm from './components/RegistrationForm';
import { RegistrationType } from '@/types/event-registration/registration';

export default function EventRegistrationPage({
  params,
}: {
  params: { eventId: string };
}) {
  // Find the event by ID
  const event = EVENTS.find((e) => e.id.toString() === params.eventId || e.slug === params.eventId);
  
  if (!event) {
    notFound();
  }

  // Find the registration types for this event
  const eventRegistration = REGISTRATION_TYPES.find((rt) => rt.id.toString() === event.id.toString());
  
  if (!eventRegistration) {
    notFound();
  }

  // Map the registration types to the format expected by the RegistrationForm
  const registrationTypes: RegistrationType[] = eventRegistration.registrations.map(reg => ({
    ...reg,
    // Ensure all required fields are present
    id: reg.id.toString(),
    name: reg.name || reg.title || '',
    description: reg.description || '',
    price: reg.price || 0,
    isActive: reg.isActive !== false,
    requiresAttendeeInfo: reg.requiresAttendeeInfo !== false,
    isGovtFreeEligible: reg.isGovtFreeEligible || false,
    perks: reg.perks || [],
  }));

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
