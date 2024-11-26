import React from 'react';
import { Users, Clock, CheckCircle, UserPlus, Building2, Briefcase, GraduationCap } from 'lucide-react';
import { RiGovernmentLine } from "react-icons/ri";
import Link from 'next/link';

const MatchmakingPage = () => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Matchmaking Sessions
        </h1>
        <p className="text-lg text-slate-600 max-w-7xl mx-auto">
          The <b>2025 Southeast Defense Procurement Conference</b> will offer a special opportunity for businesses to engage in One-on-One Matchmaking Sessions with key decision-makers from the Department of Defense (DoD), Government Agencies, and Prime Contractors.
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
                Sign-ups for the Matchmaking Sessions will begin at 7:30 AM on March 18 and will be on a first-come, first-served basis. Businesses will need to provide their contact information and details about their capabilities, products, and services during the sign-up process.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Host Scheduling</h3>
              <p className="text-gray-200">
              Matchmaking Sessions will take place from 4:00 PM - 5:30 PM on March 18. Each host will have 9 available slots, with each session lasting 10 minutes. The system is designed to ensure that both parties can maximize their time, focusing on relevant opportunities.
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
              <div className="flex flex-row items-center gap-3 mb-4">
                <participant.icon className="w-8 h-8 text-navy-800" />
                <h3 className="text-xl font-semibold">{participant.title}</h3>
              </div>
              <div className="text-slate-600">{participant.description}</div>
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