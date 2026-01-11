"use client";

import React from 'react';
import { Users, Clock, CheckCircle, UserPlus, Building2, Briefcase, GraduationCap, ExternalLink } from 'lucide-react';
import { RiGovernmentLine } from "react-icons/ri";
import Link from 'next/link';
import Image from 'next/image';
import { EVENTS } from '@/constants/events';
import { notFound, useParams } from 'next/navigation';
import { MatchmakingSponsorWithNote, SanitySponsor, urlFor } from '@/lib/sanity';
import { getCdnPath } from '@/utils/image';

type MatchmakingData = {
  sponsors: MatchmakingSponsorWithNote[];
  title?: string;
  description?: string;
} | null;

interface MatchmakingPageProps {
  matchmakingData: MatchmakingData;
}

// helper to get logo URL - handles both Sanity images and legacy file paths
const getLogoUrl = (logo: SanitySponsor['logo']): string => {
  // legacy data stores the path directly in asset._ref
  if (logo?.asset?._ref && logo.asset._ref.startsWith('/')) {
    return getCdnPath(logo.asset._ref)
  }
  // sanity image - use urlFor
  try {
    return urlFor(logo).url()
  } catch {
    return '/placeholder-logo.png'
  }
}

const MatchmakingSponsorCard: React.FC<{ sponsor: SanitySponsor; note?: string }> = ({ sponsor, note }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="flex-shrink-0 w-40 h-40 relative flex items-center justify-center">
        <Image
          src={getLogoUrl(sponsor.logo)}
          alt={`${sponsor.name} logo`}
          width={160}
          height={160}
          className="object-contain max-h-40"
          style={{ maxWidth: '100%', height: 'auto' }}
          priority={sponsor.priority}
          unoptimized={true}
        />
      </div>
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-navy-800">{sponsor.name}</h3>
          {sponsor.website && (
            <Link 
              href={sponsor.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
            >
              <span className="mr-1">Visit Website</span>
              <ExternalLink size={14} />
            </Link>
          )}
        </div>
        {sponsor.description ? (
          <div 
            className="text-slate-600"
            dangerouslySetInnerHTML={{ __html: sponsor.description }}
          />
        ) : (
          <p className="text-slate-600 italic">
            This company will be participating in matchmaking sessions. Visit their website to learn more.
          </p>
        )}
        {note && (
          <p className="text-slate-600 italic mt-4">
            {note}
          </p>
        )}
      </div>
    </div>
  );
};

const MatchmakingPage = ({ matchmakingData }: MatchmakingPageProps) => {
  const { slug } = useParams();
  const event = EVENTS.find(e => e.slug === slug);

  if (!event) {
    notFound();
  }

  const benefits = [
    { title: "Direct Connections", description: "Establish direct connections that could lead to contracts and partnerships" },
    { title: "Enhanced Visibility", description: "Gain visibility for small businesses in a competitive market" },
    { title: "Process Insights", description: "Gain valuable insight into defense procurement processes" },
    { title: "New Opportunities", description: "Identify collaboration opportunities within the defense supply chain" }
  ];

  const participants = [
    {
      title: "Department of Defense Officials",
      description: (
        <>
          <p className="mb-2">
            <b>DoD Representatives and Agencies:</b> Military Agencies and Defense-Related Government bodies often participate in these Matchmaking Sessions to find qualified suppliers for various defense needs. This can include everything from Technology and Equipment to services like Logistics, Maintenance, Etc...
          </p>
        </>
      ),
      icon: Users
    },
    {
      title: "Government Agencies",
      description: (
        <>
          <p className="mb-2">
            <b>Federal, State, and Local Government Procurement Officers:</b> Government Agencies looking to meet Procurement goals or diversify their supplier base for Defense-Related Contracts may also benefit from participating in these Matchmaking Sessions.
          </p>
        </>
      ),
      icon: RiGovernmentLine
    },
    {
      title: "Large Defense Contractors and Prime Contractors",
      description: (
        <>
          <p className="mb-2">
            <b>Prime Contractors:</b> Large companies that work directly with the U.S. Department of Defense (DoD) and other Government Agencies to supply products or services. These companies can use Matchmaking Sessions to identify new Subcontractors, Suppliers, or Specialized Partners for their Defense Contracts.
            <br /><br />
            <b>Large Defense Contractors:</b> Major companies in the Defense Sector have extensive contracts with the Department of Defense (DoD) and other Government Agencies, providing a wide range of products and services. These Large Defense Contractors often seek specialized Subcontractors, Innovative Technologies, and Solutions to enhance their Capabilities and meet specific Defense Requirements.
            <br /><br />
            <b>Tier 1 and Tier 2 Suppliers:</b> Companies that play a significant role in the Defense Supply Chain and are looking to identify new partners or expand their network within the industry. They often seek niche technologies or capabilities that smaller companies may offer.
          </p>
        </>
      ),
      icon: Briefcase
    },
    {
      title: "Small and Disadvantaged Businesses",
      description: (
        <>
          <p className="mb-2">
            <b>Small Businesses:</b> Companies that are looking to expand their role in the Defense Supply Chain, Secure Government Contracts, or Form Partnerships with Larger Contractors. These include businesses of all sizes that meet the qualifications for Small Business Status under the U.S. Small Business Administration (SBA) guidelines.
            <br /><br />
            <b>Minority-Owned, Women-Owned, and Veteran-Owned Businesses:</b> These businesses are encouraged to participate in order to gain access to Procurement Opportunities and to promote Diversity within the Defense Industry. Many Large Contractors and Government Agencies have Diversity and Inclusion Initiatives aimed at expanding the involvement of these types of businesses in Defense Contracting.
            <br /><br />
            <b>Disadvantaged or Econominically Underserved Businesses:</b> Companies that are eligible for certain Federal Programs, such as those classified under the SBA's 8(a) Program, HUBZone, or other Disadvantaged Business status, can benefit from the Matchmaking Sessions to connect with entities actively seeking to fulfill Diversity Requirements.
          </p>
        </>
      ),
      icon: Building2
    },
  ];

  return (
    <div className="max-w-[92rem] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Matchmaking Sessions
        </h1>
        <p className="text-lg text-slate-600 max-w-[92rem] mx-auto">
          The <b>{event.title}</b> will offer a special opportunity for attendees to engage in One-on-One appointments with representatives and subject matter experts from the Department of Defense (DoD), Government Agencies, and Prime Contractors.
        </p>
        <div className="text-lg mt-4 mx-auto max-w-7xl text-slate-600">
          <p className="text-xl">
            Government & Military Officials Please inquire about Hosting a Matchmaking Table at <Link href={"mailto:info@americandefensealliance.org"} className="text-blue-500 underline">info@americandefensealliance.org</Link>.
          </p>
        </div>
      </div>

      {/* Purpose Section */}
      {/* <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Purpose and Benefits</h2>
        <p className="text-slate-600 mb-2 text-center">
          The Matchmaking Sessions are designed to connect small businesses with larger defense contractors, helping smaller companies navigate procurement processes, enhance their visibility in the defense market, and foster valuable partnerships. For Government Agencies and Defense Officials, the sessions offer access to a diverse array of innovative solutions, services, and products, enabling them to discover new opportunities, meet mission requirements more effectively, and engage with a broader range of potential suppliers.
        </p>
      </div> */}

      {/* How it Works Section */}
      <div className="bg-gradient-to-br from-navy-500 to-navy-800 text-white rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">How it Works</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <UserPlus className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Matchmaking Sign-ups</h3>
              <p className="text-gray-200">
                Sign-ups for the Matchmaking Sessions will begin at {event.matchmakingSessions?.signUpTime} on {event.matchmakingSessions?.signUpDate} and will be on a first-come, first-served basis.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Host Scheduling</h3>
              <p className="text-gray-200">
                Matchmaking Sessions will take place
                {event.matchmakingSessions?.sessions && event.matchmakingSessions.sessions.length > 0 && (
                  <>
                    {" from "}
                    {event.matchmakingSessions.sessions.map((s, i, arr) => {
                      const isLast = i === arr.length - 1;
                      const isSecondLast = i === arr.length - 2;

                      return (
                        <span key={i}>
                          {s.sessionTime} on {s.date}
                          {arr.length > 1 && !isLast && (isSecondLast ? " and " : ", ")}
                        </span>
                      );
                    })}
                    . Each host will have {event.matchmakingSessions.sessionDurationMinutes} minutes allocated for each appointment. The system is designed to ensure that both parties can maximize their time.
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Users className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Networking and Information Exchange</h3>
              <p className="text-gray-200">
                Matchmaking Sessions foster collaboration, creating a platform for businesses to form valuable partnerships, discuss subcontracting opportunities, and explore teaming opportunities that align defense needs with industry capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Who Should Participate Section */}
      {/*
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-slate-900 mb-6 text-center">Who Should Participate?</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {participants.map((participant, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-row items-center gap-3 mb-4">
                <participant.icon className="w-8 h-8 text-navy-800" />
                <h3 className="text-xl font-semibold">{participant.title}</h3>
              </div>
              <div className="text-slate-600">{participant.description}</div>
            </div>
          ))}
        </div>
      </div>
      */}

      {/* Key Outcomes Section */}
      <div className="bg-navy-800 rounded-xl p-8">
        <h2 className="text-4xl font-bold text-white mb-6 text-center">Key Outcomes</h2>
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

      {/* Matchmaking Sponsors Section */}
      {matchmakingData && matchmakingData.sponsors.length > 0 && (
        <div className="mt-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6 text-center">
            {matchmakingData.title || "Companies Participating in Matchmaking Sessions"}
          </h2>
          {matchmakingData.description && (
            <p className="text-lg text-slate-600 max-w-4xl mx-auto text-center mb-4">
              <span dangerouslySetInnerHTML={{ __html: matchmakingData.description }} />
            </p>
          )}
          <div className="space-y-6">
            {matchmakingData.sponsors.map((item) => (
              <MatchmakingSponsorCard key={item.sponsor._id} sponsor={item.sponsor} note={item.note} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchmakingPage;
