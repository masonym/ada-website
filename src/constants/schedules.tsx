import { SPEAKERS } from './speakers';

// Extended speaker type for schedule-specific data
export type ScheduleSpeaker = {
  speakerId: string; // Reference to SPEAKERS object
  presentation?: string;
  videoId?: string;
  videoStartTime?: number;
  sponsor?: string;
  sponsorStyle?: string;
};

export const SCHEDULES = [
    {
        id: 1, // This should match the event ID from EVENTS
        schedule: [
            {
                date: "November 14, 2024",
                items: [
                    {
                        time: "8:00 AM",
                        title: "On-Site Attendee Registration",
                        location: "Ballroom Pre-function"
                    },
                    {
                        time: "9:00 AM",
                        title: "Welcoming Remarks",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Charles F. Sills",
                            title: "President & CEO",
                            affiliation: "American Defense Alliance",
                            photo: "charles-sills.webp"
                        }],
                    },
                    {
                        time: "9:10 AM",
                        title: "Congressional Keynote Address",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            speakerId: "michael-waltz"
                        }],
                    },
                    {
                        time: "9:45 AM",
                        title: "Artificial Intelligence — Impact on Defense Acquisition",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            speakerId: "amir-bagherpour-phd",
                            presentation: "2025 Defense Industry Forecast - Amir Bagherpour, PhD.pdf",
                            videoId: "U_7h6bcAbGw"
                        }]
                    },
                    {
                        time: "10:15 AM",
                        title: "How To Do Business With The Primes I",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Mark Correll, P.E.",
                            title: "Vice President, Federal Strategy Director",
                            affiliation: "HDR, Inc. (Former Deputy Assistant Secretary of the Air Force for Environment, Safety and Infrastructure)",
                            photo: "mark-correll.webp",
                            presentation: "2025 Defense Industry Forecast - Mark Correll, P.E..pdf",
                            videoId: "wHdyJMbx1T4"
                        }]
                    },
                    {
                        time: "10:45 AM",
                        title: "Defense Department Keynote Address",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Honorable John P. (\"Sean\") Coffey",
                            title: "General Counsel",
                            affiliation: "Department of the Navy",
                            photo: "john-coffey.webp",
                            videoId: "0u9WV7ew3fo"
                        }]
                    },
                    {
                        time: "11:20 AM",
                        title: "Defense Dept. Small Business Programs",
                        location: "National Press Club Ballroom",
                        speakers: [
                            {
                                name: "Kimberly Diane Buehler",
                                title: "Director, Office of Small Business Programs (OSBP)",
                                affiliation: "U.S. Army, Department of Defense",
                                photo: "kimberly-buhler.webp",
                                presentation: "2025 Defense Industry Forecast - Kimberly Diane Buehler.pdf",
                                videoId: "Ib6OrnbElyM"
                            },
                            {
                                name: "Arveice Washington",
                                title: "Director, Office of Small Business Programs (OSBP)",
                                affiliation: "Office of the Secretary of the Navy",
                                photo: "arveice-washington.webp",
                                presentation: "2025 Defense Industry Forecast - Arveice Washington.pdf",
                                videoId: "Ib6OrnbElyM",
                                videoStartTime: 853,
                            },
                            {
                                name: "Scott Kiser",
                                title: "Director, Office of Small Business Programs (OSBP)",
                                affiliation: "Office of the Secretary of the Air Force",
                                photo: "scott-kiser.webp",
                                presentation: "2025 Defense Industry Forecast - Scott Kiser.pdf",
                                videoId: "Ib6OrnbElyM",
                                videoStartTime: 2215,
                            }
                        ]
                    },
                    {
                        time: "12:15 PM",
                        title: "Ukraine — Report from the Front — and the Military Support Effort",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Dr. Iryna Andrukh",
                            title: "Ukraine Program Director",
                            affiliation: "Progress Humanity (Formerly  Colonel in the Ukraine Army and Recipient of 4 Ukraine Presidential Medals of Honor)",
                            photo: "iryna-andrukh.webp",
                            videoId: "jAXyvPQE6y0"
                        }]
                    },
                    {
                        time: "12:45 PM",
                        title: "Lunch Networking Break",
                        location: "National Press Club Ballroom"
                    },
                    {
                        time: "1:30 PM",
                        title: "Defense Budget Analysis & Highlights",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Mark Cancian",
                            title: "Senior Advisor, International Security Program",
                            affiliation: "Center for Strategic and International Studies (CSIS)",
                            photo: "mark-cancian.webp",
                            presentation: "2025 Defense Industry Forecast - Mark Cancian.pdf",
                            videoId: "XGsVV7JSiSs",
                        }]
                    },
                    {
                        time: "2:00 PM",
                        title: "Transatlantic Defense Partnerships to Strengthen Industrial Resilience",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "His Royal Highness, Brigadier General Prince Joachim, Prince of Denmark",
                            title: "Danish Military Industry Attaché",
                            affiliation: "Royal Embassy of Denmark",
                            photo: "joachim-christian.webp",
                            videoId: "i4MiAeVu1uQ",
                        }]
                    },
                    {
                        time: "2:30 PM",
                        title: "Defense Department 'Innovation Hubs' — Champions for Innovative Small Business",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Brian Liesveld",
                            title: "Chief Executive Officer",
                            affiliation: "DEFENSEWERX",
                            photo: "brian-liesveld.webp",
                            presentation: "2025 Defense Industry Forecast - Brian Liesveld.pdf",
                            videoId: "eV076ok4lpM",
                        }]
                    },
                    {
                        time: "3:00 PM",
                        title: "Army Corps of Engineers — Acquisition Plans & Upcoming Projects",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "David Morrow",
                            title: "Acting Director, Military Programs",
                            affiliation: "U.S. Army Corps of Engineers",
                            photo: "david-morrow.webp",
                            presentation: "2025 Defense Industry Forecast - David Morrow.pdf",
                            videoId: "z-n6X4aOu7U",
                        }]
                    },
                    {
                        time: "3:30 PM",
                        title: "Strategies for Accessing Major GWACs (Government-Wide Acquisition Contracts)",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Patricia Waddell",
                            title: "Director, Office of IT Services",
                            affiliation: "Information Technology Category (ITC), Federal Acquisition Service (FAS), U.S. General Services Administration (GSA)",
                            photo: "patricia-waddell.webp",
                            presentation: "2025 Defense Industry Forecast - Patricia Waddell.pdf",
                            videoId: "-nz_EaZhvGU",
                        }]
                    },
                    {
                        time: "4:00 PM",
                        title: "Military Base-Community Partnership Programs",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Dave Leinberger",
                            title: "Acting Director, Army Partnerships",
                            affiliation: "Deputy Chief of Staff, G-9 (Installations)",
                            photo: "dave-leinberger.webp",
                            presentation: "2025 Defense Industry Forecast - Dave Leinberger.pdf",
                            videoId: "y-zMKsOL08I"
                        }]
                    },
                    {
                        time: "4:30 PM",
                        title: "NAVFAC Opportunities Support",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Bianca Henderson",
                            title: "Director, Office of Small Business Programs (OSBP)",
                            affiliation: "Naval Facilities Engineering Systems Command (NAVFAC)",
                            photo: "bianca-henderson.webp",
                            presentation: "2025 Defense Industry Forecast - Bianca Henderson.pdf",
                            videoId: "KBM8CQ1qbvA"
                        }]
                    },
                    {
                        time: "5:00 PM",
                        title: "How To Do Business With The Primes II",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "David Canada",
                            title: "Director, Global Supplier Diversity",
                            affiliation: "Boeing Defense Space & Security",
                            photo: "david-canada.webp",
                            presentation: "2025 Defense Industry Forecast - David Canada.pdf",
                            videoId: "sp_IldeZ_XY"
                        }]
                    },
                    {
                        time: "5:15 PM",
                        title: "Closing Remarks",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Charles F. Sills",
                            title: "President & CEO",
                            affiliation: "American Defense Alliance",
                            photo: "charles-sills.webp"
                        }],
                    },
                    {
                        time: "5:30 PM - 7:30 PM",
                        title: "VIP Networking Reception",
                        description: "Invitation Only: VIP Attendees, Exhibitors, Sponsors, Speakers, and invited guests",
                        location: "Fourth Estate Meeting Room"
                    }
                ]
            }

        ]
    },
    {
        "id": 2,
        "schedule": [
            {
                "date": "March 11, 2025",
                "items": [
                    {
                        "time": "7:30 AM",
                        "title": "On-Site Attendee Registration & Check-in",
                        "location": "Galleria Level, Pre-Function",
                    },
                    {
                        "time": "7:30 AM - 8:30 AM",
                        "title": "Networking Breakfast with Exhibitors",
                        "location": "Galleria 5-7",
                    },
                    {
                        "time": "7:30 AM - 8:30 AM",
                        "title": "Matchmaking Sign-up",
                        "location": "Galleria Level, Pre-Function",
                    },
                    {
                        "time": "8:30 AM - 4:00 PM",
                        "title": "Matchmaking Sign-up",
                        "location": "Galleria 4",
                    },
                    {
                        "time": "8:30 AM",
                        "title": "Conference Opening Remarks",
                        "speakers": [
                            {
                                "name": "Charles F. Sills",
                                "title": "President & CEO",
                                "affiliation": "American Defense Alliance",
                                "photo": "charles-sills.webp",
                                "sponsor": "Conference Moderator",
                                "sponsorStyle": "bg-red-999",
                                "videoId": "M1FmtrcHE5s",
                            }
                        ],

                    },
                    {
                        "time": "8:35 AM",
                        "title": "Georgia Chamber of Commerce — Welcoming Remarks",
                        "speakers": [
                            {
                                "name": "Tasha Allen",
                                "title": "Vice President of Talent Management",
                                "affiliation": "Georgia Chamber of Commerce",
                                "photo": "tasha-allen.webp",
                                "videoId": "8mJzEcUiAIs",
                            }
                        ],

                    },
                    {
                        "time": "8:45 AM",
                        "title": "Defense Department 'Innovation Hubs' – Champions for Innovative Small Business",
                        "speakers": [
                            {
                                "name": "Teresa Harrington, DBA, MBA, PCM",
                                "title": "Chief Operations Officer",
                                "affiliation": "DEFENSEWERX",
                                "photo": "teresa-harrington.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Teresa_Harrington.pdf",
                                "videoId": "IqJep-z-nPY",
                            }
                        ],

                    },
                    {
                        "time": "9:20 AM",
                        "title": "Military Base-Community Partnership Programs",
                        "speakers": [
                            {
                                "name": "David Leinberger",
                                "title": "Acting Director, Army Partnerships",
                                "affiliation": "Deputy Chief of Staff, G-9 (Installations)",
                                "photo": "dave-leinberger.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Dave_Leinberger___Erin_Bearhalter.pdf",
                                "videoId": "O-IXLwNwtW4",
                            },
                            {
                                "name": "Erin Bearhalter",
                                "title": "Project Manager",
                                "affiliation": "Office of the Deputy Chief of Staff, G-9 Army Community Partnership Office",
                                "photo": "erin-bearhalter.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Dave_Leinberger___Erin_Bearhalter.pdf",
                                "videoId": "O-IXLwNwtW4",
                            }
                        ],

                    },
                    {
                        "time": "10:00 AM",
                        "title": "UNITED STATES ARMY KEYNOTE PRESENTATION",
                        "speakers": [
                            {
                                "name": "Brandon Cockrell",
                                "title": "Deputy Assistant Secretary of the Army for Energy and Sustainability",
                                "affiliation": "Office of the Assistant Secretary of the Army for Installations, Energy and Environment",
                                "photo": "brandon-cockrell.webp",
                                "videoId": "1nBA5FCs0Wg",
                            }
                        ],

                    },
                    {
                        "time": "10:35 AM",
                        "title": "Networking Break with Exhibitors",
                        "location": "Galleria 5-7",
                    },
                    {
                        "time": "11:00 AM",
                        "title": "Sponsor Remarks",
                        "speakers": [
                            {
                                "name": "Tim Didjurgis",
                                "title": "Chief Operating Officer",
                                "affiliation": "Modtech Solutions, LLC",
                                "photo": "tim-didjurgis.webp",
                                "sponsor": "Platinum Sponsor",
                                "sponsorStyle": "bg-sky-300 text-slate-900",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Tim_Didjurgis.pdf",
                                "videoId": "zDu7nwf2NkA",
                            }
                        ],

                    },
                    {
                        "time": "11:20 AM",
                        "title": "CONGRESSIONAL KEYNOTE ADDRESS I",
                        "speakers": [
                            {
                                "name": "Representative Rob Wittman (R-VA)",
                                "title": "Vice Chairman, House Armed Services Committee, Chairman, Tactical Air and Land Forces Subcommittee, and Co-Chair, Congressional Shipbuilding Caucus",
                                "affiliation": "U.S. House of Representatives",
                                "photo": "rob-wittman.webp",
                                "sponsor": "Pre-Recorded Address",
                                "sponsorStyle": "bg-gray-300",
                                "videoId": "WQ5oQzWY2JE"
                            }
                        ],

                    },
                    {
                        "time": "11:30 AM",
                        "title": "Project Spectrum — Cybersecurity/CMMC Brief",
                        "speakers": [
                            {
                                "name": "Kareem A. Sykes",
                                "title": "Program Manager, Project Spectrum",
                                "affiliation": "Office of Small and Disadvantaged Business Utilization (OSDBU), U.S. Department of Defense",
                                "photo": "kareem-sykes.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Kareem_A._Sykes.pdf",
                                "videoId": "mWIgkwu0-GI",
                            },
                        ],

                    },
                    {
                        "time": "12:10 PM",
                        "title": "Cyber Fireside Chat",
                        "speakers": [
                            {
                                "name": "David Fraley",
                                "title": "Chief Technology Officer",
                                "affiliation": "Secure IT Service Management, Inc.",
                                "photo": "david-fraley.webp",
                                "sponsor": "Silver Sponsor",
                                "sponsorStyle": "bg-gray-300",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_David_Fraley.pdf",
                                "videoId": "nqV4BfL6ev8",
                            },
                            {
                                "name": "Kareem A. Sykes",
                                "title": "Program Manager, Project Spectrum",
                                "affiliation": "Office of Small and Disadvantaged Business Utilization (OSDBU), U.S. Department of Defense",
                                "photo": "kareem-sykes.webp"
                            },
                            //{
                            //    "name": "Peter A. DeLuca",
                            //    "title": "Business Development Director",
                            //    "affiliation": "Cybersecurity Collaboration Center (CCC), National Security Agency (NSA)",
                            //    //"photo": "peter-deluca.webp"
                            //}
                            //{
                            //    "name": "Bailey Bickley",
                            //    "title": "Chief",
                            //    "affiliation": "Defense Industrial Base (DIB), Cybersecurity Collaboration Center (CCC), National Security Agency (NSA)",
                            //    //"photo": "bailey-bickley.webp"
                            //}
                        ],

                    },
                    {
                        "time": "12:30 PM",
                        "title": "Networking Lunch with Exhibitors",
                        "location": "Galleria 5-7",
                    },
                    {
                        "time": "1:45 PM",
                        "title": "Military Base Energy Initiatives — How to Play a Part",
                        "speakers": [
                            {
                                "name": "Dave Robau, LEED AP",
                                "title": "Executive Director, Gulf Coast Energy Network",
                                "affiliation": "CEO and Chief Scientist, National Energy USA",
                                "photo": "dave-robau.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Dave_Robau.pdf",
                                "videoId": "wA8ANoPy40s",
                            },
                            {
                                "name": "Cliff Holbeck",
                                "title": "Sr. Business Development Manager",
                                "affiliation": "Honeywell International",
                                "photo": "cliff-holbeck.webp",
                            }
                        ],

                    },
                    {
                        "time": "2:30 PM",
                        "title": "Streamlined Acquisition for Our Warfighters",
                        "speakers": [
                            {
                                "name": "Aimee \"Z\" Zick",
                                "title": "Senior Business Development Executive",
                                "affiliation": "Improve Group",
                                "photo": "aimee-zick.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Aimee__Z__Zick.pdf",
                                "videoId": "uflobAWpy6g"
                            }
                        ],

                    },
                    {
                        "time": "3:10 PM",
                        "title": "Army Corps of Engineers – Projects & Contracts",
                        "speakers": [
                            //{
                            //    "name": "David Morrow",
                            //    "title": "Acting Director, Military Programs",
                            //    "affiliation": "U.S. Army Corps of Engineers",
                            //    "photo": "david-morrow.webp"
                            //},
                            //{
                            //    "name": "Sonya D. Rodgers",
                            //    "title": "Deputy Director, Office of Small Business Programs",
                            //    "affiliation": "U.S. Army Corps of Engineers – Mobile District",
                            //    "photo": "sonya-d-rodgers.webp"
                            //},
                            {
                                "name": "Sherrie Cordi",
                                "title": "Procurement Analyst, Office of Small Business Programs",
                                "affiliation": "U.S. Army Corps of Engineers, Memphis District",
                                "photo": "sherrie-cordi.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Sherrie_Cordi.pdf",
                                "videoId": "ZMUMzEsI9ls",
                            },
                            //{
                            //    "name": "Tonya D. Willis",
                            //    "title": "Deputy Director, Office of Small Business Programs",
                            //    "affiliation": "U.S. Army Corps of Engineers – Charleston District",
                            //    "photo": "tonya-willis.webp"
                            //},
                            //{
                            //    "name": "Austin J. Johnson",
                            //    "title": "Deputy Director, Office of Small Business Programs",
                            //    "affiliation": "U.S. Army Futures Command",
                            //    "photo": "austin-johnson.webp"
                            //}
                        ],

                    },
                    {
                        "time": "3:45 PM",
                        "title": "Day One Closing Remarks",
                        "speakers": [
                            {
                                "name": "Charles F. Sills",
                                "title": "President & CEO",
                                "affiliation": "American Defense Alliance",
                                "photo": "charles-sills.webp"
                            }
                        ],

                    },
                    {
                        "time": "4:00 PM - 5:30 PM",
                        "title": "Matchmaking Session",
                        "location": "Galleria 1",
                    },
                    {
                        "time": "5:30 PM - 7:30 PM",
                        "title": "VIP Networking Reception",
                        "location": "Galleria 5-7",
                        "description": "Invitation Only: VIP Attendees, Exhibitors, Sponsors, Speakers, and invited guests"
                    }
                ]
            },
            {
                "date": "March 12, 2025",
                "items": [
                    {
                        "time": "7:30 AM - 8:30 AM",
                        "title": "Networking Breakfast with Exhibitors",
                        "location": "Galleria 5-7",
                    },
                    {
                        "time": "8:30 AM",
                        "title": "Welcome Back Remarks",
                        "location": "Galleria 4",
                        "speakers": [
                            {
                                "name": "Charles F. Sills",
                                "title": "President & CEO",
                                "affiliation": "American Defense Alliance",
                                "photo": "charles-sills.webp",
                                "sponsor": "Conference Moderator",
                                "sponsorStyle": "bg-red-999",
                            }
                        ],

                    },
                    {
                        "time": "8:35 AM",
                        "title": "CONGRESSIONAL KEYNOTE ADDRESS II",
                        "speakers": [
                            {
                                "name": "Representative Neal Dunn (R-FL)",
                                "title": "Member, House Committee on Energy and Commerce, and House Select Committee on the Strategic Competition between the U.S. and the Chinese Communist Party",
                                "affiliation": "U.S. House of Representatives",
                                "photo": "neal-dunn.webp",
                                "sponsor": "Pre-Recorded Address",
                                "sponsorStyle": "bg-gray-300",
                                "videoId": "UK3HO8I25-o",
                            }
                        ],

                    },
                    {
                        "time": "8:45 AM",
                        "title": "Artificial Intelligence — Impact on Defense Acquisition",

                        "speakers": [{
                            "name": "Amir Bagherpour, PhD",
                            "title": "Managing Director and Analytics & Visualization Lead for Data & AI",
                            "affiliation": "Accenture Federal Services",
                            "photo": "amir-bagherpour.webp",
                            "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Amir_Bagherpour.pdf",
                            "videoId": "_CjCfcyiHxY",
                        }]
                    },
                    {
                        "time": "9:20 AM",
                        "title": "Using Mentor-Protégé Partnerships to Drive the Combat Capability Factory",

                        "speakers": [{
                            "name": "Andrew Gardner",
                            "title": "Chief Executive Officer",
                            "affiliation": "Crux Defense and Partner, National All-Domain Warfighting Center’s Combat Capabilities Factory",
                            "photo": "andrew-gardner.webp",
                            "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Andrew_Gardner.pdf",
                            "videoId": "tRDlepOOsc8",
                        }]
                    },
                    {
                        "time": "9:50 AM",
                        "title": "Indo-Pacific Theater/U.S. Navy Force Posture",
                        "speakers": [
                            {
                                "name": "Brent D. Sadler",
                                "title": "Senior Research Fellow, Naval Warfare and Advanced Technology Center for National Defense",
                                "affiliation": "The Heritage Foundation",
                                "photo": "brent-sadler.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Brent_D._Sadler.pdf",
                            }
                        ],

                    },
                    {
                        "time": "10:15 AM",
                        "title": "Defense Industrial Base Briefing",
                        "speakers": [
                            {
                                "name": "Wesley J. Jefferies",
                                "title": "Industry Liaison, OUSD (A&S) Office of Industrial Base Policy, Industrial Base Analysis and Sustainment (IBAS) Program, Innovation Capability and Modernization (ICAM) Office",
                                "affiliation": "U.S. Department of Defense",
                                "photo": "wesley-jefferies.webp",
                                "videoId": "mqxg3IjE7CM",
                            }
                        ],

                    },
                    //{
                    //    "time": "10:40 AM",
                    //    "title": "Networking Break",
                    //    "speakers": [
                    //        //{
                    //        //    "name": "Lieutenant General Robert M. Collins",
                    //        //    "title": "Military Deputy Assistant Secretary of the Army",
                    //        //    "affiliation": "Acquisition, Logistics & Technology",
                    //        //    "photo": "robert-collins.webp"
                    //        //}
                    //    ],
                    //    "location": "Galleria 5-7",
                    //},
                    {
                        "time": "10:40 AM",
                        "title": "MBDA Federal Procurement Center — Tiger Team Briefing",
                        "speakers": [
                            {
                                "name": "Oscar Frazier",
                                "title": "Tiger Team Lead, Federal Procurement Center, Minority Business Development Agency (MBDA)",
                                "affiliation": "U.S. Department of Commerce",
                                "photo": "oscar-frazier.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Oscar_Frazier.pdf",
                                "videoId": "cM0UYZQCsJs",
                            }
                        ],

                    },
                    {
                        "time": "11:00 AM",
                        "title": "NAVFAC — Projects & Contracts",
                        "speakers": [
                            {
                                "name": "Bianca Henderson",
                                "title": "Director, Office of Small Business Programs (OSBP)",
                                "affiliation": "Naval Facilities Engineering Systems Command (NAVFAC)",
                                "photo": "bianca-henderson.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Bianca_Henderson.pdf",
                                "videoId": "OhPg2CIopu0",
                            }
                        ],

                    },
                    {
                        "time": "11:30 AM",
                        "title": "Insights From the Former Chief of Army Acquisition",
                        "speakers": [
                            {
                                "name": "Charles F. Sills",
                                "affiliation": "American Defense Alliance",
                                "title": "President & CEO",
                                "photo": "charles-sills.webp",
                                "videoId": "IWx9CDnE7pg",
                            },
                            {
                                "name": "James Simpson, Major General, U.S. Army (Ret.)",
                                "sponsor": "Platinum Sponsor",
                                "sponsorStyle": "bg-sky-300 text-slate-900",
                                "title": "Executive Director of Federal Strategic Initiatives",
                                "affiliation": "Modtech Solutions, LLC",
                                "photo": "james-simpson.webp"
                            }
                        ],

                    },
                    {
                        "time": "11:45 AM",
                        "title": "Air Force Sustainment Center/Robins AFB — Small Business Opportunities",
                        "speakers": [
                            {
                                "name": "Tim Inman",
                                "title": "Director of Small Business Programs",
                                "affiliation": "Air Force Sustainment Center, Robins Air Force Base",
                                "photo": "timothy-r-inman.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Tim_Inman.pdf",
                                "videoId": "_4WTRx-h8Dc",
                            }
                        ],

                    },
                    //{
                    //    "time": "11:40 AM",
                    //    "title": "NAVFAC – Projects & Contracts",
                    //    "speakers": [
                    //        //{
                    //        //    "name": "Captain Miguel Dieguez",
                    //        //    "title": "Commanding Officer, NAVFAC Southeast and Regional Engineer",
                    //        //    "affiliation": "Navy Region Southeast, Naval Facilities Engineering Systems Command (NAVFAC)",
                    //        //    "photo": "miguel-dieguez.webp"
                    //        //},
                    //        //{
                    //        //    "name": "Captain Edward B. Miller IV",
                    //        //    "title": "Vice Commander",
                    //        //    "affiliation": "Naval Facilities Engineering Systems Command (NAVFAC) Atlantic",
                    //        //    "photo": "edward-miller.webp"
                    //        //},
                    //        //{
                    //        //    "name": "Richard S. Tyler",
                    //        //    "title": "Chief Engineer / Planning Design and Construction Director",
                    //        //    "affiliation": "Naval Facilities Engineering Systems Command (NAVFAC) Atlantic",
                    //        //    "photo": "richard-tyler.webp"
                    //        //},
                    //        //{
                    //        //    "name": "Bob Silver, PE",
                    //        //    "title": "Acting Assistant Commander for Design & Construction",
                    //        //    "affiliation": "Naval Facilities Engineering Systems Command (NAVFAC)",
                    //        //    "photo": "bob-silver.webp"
                    //        //},
                    //        //{
                    //        //    "name": "Cindy Readal",
                    //        //    "title": "Assistant Commander for Contracting",
                    //        //    "affiliation": "Naval Facilities Engineering Systems Command (NAVFAC)",
                    //        //    "photo": "cindy-readal.webp"
                    //        //}
                    //    ],
                    //    
                    //},
                    //{
                    //    "time": "12:15 PM",
                    //    "title": "Army & Marine Corps Depot Procurement",
                    //    "speakers": [
                    //        //{
                    //        //    "name": "Colonel Juliet H. Calvin",
                    //        //    "title": "Joint Staff, Acquisition, Data & Analytics",
                    //        //    "affiliation": "U.S. Marine Corps",
                    //        //    "photo": "juliet-calvin.webp"
                    //        //},
                    //        //{
                    //        //    "name": "Terry L. Whitaker",
                    //        //    "title": "Small Business Specialist, HQMC Installations and Logistics (HQMC/I&L)",
                    //        //    "affiliation": "Marine Corps Logistics Command",
                    //        //    "photo": "terry-whitaker.webp"
                    //        //},
                    //        //{
                    //        //    "name": "Shynta Hudson",
                    //        //    "title": "Executive assistant",
                    //        //    "affiliation": "Anniston Army Depot",
                    //        //    "photo": "shynta-hudson.webp"
                    //        //}
                    //    ],
                    //    
                    //}, 
                    {
                        "time": "12:15 PM",
                        "title": "Canadian Defense Ministry — Contract Opportunities",
                        "speakers": [
                            {
                                "name": "Linda Eshiwani-Nate",
                                "title": "Trade Commissioner",
                                "affiliation": "Consulate General of Canada in Atlanta",
                                "photo": "linda-eshiwani-nate.webp",
                                "presentation": "2025_Southeast_Defense_Procurement_Conference_-_Linda_Eshiwani-Nate.pdf",
                                "videoId": "OYMq4CEnh9c",
                            }
                        ],

                    },
                    {
                        "time": "12:30 PM",
                        "title": "Closing Remarks",
                        "speakers": [
                            {
                                "name": "Charles F. Sills",
                                "affiliation": "American Defense Alliance",
                                "title": "President & CEO",
                                "photo": "charles-sills.webp"
                            }
                        ],

                    }
                ]
            }
        ]
    },
    {
        id: 3,
        schedule: [
            {
                date: "December 8, 2024",
                items: [
                    {
                        time: "6:00 PM - 8:00 PM",
                        title: "Meet & Greet Bourbon Tasting with Astronauts",
                        location: "Zarrellas, 8801 Astronaut Blvd. Cape Canaveral, FL 32920",
                        sponsorLogo: '/events/2025DTIOS/sponsors/zarrellas.webp',
                        description: "(Add-On Registration and Payment is Required for this Event)"
                    },

                ],
            },
            {
                date: "December 9, 2024",
                items: [
                    {
                        time: "10:00 AM - 10:30 AM",
                        title: "Overview – Exponential Space Sector Activity – The Commercial, Government & Defense Dimensions",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "10:30 AM - 11:15 AM",
                        title: "U.S. Government & Defense Agencies – Engaging the Innovative Private Sector",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "11:15 AM - 12:00 PM",
                        title: "Funding Space Industrialization – Space Industry Investment",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "12:00 PM - 12:30 PM",
                        title: "Manufacturing Opportunities in Space",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "12:30 PM - 1:15 PM",
                        title: "Lunch Networking Break",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "1:15 PM - 1:55 PM",
                        title: "Spaceport Infrastructure Needs",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "1:55 PM - 2:30 PM",
                        title: "Attracting Local Tech Companies to the U.S. Space Enterprise",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "2:30 PM - 3:15 PM",
                        title: "U.S. Space Defense – Challenges & Imperatives",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "3:15 PM - 4:00 PM",
                        title: "Quantum & AI Driving New Frontiers in Space",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "4:00 PM - 4:30 PM",
                        title: "Cybersecurity – Protecting the Industrialization of Space",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "4:30 PM - 5:00 PM",
                        title: "Propulsion, Propellants & Fuels",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "5:00 PM - 5:30 PM",
                        title: "Space Asset Supply Chain Challenges",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "5:30 PM",
                        title: "Closing Comments",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    }
                ]
            }
        ]
    },
    {
        id: 4,
        schedule: [
            {
                date: "July 28, 2025",
                items: [
                    {
                        time: "3:00 PM - 6:00 PM",
                        title: "Exhibitor Set-up",
                        location: "Norfolk Ballroom (I-IV), Ground Level",
                    },
                    {
                        time: "6:00 PM - 7:00 PM",
                        title: "Social Hour: Jumpstart Your Networking Over Drinks with Fellow Attendees, Exhibitors, and Sponsors.",
                        location: "The Great Room, 2nd FL (by \"START\" Restaurant)",
                    }
                ],
            },
            {
                date: "July 29, 2025",
                items: [
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "On-Site Attendee Registration & Check-in",
                        location: "Norfolk Ballroom Pre-Function, Ground Level",
                    },
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "Networking Breakfast with Exhibitors",
                        location: "Norfolk Ballroom (I-IV), Ground Level",
                    },
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "Matchmaking Session I Sign-up",
                        location: "Norfolk Ballroom Pre-Function, Ground Level",
                    },
                    {
                        time: "8:30 AM",
                        title: "Conference Opening",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "charles-sills",
                                sponsor: "Conference Moderator",
                                sponsorStyle: "bg-red-999",
                            }
                        ]
                    },
                    {
                        time: "8:35 AM",
                        title: "Welcoming Remarks – Commonwealth of Virginia & Hampton Roads Alliance",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "juan-pablo-segura",
                            },
                            {
                                speakerId: "jared-chalk",
                            }
                        ]
                    },
                    {
                        time: "9:00 AM",
                        title: "CONGRESSIONAL KEYNOTE ADDRESS I",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "representative-rob-wittman",
                                sponsor: "Pre-Recorded Address",
                                sponsorStyle: "bg-gray-300",
                            }
                        ]
                    },
                    {
                        time: "9:15 AM",
                        title: "America’s Defense Industry in Context",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "brad-williamson",
                            }
                        ]
                    },
                    {
                        time: "9:40 AM",
                        title: "The 'SHIPS ACT' & the American Shipbuilding Industrial Base – Partnering for Success",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "roger-camp",
                                sponsor: "Platinum Sponsor",
                                sponsorStyle: "bg-sky-300 text-slate-900",
                            },
                            {
                                speakerId: "vice-admiral-richard-w-hunt",
                            },
                            {
                                speakerId: "victorino-mercado",
                            },
                            {
                                speakerId: "dr-steven-wills"
                            }
                        ]
                    },
                    {
                        time: "10:30 AM",
                        title: "Networking Break with Exhibitors",
                        location: "Norfolk Ballroom (I-IV), Ground Level",
                    },
                    {
                        time: "11:00 AM",
                        title: "How DEFENSEWERX Hubs Are Accelerating Innovative Tech Contracting",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "brian-liesveld",
                            },
                        ]
                    },
                    {
                        time: "11:25 AM",
                        title: "Fleet Readiness Panel – Addressing Critical Challenges & Requirements",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "erica-h-plath"
                            },
                            {
                                speakerId: "philip-hart-cullom"
                            },
                            {
                                speakerId: "captain-rick-tyler"
                            },
                            {
                                speakerId: "stephen-mongold"
                            },
                            {
                                speakerId: "hunter-stires"
                            }
                        ]
                    },
                    {
                        time: "12:15 PM",
                        title: "Industry Insights: Contested Logistics",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "kurt-garrett",
                                sponsor: "Gold Sponsor",
                                sponsorStyle: "bg-[#ffaf00] text-slate-900"
                            }
                        ]
                    },
                    {
                        time: "12:30 PM",
                        title: "Networking Lunch with Exhibitors",
                        location: "Norfolk Ballroom (I-IV), Ground Level",
                    },
                    {
                        time: "1:45 PM",
                        title: "Artificial Intelligence in Defense – Leveraging Navy Use Cases",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "daniel-hudson"
                            },
                            // {
                            //     speakerId: "amir-bagherpour-phd",
                            // }
                        ]
                    },
                    {
                        time: "2:15 PM",
                        title: "UNITED STATES MARINE CORPS KEYNOTE ADDRESS",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "christopher-m-haar"
                            }
                        ]
                    },
                    {
                        time: "2:45 PM",
                        title: "Industry Insights: The Machine Shop You Didn’t Know You Had",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "don-mcginnis",
                                sponsor: "Bronze Sponsor",
                                sponsorStyle: "bg-[#CD7F32] text-slate-900"
                            }
                        ]
                    },
                    {
                        time: "3:00 PM",
                        title: "Military Base-Community Partnerships Promoting Local Build Contracts",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "dave-leinberger"
                            },
                            {
                                speakerId: "brian-w-miller"
                            }
                        ]
                    },
                    {
                        time: "3:35 PM",
                        title: "Small Business Programs/Opportunities – Plus Accessing GWAC’S, OTA’S & SBIR’S",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "charles-sills",
                                sponsor: "Panel Moderator",
                                sponsorStyle: "bg-red-999",
                            },
                            {
                                speakerId: "terressa-bebout"
                            },
                            {
                                speakerId: "stacey-l-cooper"
                            },
                            {
                                speakerId: "tiffany-l-trotter"
                            },
                            {
                                speakerId: "rosetta-rodwell"
                            }
                        ]
                    },
                    {
                        time: "4:30 PM",
                        title: "Day One Closing Remarks",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "charles-sills",
                                sponsor: "Conference Moderator",
                                sponsorStyle: "bg-red-999",
                            }
                        ]
                    },
                    {
                        time: "4:30 PM - 5:30 PM",
                        title: "Matchmaking Session I",
                        location: "Franklin-Yorktown Meeting Room, 2nd Floor"
                    },
                    {
                        time: "4:30 PM - 5:30 PM",
                        title: "Networking with Exhibitors",
                        location: "Norfolk Ballroom (I-IV), Ground Level"
                    },
                    {
                        time: "6:00 PM - 8:00 PM",
                        title: "VIP Networking Reception",
                        description: "Invitation Only: VIP Attendees, Exhibitors, Sponsors, Speakers, and invited guests",
                        location: "The Harbor Club, Waterside District. 333 Waterside Dr Suite 200, Norfolk, VA 23510",
                    },
                ],
            },
            {
                date: "July 30, 2025",
                items: [
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "Networking Breakfast with Exhibitors",
                        location: "Norfolk Ballroom (I-IV), Ground Level",
                    },
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "Matchmaking Session II Sign-up",
                        location: "Norfolk Ballroom Pre-Function, Ground Level",
                    },
                    {
                        time: "8:30 AM",
                        title: "Welcome Back Remarks",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "charles-sills",
                                sponsor: "Conference Moderator",
                                sponsorStyle: "bg-red-999",
                            }
                        ]
                    },
                    {
                        time: "8:35 AM",
                        title: "CONGRESSIONAL KEYNOTE ADDRESS II",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                    },
                    {
                        time: "8:50 AM",
                        title: "How to do Business with the Primes",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "diane-dempsey"
                            },
                            {
                                speakerId: "katina-adams"
                            },
                            {
                                speakerId: "stacey-r-washington"
                            },
                            {
                                speakerId: "robyn-card"
                            },
                            {
                                speakerId: "david-canada"
                            }
                        ]
                    },
                    {
                        time: "9:45 AM",
                        title: "Industry Insights: Forward Opening Base Mobile Manufacturing",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "paul-wichert",
                                sponsor: "Gold Sponsor",
                                sponsorStyle: "bg-[#ffaf00] text-slate-900"
                            }
                        ]
                    },
                    {
                        time: "10:00 AM",
                        title: "Networking Break with Exhibitors",
                        location: "Norfolk Ballroom (I-IV), Ground Level"
                    },
                    {
                        time: "10:30 AM",
                        title: "From the Small Business Front Line: Streamlined Acquisition Examples",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "aimee-zick",
                            }
                        ]
                    },
                    {
                        time: "11:00 AM",
                        title: "Geopolitical SITREP: The Military-Energy Nexus",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "anthony-livanios"
                            }
                        ]
                    },
                    {
                        time: "11:25 AM",
                        title: "Procurement Strategies for Navy Port Security & Cyber Protection",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "charles-sills",
                                sponsor: "Panel Moderator",
                                sponsorStyle: "bg-red-999",
                            },
                            {
                                speakerId: "joel-coulter"
                            },
                            {
                                speakerId: "nicholas-antonio-rocha"
                            },
                            {
                                speakerId: "jeffrey-hoffman",
                            },
                            {
                                speakerId: "nicholas-diehl"
                            }
                        ]
                    },
                    {
                        time: "12:05 PM",
                        title: "Using Mentor-Protégé Partnerships to Drive the ‘Combat Capability Factory’",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "andrew-gardner"
                            },
                        ]
                    },
                    {
                        time: "12:30 PM",
                        title: "Closing Remarks",
                        location: "Norfolk Ballroom (V-VI), Ground Level",
                        speakers: [
                            {
                                speakerId: "charles-sills",
                                sponsor: "Conference Moderator",
                                sponsorStyle: "bg-red-999",
                            }
                        ]
                    },
                    {
                        time: "12:30 PM - 1:30 PM",
                        title: "Matchmaking Session II",
                        location: "Franklin-Yorktown Meeting Room, 2nd Floor"
                    },
                    {
                        time: "12:30 PM - 1:30 PM",
                        title: "Networking with Exhibitors",
                        location: "Norfolk Ballroom (I-IV), Ground Level"
                    },
                ],
            },
        ],
    },
    {
        id: 5,
        schedule: [
            {
                date: "November 4, 2025",
                items: [
                    {
                        time: "3:00 PM - 6:00 PM",
                        title: "Exhibitor Set-up",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                ],
            },
            {
                date: "November 5, 2025",
                items: [
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "On-Site Attendee Registration & Check-in",
                        location: "Rio Grande Hall Pre-Function",
                    },
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "Networking Breakfast with Exhibitors",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "Matchmaking Session I Sign-up",
                        location: "Rio Grande Hall Pre-Function",
                    },
                    {
                        time: "8:30 AM - 10:00 AM",
                        title: "General Sessions",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "10:00 AM - 10:15 AM",
                        title: "Networking Break with Exhibitors",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "10:15 AM - 12:30 PM",
                        title: "General Sessions",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "12:30 PM - 1:30 PM",
                        title: "Networking Lunch with Exhibitors",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "1:30 PM - 3:00 PM",
                        title: "General Sessions",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "3:00 PM - 3:15 PM",
                        title: "Networking Break with Exhibitors",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "3:15 PM - 4:30 PM",
                        title: "General Sessions",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "4:30 PM - 5:30 PM",
                        title: "Matchmaking Session I",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "5:30 PM - 7:30 PM",
                        title: "VIP Networking Reception",
                        location: "Rio Grande Hall, Plaza Lower Level",
                        description: "Invitation Only: VIP Attendees, Exhibitors, Sponsors, Speakers, and invited guests",
                    },

                ],
            },
            {
                date: "November 6, 2025",
                items: [
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "Networking Breakfast with Exhibitors",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "Matchmaking Session II Sign-up",
                        location: "Rio Grande Hall Pre-Function",
                    },
                    {
                        time: "8:30 AM - 10:30 AM",
                        title: "General Sessions",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "10:30 AM - 10:45 AM",
                        title: "Networking Break with Exhibitors",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "10:45 AM - 12:30 PM",
                        title: "General Sessions",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                    {
                        time: "12:30 PM - 1:30 PM",
                        title: "Matchmaking Session II",
                        location: "Rio Grande Hall, Plaza Lower Level",
                    },
                ],
            }

        ]
    },

];
