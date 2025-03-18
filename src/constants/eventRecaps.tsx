// constants/eventRecaps.tsx
import { EventRecap } from '@/types/eventRecap';
import React from 'react';

// Example event recap data
export const EVENT_RECAPS: EventRecap[] = [
  {
    eventShorthand: '2025SDPC', // This should match the event.eventShorthand
    //introduction: (
    //  <>
    //    <p className="text-lg mb-4">
    //      American Defense Alliance's 2025 Southeast Defense Procurement Conference brought together industry leaders, government officials,
    //      and defense experts for a day of insightful discussions and networking.
    //    </p>
    //  </>
    //),
    sections: [
      {
        id: 'featured',
        title: 'Event Highlights',
        //description: (
        //  <p className="text-base text-gray-600 mb-6">
        //    Key moments from throughout the day showcasing speakers, attendees, and special presentations.
        //  </p>
        //),
        layout: 'carousel',
        images: [
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (1).webp',
            alt: '2025SDPC Event Highlights',
            width: 4542,
            height: 3076,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (2).webp',
            alt: '2025SDPC Event Highlights',
            width: 3965,
            height: 4935,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (3).webp',
            alt: '2025SDPC Event Highlights',
            width: 3548,
            height: 4480,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (4).webp',
            alt: '2025SDPC Event Highlights',
            width: 6720,
            height: 4480,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (5).webp',
            alt: '2025SDPC Event Highlights',
            width: 4282,
            height: 3580,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (6).webp',
            alt: '2025SDPC Event Highlights',
            width: 3765,
            height: 2862,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (7).webp',
            alt: '2025SDPC Event Highlights',
            width: 3996,
            height: 2830,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (8).webp',
            alt: '2025SDPC Event Highlights',
            width: 3790,
            height: 2605,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (9).webp',
            alt: '2025SDPC Event Highlights',
            width: 6720,
            height: 2557,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (10).webp',
            alt: '2025SDPC Event Highlights',
            width: 4010,
            height: 2518,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (11).webp',
            alt: '2025SDPC Event Highlights',
            width: 6720,
            height: 4480,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (12).webp',
            alt: '2025SDPC Event Highlights',
            width: 6720,
            height: 4480,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (13).webp',
            alt: '2025SDPC Event Highlights',
            width: 2915,
            height: 3756,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (14).webp',
            alt: '2025SDPC Event Highlights',
            width: 3648,
            height: 3648,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (15).webp',
            alt: '2025SDPC Event Highlights',
            width: 4605,
            height: 4175,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (16).webp',
            alt: '2025SDPC Event Highlights',
            width: 4756,
            height: 3658,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (17).webp',
            alt: '2025SDPC Event Highlights',
            width: 6006,
            height: 2386,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (18).webp',
            alt: '2025SDPC Event Highlights',
            width: 2846,
            height: 2595,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (19).webp',
            alt: '2025SDPC Event Highlights',
            width: 6720,
            height: 4480,
            featured: true,
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - General (20).webp',
            alt: '2025SDPC Event Highlights',
            width: 6302,
            height: 4201,
            featured: true,
          },
        ]
      },
      {
        id: 'exhibitors',
        title: 'Exhibitors',
        layout: 'masonry',
        images: [
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (1).webp',
            alt: 'Secure IT Service Management, Inc.',
            width: 5912,
            height: 3941,
            caption: 'Secure IT Service Management, Inc.',
            people: [],
            tags: ['exhibitor', 'technology']
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (2).webp',
            alt: 'Secure IT Service Management, Inc.',
            width: 4578,
            height: 4480,
            caption: 'Secure IT Service Management, Inc.',
            people: [],
            tags: ['exhibitor', 'technology']
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (3).webp',
            alt: 'Ardmore Consulting Group',
            width: 4145,
            height: 3539,
            caption: 'Ardmore Consulting Group',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (4).webp',
            alt: 'Deschamps Mats Systems, Inc.',
            width: 4462,
            height: 3953,
            caption: 'Deschamps Mats Systems, Inc.',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (5).webp',
            alt: 'DreamSeat',
            width: 5630,
            height: 3753,
            caption: 'DreamSeat',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (6).webp',
            alt: 'GT APEX Accelerator',
            width: 3415,
            height: 2954,
            caption: 'GT APEX Accelerator',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (7).webp',
            alt: 'Hungerford & Terry, Inc.',
            width: 4386,
            height: 4415,
            caption: 'Hungerford & Terry, Inc.',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (8).webp',
            alt: 'IMSM, Inc.',
            width: 5613,
            height: 3020,
            caption: 'IMSM, Inc.',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (9).webp',
            alt: 'Integration Technologies Group, Inc.',
            width: 6110,
            height: 3745,
            caption: 'Integration Technologies Group, Inc.',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (10).webp',
            alt: 'Iuvo Systems',
            width: 5761,
            height: 3959,
            caption: 'Iuvo Systems',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (11).webp',
            alt: 'medava®',
            width: 5414,
            height: 3783,
            caption: 'medava®',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (12).webp',
            alt: 'Modtech Solutions',
            width: 6720,
            height: 4480,
            caption: 'Modtech Solutions',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (13).webp',
            alt: 'Modtech Solutions',
            width: 6720,
            height: 4480,
            caption: 'Modtech Solutions',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (14).webp',
            alt: 'National Energy USA',
            width: 6720,
            height: 4480,
            caption: 'National Energy USA',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (15).webp',
            alt: 'Perimeter Office Products',
            width: 6720,
            height: 4480,
            caption: 'Perimeter Office Products',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (16).webp',
            alt: 'Precision Grinding, Inc. DBA PGI Steel',
            width: 4898,
            height: 3825,
            caption: 'Precision Grinding, Inc. DBA PGI Steel',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (17).webp',
            alt: 'Precision Resource',
            width: 4107,
            height: 3768,
            caption: 'Precision Resource',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (18).webp',
            alt: 'PSA, Inc./CMPRO',
            width: 4866,
            height: 4325,
            caption: 'PSA, Inc./CMPRO',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (19).webp',
            alt: 'PSA, Inc./CMPRO',
            width: 4259,
            height: 3768,
            caption: 'PSA, Inc./CMPRO',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (20).webp',
            alt: 'Redstone Government Consulting, Inc.',
            width: 5110,
            height: 4480,
            caption: 'Redstone Government Consulting, Inc.',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (21).webp',
            alt: 'Redstone Government Consulting, Inc.',
            width: 5981,
            height: 4385,
            caption: 'Redstone Government Consulting, Inc.',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (22).webp',
            alt: 'SAFE Structure Designs',
            width: 4148,
            height: 4367,
            caption: 'SAFE Structure Designs',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (23).webp',
            alt: 'SixAxis, LLC',
            width: 4592,
            height: 4176,
            caption: 'SixAxis, LLC',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (24).webp',
            alt: 'Solid Platforms, Inc.',
            width: 4757,
            height: 3832,
            caption: 'Solid Platforms, Inc.',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (25).webp',
            alt: 'The Avery Group, LLC',
            width: 5886,
            height: 3924,
            caption: 'The Avery Group, LLC',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (26).webp',
            alt: 'Foundation Technologies',
            width: 6302,
            height: 4201,
            caption: 'Foundation Technologies',
          },
          {
            src: 'events/2025SDPC/photos/2025 SDPC - Exhibitors (27).webp',
            alt: 'NextGen Defense Systems showcasing their latest drone technology',
            width: 5669,
            height: 3779,
            caption: 'Zero Waste Solutions, Inc.',
          },
        ]
      },
      {
        id: 'speakers',
        title: 'Speakers',
        layout: 'carousel',
        images: [
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_1.webp',
            alt: 'Charles Sills',
            width: 3648,
            height: 4242,
            people: ['Charles Sills',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_2.webp',
            alt: 'Charles Sills',
            width: 2805,
            height: 2805,
            people: ['Charles Sills',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_3.webp',
            alt: 'Charles Sills',
            width: 3733,
            height: 3131,
            people: ['Charles Sills',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_4.webp',
            alt: 'Erin Bearhalter',
            width: 5472,
            height: 3648,
            caption: '',
            people: ['Erin Bearhalter',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_5.webp',
            alt: 'Erin Bearhalter',
            width: 5472,
            height: 3648,
            caption: '',
            people: ['Erin Bearhalter',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_6.webp',
            alt: 'Charles Sills and Tim Didjurgis',
            width: 3818,
            height: 3000,
            people: ['Charles Sills', 'Tim Didjurgis',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_7.webp',
            alt: 'Tim Didjurgis',
            width: 3848,
            height: 4306,
            people: ['Tim Didjurgis',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_8.webp',
            alt: 'Tim Didjurgis',
            width: 3648,
            height: 4306,
            people: ['Tim Didjurgis',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_9.webp',
            alt: 'Tim Didjurgis',
            width: 4474,
            height: 3053,
            people: ['Tim Didjurgis',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_10.webp',
            alt: 'Roy Cabibbo',
            width: 4009,
            height: 2790,
            people: ['Roy Cabibbo',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_11.webp',
            alt: 'Tim Swindall',
            width: 3673,
            height: 3225,
            caption: '',
            people: ['Tim Swindall',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_12.webp',
            alt: 'Tim Swindall',
            width: 2613,
            height: 4395,
            caption: '',
            people: ['Tim Swindall',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_13.webp',
            alt: 'James Simpson',
            width: 3453,
            height: 2512,
            caption: '',
            people: ['James Simpson',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_14.webp',
            alt: 'James Simpson',
            width: 3223,
            height: 3031,
            people: ['James Simpson',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_15.webp',
            alt: 'Modtech Solutions Sponsor Remarks',
            width: 5472,
            height: 1416,
            people: ['Tim Swindall', 'Tim Didjurgis', 'James Simpson', 'Roy Cabibbo',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_16.webp',
            alt: 'Modtech Solutions Sponsor Remarks',
            width: 3551,
            height: 2445,
            people: ['Roy Cabibbo', 'Tim Didjurgis', 'James Simpson', 'Tim Swindall',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_17.webp',
            alt: 'Modtech Solutions and Charles Sills',
            width: 5627,
            height: 3699,
            people: ['Roy Cabibbo', 'Tim Swindall', 'James Simpson', 'Tim Didjurgis', 'Charles Sills'],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_18.webp',
            alt: 'Representative Rob Wittman (R-VA)',
            width: 5207,
            height: 1869,
            people: ['Representative Rob Wittman (R-VA)',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_19.webp',
            alt: 'Representative Rob Wittman (R-VA)',
            width: 4532,
            height: 2244,
            caption: '',
            people: ['Representative Rob Wittman (R-VA)',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_20.webp',
            alt: 'Kareem A. Sykes',
            width: 4972,
            height: 3648,
            caption: '',
            people: ['Kareem A. Sykes', 'Charles Sills'],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_21.webp',
            alt: 'Kareem A. Sykes',
            width: 3648,
            height: 4055,
            caption: '',
            people: ['Kareem A. Sykes',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_22.webp',
            alt: 'David Fraley and Kareem A. Sykes',
            width: 6720,
            height: 3978,
            people: ['Kareem A. Sykes', 'David Fraley'],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_23.webp',
            alt: 'David Fraley and Kareem A. Sykes',
            width: 5472,
            height: 3191,
            people: ['Kareem A. Sykes', 'David Fraley'],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_24.webp',
            alt: 'David Fraley and Kareem A. Sykes',
            width: 5061,
            height: 3338,
            people: ['Kareem A. Sykes', 'David Fraley'],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_25.webp',
            alt: 'Dave Robau',
            width: 3560,
            height: 3769,
            people: ['Dave Robau',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_26.webp',
            alt: 'Dave Robau',
            width: 3897,
            height: 3403,
            people: ['Dave Robau',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_27.webp',
            alt: 'Dave Robau',
            width: 3727,
            height: 2928,
            people: ['Dave Robau',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_28.webp',
            alt: 'Aimee \"Z\" Zick',
            width: 3835,
            height: 3102,
            caption: '',
            people: ['Aimee \"Z\" Zick',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_29.webp',
            alt: 'Aimee \"Z\" Zick',
            width: 3648,
            height: 3970,
            caption: '',
            people: ['Aimee \"Z\" Zick',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_30.webp',
            alt: 'Aimee \"Z\" Zick',
            width: 3897,
            height: 3403,
            caption: '',
            people: ['Aimee \"Z\" Zick',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_31.webp',
            alt: 'Andy Gardner',
            width: 3058,
            height: 2812,
            caption: '',
            people: ['Andy Gardner',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_32.webp',
            alt: 'Andy Gardner',
            width: 4506,
            height: 3258,
            people: ['Andy Gardner',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_33.webp',
            alt: 'Andy Gardner',
            width: 4397,
            height: 2948,
            people: ['Andy Gardner',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_34.webp',
            alt: 'Oscar Frazier',
            width: 4350,
            height: 2819,
            caption: '',
            people: ['Oscar Frazier',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_35.webp',
            alt: 'Oscar Frazier',
            width: 3331,
            height: 4350,
            caption: '',
            people: ['Oscar Frazier',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_36.webp',
            alt: 'Oscar Frazier',
            width: 3331,
            height: 4350,
            people: ['Oscar Frazier',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_37.webp',
            alt: 'Linda Eshiwani-Nate',
            width: 3648,
            height: 4348,
            caption: '',
            people: ['Linda Eshiwani-Nate',],
          },
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_38.webp',
            alt: 'Linda Eshiwani-Nate',
            width: 3648,
            height: 4842,
            people: ['Linda Eshiwani-Nate',],
          },
        ]
      },
    ]
  },
  {
    eventShorthand: '2025DIF',
    sections: [
      {
        id: 'featured',
        title: 'Event Highlights',
        //description: (
        //  <p className="text-base text-gray-600 mb-6">
        //    Key moments from throughout the day showcasing speakers, attendees, and special presentations.
        //  </p>
        //),
        layout: 'masonry',
        images: [
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (1).webp",
            "alt": "2025 Defense Industry Forecast (1) Image",
            "width": 1280,
            "height": 1090
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (10).webp",
            "alt": "2025 Defense Industry Forecast (10) Image",
            "width": 1280,
            "height": 1005
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (11).webp",
            "alt": "2025 Defense Industry Forecast (11) Image",
            "width": 1280,
            "height": 853
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (12).webp",
            "alt": "2025 Defense Industry Forecast (12) Image",
            "width": 1280,
            "height": 468
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (13).webp",
            "alt": "2025 Defense Industry Forecast (13) Image",
            "width": 1280,
            "height": 853
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (14).webp",
            "alt": "2025 Defense Industry Forecast (14) Image",
            "width": 1280,
            "height": 1330
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (15).webp",
            "alt": "2025 Defense Industry Forecast (15) Image",
            "width": 1280,
            "height": 1167
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (16).webp",
            "alt": "2025 Defense Industry Forecast (16) Image",
            "width": 1280,
            "height": 1319
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (17).webp",
            "alt": "2025 Defense Industry Forecast (17) Image",
            "width": 1280,
            "height": 1128
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (18).webp",
            "alt": "2025 Defense Industry Forecast (18) Image",
            "width": 1280,
            "height": 1067
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (2).webp",
            "alt": "2025 Defense Industry Forecast (2) Image",
            "width": 1280,
            "height": 648
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (3).webp",
            "alt": "2025 Defense Industry Forecast (3) Image",
            "width": 1280,
            "height": 853
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (4).webp",
            "alt": "2025 Defense Industry Forecast (4) Image",
            "width": 1280,
            "height": 853
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (5).webp",
            "alt": "2025 Defense Industry Forecast (5) Image",
            "width": 1280,
            "height": 1071
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (6).webp",
            "alt": "2025 Defense Industry Forecast (6) Image",
            "width": 1280,
            "height": 853
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (7).webp",
            "alt": "2025 Defense Industry Forecast (7) Image",
            "width": 1280,
            "height": 1040
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (8).webp",
            "alt": "2025 Defense Industry Forecast (8) Image",
            "width": 1280,
            "height": 1432
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast (9).webp",
            "alt": "2025 Defense Industry Forecast (9) Image",
            "width": 1280,
            "height": 831
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Amir Bagherpour (1).webp",
            "alt": "2025 Defense Industry Forecast - Amir Bagherpour (1) Image",
            "width": 1280,
            "height": 1280
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Amir Bagherpour (2).webp",
            "alt": "2025 Defense Industry Forecast - Amir Bagherpour (2) Image",
            "width": 1280,
            "height": 1280
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Amir Bagherpour (3).webp",
            "alt": "2025 Defense Industry Forecast - Amir Bagherpour (3) Image",
            "width": 1280,
            "height": 1417
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Amir Bagherpour (4).webp",
            "alt": "2025 Defense Industry Forecast - Amir Bagherpour (4) Image",
            "width": 1280,
            "height": 933
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Arveice Washington (1).webp",
            "alt": "2025 Defense Industry Forecast - Arveice Washington (1) Image",
            "width": 1280,
            "height": 1820
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Arveice Washington (2).webp",
            "alt": "2025 Defense Industry Forecast - Arveice Washington (2) Image",
            "width": 1280,
            "height": 1199
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Bianca Henderson (1).webp",
            "alt": "2025 Defense Industry Forecast - Bianca Henderson (1) Image",
            "width": 1280,
            "height": 871
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Bianca Henderson (2).webp",
            "alt": "2025 Defense Industry Forecast - Bianca Henderson (2) Image",
            "width": 1280,
            "height": 1200
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Brian Liesveld (1).webp",
            "alt": "2025 Defense Industry Forecast - Brian Liesveld (1) Image",
            "width": 1280,
            "height": 1113
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Brian Liesveld (2).webp",
            "alt": "2025 Defense Industry Forecast - Brian Liesveld (2) Image",
            "width": 1280,
            "height": 1280
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Brian Liesveld (3).webp",
            "alt": "2025 Defense Industry Forecast - Brian Liesveld (3) Image",
            "width": 1280,
            "height": 1381
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Brigadier General Prince Joachim (1).webp",
            "alt": "2025 Defense Industry Forecast - Brigadier General Prince Joachim (1) Image",
            "width": 1280,
            "height": 1153
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Brigadier General Prince Joachim (2).webp",
            "alt": "2025 Defense Industry Forecast - Brigadier General Prince Joachim (2) Image",
            "width": 1280,
            "height": 1427
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Brigadier General Prince Joachim (3).webp",
            "alt": "2025 Defense Industry Forecast - Brigadier General Prince Joachim (3) Image",
            "width": 1280,
            "height": 624
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Brigadier General Prince Joachim (4).webp",
            "alt": "2025 Defense Industry Forecast - Brigadier General Prince Joachim (4) Image",
            "width": 1280,
            "height": 621
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Dave Leinberger (1).webp",
            "alt": "2025 Defense Industry Forecast - Dave Leinberger (1) Image",
            "width": 1280,
            "height": 1297
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Dave Leinberger (2).webp",
            "alt": "2025 Defense Industry Forecast - Dave Leinberger (2) Image",
            "width": 1280,
            "height": 1577
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Dave Leinberger (3).webp",
            "alt": "2025 Defense Industry Forecast - Dave Leinberger (3) Image",
            "width": 1280,
            "height": 940
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Dave Morrow (1).webp",
            "alt": "2025 Defense Industry Forecast - Dave Morrow (1) Image",
            "width": 1280,
            "height": 888
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Dave Morrow (2).webp",
            "alt": "2025 Defense Industry Forecast - Dave Morrow (2) Image",
            "width": 1280,
            "height": 1017
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - David Canada (1).webp",
            "alt": "2025 Defense Industry Forecast - David Canada (1) Image",
            "width": 1280,
            "height": 994
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - David Canada (2).webp",
            "alt": "2025 Defense Industry Forecast - David Canada (2) Image",
            "width": 1280,
            "height": 1394
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - David Canada (3).webp",
            "alt": "2025 Defense Industry Forecast - David Canada (3) Image",
            "width": 1280,
            "height": 1565
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Dr. Iryna Andrukh (1).webp",
            "alt": "2025 Defense Industry Forecast - Dr. Iryna Andrukh (1) Image",
            "width": 1280,
            "height": 850
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Dr. Iryna Andrukh (2).webp",
            "alt": "2025 Defense Industry Forecast - Dr. Iryna Andrukh (2) Image",
            "width": 1280,
            "height": 1280
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Dr. Iryna Andrukh (3).webp",
            "alt": "2025 Defense Industry Forecast - Dr. Iryna Andrukh (3) Image",
            "width": 1280,
            "height": 853
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Honorable Sean P. Coffey (1).webp",
            "alt": "2025 Defense Industry Forecast - Honorable Sean P. Coffey (1) Image",
            "width": 1280,
            "height": 1280
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Honorable Sean P. Coffey (2).webp",
            "alt": "2025 Defense Industry Forecast - Honorable Sean P. Coffey (2) Image",
            "width": 1280,
            "height": 1280
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Kimberly Buehler (1).webp",
            "alt": "2025 Defense Industry Forecast - Kimberly Buehler (1) Image",
            "width": 1280,
            "height": 1280
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Kimberly Buehler (2).webp",
            "alt": "2025 Defense Industry Forecast - Kimberly Buehler (2) Image",
            "width": 1280,
            "height": 1310
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Mark Cancian (1).webp",
            "alt": "2025 Defense Industry Forecast - Mark Cancian (1) Image",
            "width": 1280,
            "height": 1208
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Mark Cancian (2).webp",
            "alt": "2025 Defense Industry Forecast - Mark Cancian (2) Image",
            "width": 1280,
            "height": 1358
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Patricia Waddell (1).webp",
            "alt": "2025 Defense Industry Forecast - Patricia Waddell (1) Image",
            "width": 1280,
            "height": 848
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Patricia Waddell (2).webp",
            "alt": "2025 Defense Industry Forecast - Patricia Waddell (2) Image",
            "width": 1280,
            "height": 549
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Scott Kiser (1).webp",
            "alt": "2025 Defense Industry Forecast - Scott Kiser (1) Image",
            "width": 1280,
            "height": 1080
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Scott Kiser (2).webp",
            "alt": "2025 Defense Industry Forecast - Scott Kiser (2) Image",
            "width": 1280,
            "height": 1046
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Small Business Programs Panel (1).webp",
            "alt": "2025 Defense Industry Forecast - Small Business Programs Panel (1) Image",
            "width": 1280,
            "height": 643
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Small Business Programs Panel (2).webp",
            "alt": "2025 Defense Industry Forecast - Small Business Programs Panel (2) Image",
            "width": 1280,
            "height": 694
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Small Business Programs Panel (3).webp",
            "alt": "2025 Defense Industry Forecast - Small Business Programs Panel (3) Image",
            "width": 1280,
            "height": 577
          },
          {
            "src": "events/2025DIF/photos/2025 Defense Industry Forecast - Small Business Programs Panel (4).webp",
            "alt": "2025 Defense Industry Forecast - Small Business Programs Panel (4) Image",
            "width": 1280,
            "height": 1067
          }
        ]
      }
    ]
  },

];

/**
 * Get recap data for a specific event
 * @param eventShorthand The shorthand identifier for the event
 * @returns The event recap data or undefined if not found
 */
export function getEventRecap(eventShorthand: string): EventRecap | undefined {
  return EVENT_RECAPS.find(recap => recap.eventShorthand === eventShorthand);
}
