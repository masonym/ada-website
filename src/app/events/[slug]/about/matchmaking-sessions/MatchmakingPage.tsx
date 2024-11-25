import React from 'react';
import { Users, Clock, CheckCircle, UserPlus, Building2, Briefcase, GraduationCap } from 'lucide-react';

const MatchmakingPage = () => {
  const benefits = [
    { title: "Direct Connections", description: "Establish direct connections that could lead to contracts and partnerships" },
    { title: "Enhanced Visibility", description: "Gain visibility for small businesses in a competitive market" },
    { title: "Process Insights", description: "Gain valuable insight into defense procurement processes" },
    { title: "New Opportunities", description: "Identify collaboration opportunities within the defense supply chain" }
  ];

  const participants = [
    {
      title: "Small Businesses",
      description: "Companies looking to expand their presence in the defense industry and build connections with prime contractors, government agencies, and defense officials.",
      icon: Building2
    },
    {
      title: "Prime Contractors",
      description: "Large firms seeking to engage with innovative small businesses for potential partnerships or subcontracting opportunities.",
      icon: Briefcase
    },
    {
      title: "Government Agencies",
      description: "Federal, State, and Local Agencies looking to connect with businesses that provide solutions tailored to their defense-related needs.",
      icon: GraduationCap
    },
    {
      title: "Defense Officials",
      description: "Key decision-makers and procurement representatives in the defense sector aiming to discover new products, services, and solutions that align with mission objectives and operational requirements.",
      icon: Users
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Matchmaking Sessions
        </h1>
        <p className="text-lg text-slate-600 max-w-7xl mx-auto">
        The <b>2025 Southeast Defense Procurement Conference</b> will offer an exciting opportunity for businesses to engage in One-on-One Matchmaking Sessions with key decision-makers from the Department of Defense (DoD), Government Agencies, and Prime Contractors. These sessions are designed to facilitate direct, meaningful conversations between attendees and representatives from various Government Agencies, Prime Contractors, and Department of Defense Officials.
        </p>
      </div>

      {/* Purpose Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Purpose and Benefits</h2>
        <p className="text-slate-600 mb-2 text-center">
          The Matchmaking Sessions are designed to connect small businesses with larger defense contractors, helping smaller companies navigate procurement processes, enhance their visibility in the defense market, and foster valuable partnerships. For Government Agencies and Defense Officials, the sessions offer access to a diverse array of innovative solutions, services, and products, enabling them to discover new opportunities, meet mission requirements more effectively, and engage with a broader range of potential suppliers.
        </p>
      </div>

      {/* How it Works Section */}
      <div className="bg-gradient-to-br from-navy-500 to-navy-800 text-white rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">How it Works</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <UserPlus className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Matchmaking Sign-ups</h3>
              <p className="text-gray-200">
                Sign-ups for the Matchmaking Sessions will begin at 7:30 AM on March 18 and will be on a first-come, first-served basis. Businesses will need to provide their contact information and details about their capabilities, products, and services during the sign-up process.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Host Scheduling</h3>
              <p className="text-gray-200">
                Matchmaking Sessions will take place from 4:00 PM - 5:30 PM on March 18. Each host will have 12 available slots, with each session lasting 7.5 minutes. The system is designed to ensure that both parties can maximize their time, focusing on relevant opportunities.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Users className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Networking and Partnerships</h3>
              <p className="text-gray-200">
                Matchmaking Sessions foster collaboration, creating a platform for businesses to form valuable partnerships, discuss subcontracting opportunities, and explore joint ventures that align with the needs of the defense industry.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Who Should Participate Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Who Should Participate?</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {participants.map((participant, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <participant.icon className="w-8 h-8 text-navy-800 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{participant.title}</h3>
              <p className="text-slate-600">{participant.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Outcomes Section */}
      <div className="bg-navy-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Key Outcomes</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1 text-gray-400">{benefit.title}</h3>
                <p className="text-sm text-gray-200">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchmakingPage;