/**
 * Comprehensive Database of Uttar Pradesh Agricultural Districts, Blocks/Tehsils & Key Villages
 * Covers Eastern UP (Purvanchal), Central UP (Awadh), Western UP (Rohilkhand/Harit Pradesh), 
 * and Bundelkhand zones.
 */

import { CropType, SoilType } from '../types';

export interface UPBlockInfo {
  block: string;
  blockHi: string;
  district: string;
  zone: 'Purvanchal' | 'Awadh' | 'Rohilkhand' | 'Bundelkhand' | 'Doab';
  lat: number;
  lng: number;
  primaryCrop: CropType;
  soilType: SoilType;
  keyVillages: { name: string; nameHi: string; lat: number; lng: number }[];
}

export const UP_DISTRICTS_AND_BLOCKS: Record<string, UPBlockInfo[]> = {
  'Varanasi': [
    {
      block: 'Kashi Vidyapeeth',
      blockHi: 'काशी विद्यापीठ',
      district: 'Varanasi',
      zone: 'Purvanchal',
      lat: 25.320,
      lng: 82.950,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Shivpur', nameHi: 'शिवपुर', lat: 25.352, lng: 82.964 },
        { name: 'Manduadih', nameHi: 'मंडुआडीह', lat: 25.295, lng: 82.960 },
        { name: 'Lahartara', nameHi: 'लहरतारा', lat: 25.312, lng: 82.970 },
        { name: 'Kakarmatta', nameHi: 'ककरमत्ता', lat: 25.290, lng: 82.975 },
      ],
    },
    {
      block: 'Pindra',
      blockHi: 'पिंडरा',
      district: 'Varanasi',
      zone: 'Purvanchal',
      lat: 25.450,
      lng: 82.860,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Babatpur', nameHi: 'बाबतपुर', lat: 25.448, lng: 82.859 },
        { name: 'Pindra Khas', nameHi: 'पिंडरा खास', lat: 25.460, lng: 82.870 },
        { name: 'Basni', nameHi: 'बसनी', lat: 25.430, lng: 82.840 },
        { name: 'Sindhora', nameHi: 'सिंधोरा', lat: 25.480, lng: 82.890 },
      ],
    },
    {
      block: 'Sevapuri',
      blockHi: 'सेवापुरी',
      district: 'Varanasi',
      zone: 'Purvanchal',
      lat: 25.385,
      lng: 82.810,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Rameshwar', nameHi: 'रामेश्वर', lat: 25.389, lng: 82.812 },
        { name: 'Kharawan', nameHi: 'खरावां', lat: 25.375, lng: 82.825 },
        { name: 'Kapsethi', nameHi: 'कपसेठी', lat: 25.395, lng: 82.795 },
      ],
    },
    {
      block: 'Arajiline',
      blockHi: 'आराजीलाइन',
      district: 'Varanasi',
      zone: 'Purvanchal',
      lat: 25.280,
      lng: 82.870,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Rohania', nameHi: 'रोहनिया', lat: 25.265, lng: 82.905 },
        { name: 'Raja Talab', nameHi: 'राजा तालाब', lat: 25.275, lng: 82.865 },
        { name: 'Jakhini', nameHi: 'जखिनी', lat: 25.250, lng: 82.840 },
      ],
    },
    {
      block: 'Cholapur',
      blockHi: 'चोलापुर',
      district: 'Varanasi',
      zone: 'Purvanchal',
      lat: 25.430,
      lng: 83.040,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Cholapur Khas', nameHi: 'चोलापुर खास', lat: 25.435, lng: 83.045 },
        { name: 'Dharsauna', nameHi: 'धरसौना', lat: 25.410, lng: 83.060 },
        { name: 'Badaura', nameHi: 'बदौरा', lat: 25.445, lng: 83.020 },
      ],
    },
  ],

  'Barabanki': [
    {
      block: 'Ramnagar',
      blockHi: 'रामनगर',
      district: 'Barabanki',
      zone: 'Awadh',
      lat: 27.085,
      lng: 81.395,
      primaryCrop: 'Sugarcane',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Ramnagar Rural', nameHi: 'रामनगर देहात', lat: 27.090, lng: 81.400 },
        { name: 'Mahadeva', nameHi: 'महादेवा लोधेश्वर', lat: 27.110, lng: 81.385 },
        { name: 'Kintoor', nameHi: 'किन्तूर', lat: 27.020, lng: 81.480 },
        { name: 'Fatehpur Road', nameHi: 'फतेहपुर मोड़', lat: 27.060, lng: 81.360 },
      ],
    },
    {
      block: 'Fatehpur',
      blockHi: 'फतेहपुर',
      district: 'Barabanki',
      zone: 'Awadh',
      lat: 27.170,
      lng: 81.220,
      primaryCrop: 'Sugarcane',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Bhitaria', nameHi: 'भितरिया', lat: 27.150, lng: 81.250 },
        { name: 'Belhara', nameHi: 'बेलहरा', lat: 27.200, lng: 81.180 },
        { name: 'Dhaurahra', nameHi: 'धौरहरा', lat: 27.180, lng: 81.240 },
      ],
    },
    {
      block: 'Sirauli Ghauspur',
      blockHi: 'सिरौली गौसपुर',
      district: 'Barabanki',
      zone: 'Awadh',
      lat: 26.970,
      lng: 81.520,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Badosarai', nameHi: 'बदोसराय', lat: 26.980, lng: 81.540 },
        { name: 'Parijaat Dhaam', nameHi: 'पारिजात धाम', lat: 26.995, lng: 81.510 },
        { name: 'Tikaitnagar', nameHi: 'टिकैतनगर', lat: 26.940, lng: 81.580 },
      ],
    },
    {
      block: 'Nawabganj',
      blockHi: 'नवाबगंज',
      district: 'Barabanki',
      zone: 'Awadh',
      lat: 26.930,
      lng: 81.190,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Satrikh', nameHi: 'सतरिख', lat: 26.860, lng: 81.200 },
        { name: 'Rasauli', nameHi: 'रसौली', lat: 26.920, lng: 81.260 },
        { name: 'Jahangirabad', nameHi: 'जहांगीराबाद', lat: 26.980, lng: 81.220 },
      ],
    },
    {
      block: 'Haidergarh',
      blockHi: 'हैदरगढ़',
      district: 'Barabanki',
      zone: 'Awadh',
      lat: 26.600,
      lng: 81.420,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Subha', nameHi: 'सुभा', lat: 26.610, lng: 81.430 },
        { name: 'Bhilwal', nameHi: 'भिलवल', lat: 26.650, lng: 81.380 },
        { name: 'Ansari', nameHi: 'अंसारी', lat: 26.580, lng: 81.450 },
      ],
    },
  ],

  'Gorakhpur': [
    {
      block: 'Campierganj',
      blockHi: 'कैम्पियरगंज',
      district: 'Gorakhpur',
      zone: 'Purvanchal',
      lat: 27.020,
      lng: 83.270,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Rawatganj', nameHi: 'रावतगंज', lat: 27.030, lng: 83.280 },
        { name: 'Baraipar', nameHi: 'बरईपार', lat: 27.010, lng: 83.250 },
        { name: 'Mani Ram', nameHi: 'मनीराम', lat: 26.850, lng: 83.330 },
      ],
    },
    {
      block: 'Pipraich',
      blockHi: 'पिपराइच',
      district: 'Gorakhpur',
      zone: 'Purvanchal',
      lat: 26.830,
      lng: 83.520,
      primaryCrop: 'Sugarcane',
      soilType: 'Clay Loam',
      keyVillages: [
        { name: 'Pipraich Rural', nameHi: 'पिपराइच ग्रामीण', lat: 26.835, lng: 83.525 },
        { name: 'Matihani', nameHi: 'मतिहानी', lat: 26.810, lng: 83.540 },
        { name: 'Unchgaon', nameHi: 'ऊंचगांव', lat: 26.850, lng: 83.500 },
      ],
    },
    {
      block: 'Chargawan',
      blockHi: 'चरगांवा',
      district: 'Gorakhpur',
      zone: 'Purvanchal',
      lat: 26.790,
      lng: 83.390,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Medical College Zone', nameHi: 'मेडिकल कॉलेज क्षेत्र', lat: 26.795, lng: 83.395 },
        { name: 'Jungle Kauria', nameHi: 'जंगल कौड़िया', lat: 26.840, lng: 83.300 },
        { name: 'Bhathat', nameHi: 'भटहट', lat: 26.870, lng: 83.470 },
      ],
    },
    {
      block: 'Sahjanwa',
      blockHi: 'सहजनवां',
      district: 'Gorakhpur',
      zone: 'Purvanchal',
      lat: 26.760,
      lng: 83.200,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Ghaghrasara', nameHi: 'घघरासारा', lat: 26.750, lng: 83.220 },
        { name: 'Baghapar', nameHi: 'बाघापार', lat: 26.780, lng: 83.180 },
        { name: 'Bhilora', nameHi: 'भिलोरा', lat: 26.740, lng: 83.170 },
      ],
    },
    {
      block: 'Barhalganj',
      blockHi: 'बड़हलगंज',
      district: 'Gorakhpur',
      zone: 'Purvanchal',
      lat: 26.280,
      lng: 83.500,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Gola', nameHi: 'गोला', lat: 26.340, lng: 83.350 },
        { name: 'Bansgaon', nameHi: 'बांसगांव', lat: 26.550, lng: 83.350 },
        { name: 'Koilari', nameHi: 'कोइलारी', lat: 26.290, lng: 83.510 },
      ],
    },
  ],

  'Lucknow': [
    {
      block: 'Malihabad',
      blockHi: 'मलिहाबाद',
      district: 'Lucknow',
      zone: 'Awadh',
      lat: 26.920,
      lng: 80.710,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Kasmandi Kalan', nameHi: 'कसमंडी कलां', lat: 26.930, lng: 80.730 },
        { name: 'Bakshi Ka Talab Rural', nameHi: 'बख्शी का तालाब देहात', lat: 26.980, lng: 80.890 },
        { name: 'Saspan', nameHi: 'ससपन', lat: 26.900, lng: 80.680 },
      ],
    },
    {
      block: 'Mohanlalganj',
      blockHi: 'मोहनलालगंज',
      district: 'Lucknow',
      zone: 'Awadh',
      lat: 26.670,
      lng: 80.980,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Nagram', nameHi: 'नगराम', lat: 26.610, lng: 81.130 },
        { name: 'Gosainganj', nameHi: 'गोसाईंगंज', lat: 26.770, lng: 81.120 },
        { name: 'Kankaha', nameHi: 'कनकहा', lat: 26.650, lng: 80.950 },
      ],
    },
    {
      block: 'Sarojininagar',
      blockHi: 'सरोजनीनगर',
      district: 'Lucknow',
      zone: 'Awadh',
      lat: 26.750,
      lng: 80.870,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Banthra', nameHi: 'बंथरा', lat: 26.700, lng: 80.830 },
        { name: 'Piparsand', nameHi: 'पीपरसंड', lat: 26.740, lng: 80.860 },
        { name: 'Gauri', nameHi: 'गौरी', lat: 26.760, lng: 80.880 },
      ],
    },
  ],

  'Prayagraj': [
    {
      block: 'Karchana',
      blockHi: 'करछना',
      district: 'Prayagraj',
      zone: 'Purvanchal',
      lat: 25.300,
      lng: 81.920,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Dharwara', nameHi: 'धारवारा', lat: 25.310, lng: 81.930 },
        { name: 'Bhita', nameHi: 'भीटा', lat: 25.290, lng: 81.880 },
        { name: 'Kewai', nameHi: 'केवई', lat: 25.280, lng: 81.950 },
      ],
    },
    {
      block: 'Phulpur',
      blockHi: 'फूलपुर',
      district: 'Prayagraj',
      zone: 'Purvanchal',
      lat: 25.550,
      lng: 82.080,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'IFFCO Township Agri Zone', nameHi: 'इफको कृषि क्षेत्र', lat: 25.560, lng: 82.070 },
        { name: 'Sarai Inayat', nameHi: 'सराय इनायत', lat: 25.480, lng: 81.980 },
        { name: 'Handia', nameHi: 'हंडिया', lat: 25.360, lng: 82.180 },
      ],
    },
    {
      block: 'Soraon',
      blockHi: 'सोरांव',
      district: 'Prayagraj',
      zone: 'Purvanchal',
      lat: 25.580,
      lng: 81.850,
      primaryCrop: 'Paddy',
      soilType: 'Sandy Loam',
      keyVillages: [
        { name: 'Mauaima', nameHi: 'मऊआइमा', lat: 25.700, lng: 81.920 },
        { name: 'Holagarh', nameHi: 'होलगढ़', lat: 25.640, lng: 81.780 },
        { name: 'Shantipuram', nameHi: 'शांतिपुरम ग्रामीण', lat: 25.520, lng: 81.860 },
      ],
    },
    {
      block: 'Meja',
      blockHi: 'मेजा',
      district: 'Prayagraj',
      zone: 'Purvanchal',
      lat: 25.140,
      lng: 82.120,
      primaryCrop: 'Pulses',
      soilType: 'Bundelkhand Mixed',
      keyVillages: [
        { name: 'Koraon', nameHi: 'कोरांव', lat: 24.980, lng: 82.060 },
        { name: 'Kohdar', nameHi: 'कोहदार', lat: 25.120, lng: 82.150 },
        { name: 'Manda', nameHi: 'मांडा', lat: 25.080, lng: 82.260 },
      ],
    },
  ],

  'Ayodhya': [
    {
      block: 'Milkipur',
      blockHi: 'मिल्कीपुर',
      district: 'Ayodhya',
      zone: 'Awadh',
      lat: 26.600,
      lng: 81.900,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Inayat Nagar', nameHi: 'इनायत नगर', lat: 26.610, lng: 81.910 },
        { name: 'Kuchera', nameHi: 'कुचेरा', lat: 26.580, lng: 81.880 },
        { name: 'Amaniganj', nameHi: 'अमानीगंज', lat: 26.660, lng: 81.820 },
      ],
    },
    {
      block: 'Bikapur',
      blockHi: 'बीकापुर',
      district: 'Ayodhya',
      zone: 'Awadh',
      lat: 26.600,
      lng: 82.130,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Chaure Bazar', nameHi: 'चौरे बाजार', lat: 26.550, lng: 82.160 },
        { name: 'Tarun', nameHi: 'तारुन', lat: 26.620, lng: 82.220 },
        { name: 'Pura Bazar', nameHi: 'पूरा बाजार', lat: 26.740, lng: 82.270 },
      ],
    },
    {
      block: 'Sohawal',
      blockHi: 'सोहावल',
      district: 'Ayodhya',
      zone: 'Awadh',
      lat: 26.760,
      lng: 82.020,
      primaryCrop: 'Sugarcane',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Ranimau', nameHi: 'रानीमऊ', lat: 26.770, lng: 82.040 },
        { name: 'Rudauli Rural', nameHi: 'रुदौली ग्रामीण', lat: 26.750, lng: 81.750 },
        { name: 'Masodha', nameHi: 'मसोधा', lat: 26.730, lng: 82.140 },
      ],
    },
  ],

  'Meerut': [
    {
      block: 'Mawana',
      blockHi: 'मवाना',
      district: 'Meerut',
      zone: 'Rohilkhand',
      lat: 29.100,
      lng: 77.920,
      primaryCrop: 'Sugarcane',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Hastinapur Dehat', nameHi: 'हस्तिनापुर देहात', lat: 29.170, lng: 78.020 },
        { name: 'Parikshitgarh', nameHi: 'परीक्षितगढ़', lat: 28.980, lng: 77.930 },
        { name: 'Phalauda', nameHi: 'फलौदा', lat: 29.180, lng: 77.850 },
      ],
    },
    {
      block: 'Daurala',
      blockHi: 'दौराला',
      district: 'Meerut',
      zone: 'Rohilkhand',
      lat: 29.120,
      lng: 77.720,
      primaryCrop: 'Sugarcane',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Sardhana Rural', nameHi: 'सरधना ग्रामीण', lat: 29.150, lng: 77.620 },
        { name: 'Rohta', nameHi: 'रोहटा', lat: 29.020, lng: 77.580 },
        { name: 'Sarurpur', nameHi: 'सरूरपुर', lat: 29.080, lng: 77.520 },
      ],
    },
  ],

  'Agra': [
    {
      block: 'Fatehpur Sikri',
      blockHi: 'फतेहपुर सीकरी',
      district: 'Agra',
      zone: 'Doab',
      lat: 27.090,
      lng: 77.660,
      primaryCrop: 'Mustard',
      soilType: 'Sandy Loam',
      keyVillages: [
        { name: 'Kiraoli', nameHi: 'किरावली', lat: 27.140, lng: 77.780 },
        { name: 'Achhnera', nameHi: 'अछनेरा', lat: 27.180, lng: 77.760 },
        { name: 'Bichpuri', nameHi: 'बिचपुरी कृषि फार्म', lat: 27.170, lng: 77.910 },
      ],
    },
    {
      block: 'Fatehabad',
      blockHi: 'फतेहाबाद',
      district: 'Agra',
      zone: 'Doab',
      lat: 27.020,
      lng: 78.300,
      primaryCrop: 'Potato',
      soilType: 'Sandy Loam',
      keyVillages: [
        { name: 'Shamsabad', nameHi: 'शमसाबाद', lat: 27.020, lng: 78.130 },
        { name: 'Barauli Ahir', nameHi: 'बरौली अहीर', lat: 27.120, lng: 78.050 },
        { name: 'Pinahat', nameHi: 'पिनाहट', lat: 26.880, lng: 78.380 },
      ],
    },
  ],

  'Jhansi': [
    {
      block: 'Mauranipur',
      blockHi: 'मऊरानीपुर',
      district: 'Jhansi',
      zone: 'Bundelkhand',
      lat: 25.240,
      lng: 79.140,
      primaryCrop: 'Pulses',
      soilType: 'Bundelkhand Mixed',
      keyVillages: [
        { name: 'Rani Khas', nameHi: 'रानी खास', lat: 25.250, lng: 79.150 },
        { name: 'Baragaon', nameHi: 'बड़ागांव', lat: 25.480, lng: 78.680 },
        { name: 'Chirgaon', nameHi: 'चिरगांव', lat: 25.580, lng: 78.820 },
        { name: 'Moth Rural', nameHi: 'मोंठ ग्रामीण', lat: 25.720, lng: 78.950 },
      ],
    },
    {
      block: 'Babina',
      blockHi: 'बबीना',
      district: 'Jhansi',
      zone: 'Bundelkhand',
      lat: 25.230,
      lng: 78.470,
      primaryCrop: 'Pulses',
      soilType: 'Bundelkhand Mixed',
      keyVillages: [
        { name: 'Talbehat Road', nameHi: 'तालबेहट मार्ग', lat: 25.180, lng: 78.450 },
        { name: 'Garhmau', nameHi: 'गढ़मऊ', lat: 25.420, lng: 78.580 },
        { name: 'Palinda', nameHi: 'पालिंदा', lat: 25.320, lng: 78.520 },
      ],
    },
  ],

  'Bareilly': [
    {
      block: 'Baheri',
      blockHi: 'बहेड़ी',
      district: 'Bareilly',
      zone: 'Rohilkhand',
      lat: 28.780,
      lng: 79.500,
      primaryCrop: 'Sugarcane',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Richha', nameHi: 'रिछा', lat: 28.710, lng: 79.520 },
        { name: 'Shergarh', nameHi: 'शेरगढ़', lat: 28.650, lng: 79.350 },
        { name: 'Faridpur', nameHi: 'फरीदपुर देहात', lat: 28.210, lng: 79.540 },
      ],
    },
    {
      block: 'Aonla',
      blockHi: 'आंवला',
      district: 'Bareilly',
      zone: 'Rohilkhand',
      lat: 28.280,
      lng: 79.150,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Majhgawan', nameHi: 'मझगवां', lat: 28.320, lng: 79.180 },
        { name: 'Bhamora', nameHi: 'भमोरा', lat: 28.260, lng: 79.280 },
        { name: 'Aliganj', nameHi: 'अलीगंज', lat: 28.360, lng: 79.120 },
      ],
    },
  ],

  'Aligarh': [
    {
      block: 'Khair',
      blockHi: 'खैर',
      district: 'Aligarh',
      zone: 'Doab',
      lat: 27.940,
      lng: 77.840,
      primaryCrop: 'Wheat',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Tappal', nameHi: 'टप्पल', lat: 28.020, lng: 77.620 },
        { name: 'Chandaus', nameHi: 'चंडौस', lat: 28.080, lng: 77.780 },
        { name: 'Atrauli Rural', nameHi: 'अतरौली देहात', lat: 28.030, lng: 78.300 },
        { name: 'Iglas', nameHi: 'इगलास', lat: 27.710, lng: 77.930 },
      ],
    },
  ],

  'Banda': [
    {
      block: 'Baberu',
      blockHi: 'बबेरू',
      district: 'Banda',
      zone: 'Bundelkhand',
      lat: 25.550,
      lng: 80.600,
      primaryCrop: 'Pulses',
      soilType: 'Bundelkhand Mixed',
      keyVillages: [
        { name: 'Bisanda', nameHi: 'बिसंडा', lat: 25.460, lng: 80.520 },
        { name: 'Naraini', nameHi: 'नरैनी', lat: 25.190, lng: 80.480 },
        { name: 'Atarra', nameHi: 'अतर्रा', lat: 25.280, lng: 80.570 },
        { name: 'Tindwari', nameHi: 'तिंदवारी', lat: 25.620, lng: 80.430 },
      ],
    },
  ],

  'Sitapur': [
    {
      block: 'Mahmoodabad',
      blockHi: 'महमूदाबाद',
      district: 'Sitapur',
      zone: 'Awadh',
      lat: 27.290,
      lng: 81.120,
      primaryCrop: 'Sugarcane',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Sidhauli', nameHi: 'सिधौली देहात', lat: 27.280, lng: 80.830 },
        { name: 'Biswan', nameHi: 'बिसवां', lat: 27.490, lng: 81.000 },
        { name: 'Laharpur', nameHi: 'लहरपुर', lat: 27.710, lng: 80.900 },
        { name: 'Misrikh', nameHi: 'मिश्रिख', lat: 27.430, lng: 80.520 },
      ],
    },
  ],

  'Mirzapur': [
    {
      block: 'Chunar',
      blockHi: 'चुनार',
      district: 'Mirzapur',
      zone: 'Purvanchal',
      lat: 25.120,
      lng: 82.880,
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: 'Narayanpur', nameHi: 'नारायणपुर', lat: 25.180, lng: 82.950 },
        { name: 'Jamalpur', nameHi: 'जमालपुर', lat: 25.040, lng: 82.990 },
        { name: 'Lalganj', nameHi: 'लालगंज विंध्य', lat: 25.020, lng: 82.350 },
        { name: 'Halia', nameHi: 'हलिया', lat: 24.840, lng: 82.320 },
      ],
    },
  ],
};

// Helper: Generates a complete list of blocks and villages for any UP district
export function getUPBlocksForDistrict(districtName: string): UPBlockInfo[] {
  if (UP_DISTRICTS_AND_BLOCKS[districtName]) {
    return UP_DISTRICTS_AND_BLOCKS[districtName];
  }

  // Sensible agricultural defaults for remaining UP districts
  const baseLat = 26.8 + (districtName.charCodeAt(0) % 10) * 0.15;
  const baseLng = 81.0 + (districtName.charCodeAt(1) % 10) * 0.25;

  return [
    {
      block: `${districtName} Sadar`,
      blockHi: `${districtName} सदर`,
      district: districtName,
      zone: 'Awadh',
      lat: Number(baseLat.toFixed(3)),
      lng: Number(baseLng.toFixed(3)),
      primaryCrop: 'Paddy',
      soilType: 'Alluvial',
      keyVillages: [
        { name: `${districtName} Dehat`, nameHi: `${districtName} देहात`, lat: baseLat + 0.02, lng: baseLng + 0.02 },
        { name: `${districtName} Krishi Kshetra`, nameHi: `${districtName} कृषि क्षेत्र`, lat: baseLat - 0.03, lng: baseLng - 0.02 },
        { name: `Kalyanpur`, nameHi: `कल्याणपुर`, lat: baseLat + 0.04, lng: baseLng - 0.03 },
        { name: `Rampur`, nameHi: `रामपुर`, lat: baseLat - 0.02, lng: baseLng + 0.04 },
      ],
    },
    {
      block: `${districtName} North`,
      blockHi: `${districtName} उत्तर`,
      district: districtName,
      zone: 'Awadh',
      lat: Number((baseLat + 0.12).toFixed(3)),
      lng: Number((baseLng + 0.05).toFixed(3)),
      primaryCrop: 'Wheat',
      soilType: 'Sandy Loam',
      keyVillages: [
        { name: `Belwa`, nameHi: `बेलवा`, lat: baseLat + 0.14, lng: baseLng + 0.06 },
        { name: `Dariyapur`, nameHi: `दरियापुर`, lat: baseLat + 0.11, lng: baseLng + 0.04 },
      ],
    },
    {
      block: `${districtName} South`,
      blockHi: `${districtName} दक्षिण`,
      district: districtName,
      zone: 'Awadh',
      lat: Number((baseLat - 0.12).toFixed(3)),
      lng: Number((baseLng - 0.05).toFixed(3)),
      primaryCrop: 'Paddy',
      soilType: 'Clay Loam',
      keyVillages: [
        { name: `Mohammadpur`, nameHi: `मोहम्मदपुर`, lat: baseLat - 0.14, lng: baseLng - 0.06 },
        { name: `Govindpur`, nameHi: `गोविंदपुर`, lat: baseLat - 0.11, lng: baseLng - 0.04 },
      ],
    },
  ];
}
