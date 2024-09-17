import UpcomingEvents from "../components/UpcomingEvents";

export default function NotFound() {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 min-h-screen text-center items-center">
        <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
        <p className="text-2xl">Sorry, the event you're looking for doesn't exist.</p>
        <p className="text-lg">Check out our upcoming events instead!</p>
        <UpcomingEvents/>
      </div>
    );
  }