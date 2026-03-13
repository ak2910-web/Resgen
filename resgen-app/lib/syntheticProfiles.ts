import type { SyntheticProfile, Gender, EducationLevel } from "./types";

/**
 * A diverse set of 50 synthetic user profiles for use in form testing.
 * All names, emails, and details are fictional.
 */
export const SYNTHETIC_PROFILES: SyntheticProfile[] = [
  // ---- South Asian -------------------------------------------------------
  { id: 1,  name: "Rahul Sharma",     age: 22, email: "rahul.sharma@test.com",     gender: "male",       occupation: "Student",              education: "Undergraduate",  location: "Mumbai, India" },
  { id: 2,  name: "Anita Patel",      age: 27, email: "anita.patel@test.com",      gender: "female",     occupation: "Software Engineer",     education: "Graduate",       location: "Bangalore, India" },
  { id: 3,  name: "Karan Mehta",      age: 31, email: "karan.mehta@test.com",      gender: "male",       occupation: "Product Manager",       education: "Postgraduate",   location: "Delhi, India" },
  { id: 4,  name: "Priya Nair",       age: 24, email: "priya.nair@test.com",       gender: "female",     occupation: "Designer",              education: "Undergraduate",  location: "Chennai, India" },
  { id: 5,  name: "Arjun Singh",      age: 35, email: "arjun.singh@test.com",      gender: "male",       occupation: "Data Analyst",          education: "Graduate",       location: "Hyderabad, India" },
  { id: 6,  name: "Sunita Rao",       age: 29, email: "sunita.rao@test.com",       gender: "female",     occupation: "Teacher",               education: "Graduate",       location: "Pune, India" },
  { id: 7,  name: "Vikram Joshi",     age: 41, email: "vikram.joshi@test.com",     gender: "male",       occupation: "Business Owner",        education: "Undergraduate",  location: "Ahmedabad, India" },
  { id: 8,  name: "Meera Iyer",       age: 26, email: "meera.iyer@test.com",       gender: "female",     occupation: "Content Writer",        education: "Graduate",       location: "Kochi, India" },

  // ---- East Asian ---------------------------------------------------------
  { id: 9,  name: "Wei Zhang",        age: 28, email: "wei.zhang@test.com",        gender: "male",       occupation: "Software Engineer",     education: "Graduate",       location: "Beijing, China" },
  { id: 10, name: "Li Mei",           age: 23, email: "li.mei@test.com",           gender: "female",     occupation: "Student",               education: "Undergraduate",  location: "Shanghai, China" },
  { id: 11, name: "Yuki Tanaka",      age: 32, email: "yuki.tanaka@test.com",      gender: "female",     occupation: "Marketing Manager",     education: "Graduate",       location: "Tokyo, Japan" },
  { id: 12, name: "Kenji Watanabe",   age: 37, email: "kenji.watanabe@test.com",   gender: "male",       occupation: "Engineer",              education: "Graduate",       location: "Osaka, Japan" },
  { id: 13, name: "Min-jun Lee",      age: 25, email: "minjun.lee@test.com",       gender: "male",       occupation: "Game Developer",        education: "Undergraduate",  location: "Seoul, South Korea" },
  { id: 14, name: "Soo-yeon Kim",     age: 30, email: "sooyeon.kim@test.com",      gender: "female",     occupation: "Nurse",                 education: "Graduate",       location: "Busan, South Korea" },

  // ---- Western Europe / North America ------------------------------------
  { id: 15, name: "Alex Johnson",     age: 21, email: "alex.johnson@test.com",     gender: "non-binary", occupation: "Student",               education: "Undergraduate",  location: "London, UK" },
  { id: 16, name: "Emma Williams",    age: 34, email: "emma.williams@test.com",    gender: "female",     occupation: "Researcher",            education: "Postgraduate",   location: "Manchester, UK" },
  { id: 17, name: "James Brown",      age: 45, email: "james.brown@test.com",      gender: "male",       occupation: "Project Manager",       education: "Undergraduate",  location: "Birmingham, UK" },
  { id: 18, name: "Sophie Martin",    age: 29, email: "sophie.martin@test.com",    gender: "female",     occupation: "Graphic Designer",      education: "Graduate",       location: "Paris, France" },
  { id: 19, name: "Luca Rossi",       age: 33, email: "luca.rossi@test.com",       gender: "male",       occupation: "Architect",             education: "Graduate",       location: "Milan, Italy" },
  { id: 20, name: "Mia Schmidt",      age: 26, email: "mia.schmidt@test.com",      gender: "female",     occupation: "Data Scientist",        education: "Postgraduate",   location: "Berlin, Germany" },
  { id: 21, name: "Noah Anderson",    age: 19, email: "noah.anderson@test.com",    gender: "male",       occupation: "Student",               education: "High School",    location: "New York, USA" },
  { id: 22, name: "Olivia Davis",     age: 38, email: "olivia.davis@test.com",     gender: "female",     occupation: "HR Manager",            education: "Graduate",       location: "Chicago, USA" },
  { id: 23, name: "Ethan Wilson",     age: 43, email: "ethan.wilson@test.com",     gender: "male",       occupation: "Financial Analyst",     education: "Graduate",       location: "San Francisco, USA" },
  { id: 24, name: "Ava Martinez",     age: 27, email: "ava.martinez@test.com",     gender: "female",     occupation: "UX Designer",           education: "Undergraduate",  location: "Los Angeles, USA" },
  { id: 25, name: "Mason Taylor",     age: 31, email: "mason.taylor@test.com",     gender: "male",       occupation: "DevOps Engineer",       education: "Graduate",       location: "Seattle, USA" },
  { id: 26, name: "Isabella Moore",   age: 22, email: "isabella.moore@test.com",   gender: "female",     occupation: "Student",               education: "Undergraduate",  location: "Boston, USA" },
  { id: 27, name: "Lucas Thompson",   age: 36, email: "lucas.thompson@test.com",   gender: "male",       occupation: "Marketing Specialist",  education: "Graduate",       location: "Toronto, Canada" },
  { id: 28, name: "Amelia Garcia",    age: 24, email: "amelia.garcia@test.com",    gender: "female",     occupation: "Pharmacist",            education: "Postgraduate",   location: "Vancouver, Canada" },

  // ---- Latin America -----------------------------------------------------
  { id: 29, name: "Mateo Rodriguez",  age: 30, email: "mateo.rodriguez@test.com",  gender: "male",       occupation: "Journalist",            education: "Graduate",       location: "Mexico City, Mexico" },
  { id: 30, name: "Valentina López",  age: 25, email: "valentina.lopez@test.com",  gender: "female",     occupation: "Social Worker",         education: "Graduate",       location: "Bogotá, Colombia" },
  { id: 31, name: "Diego Hernández",  age: 28, email: "diego.hernandez@test.com",  gender: "male",       occupation: "Civil Engineer",        education: "Graduate",       location: "Buenos Aires, Argentina" },
  { id: 32, name: "Camila Pereira",   age: 23, email: "camila.pereira@test.com",   gender: "female",     occupation: "Student",               education: "Undergraduate",  location: "São Paulo, Brazil" },

  // ---- Africa & Middle East ----------------------------------------------
  { id: 33, name: "Amara Okafor",     age: 26, email: "amara.okafor@test.com",     gender: "female",     occupation: "Software Developer",    education: "Graduate",       location: "Lagos, Nigeria" },
  { id: 34, name: "Kwame Mensah",     age: 32, email: "kwame.mensah@test.com",     gender: "male",       occupation: "Economist",             education: "Postgraduate",   location: "Accra, Ghana" },
  { id: 35, name: "Fatima Al-Rashid", age: 29, email: "fatima.alrashid@test.com",  gender: "female",     occupation: "Doctor",                education: "Postgraduate",   location: "Dubai, UAE" },
  { id: 36, name: "Omar Hassan",      age: 34, email: "omar.hassan@test.com",      gender: "male",       occupation: "Business Analyst",      education: "Graduate",       location: "Cairo, Egypt" },
  { id: 37, name: "Zainab Musa",      age: 21, email: "zainab.musa@test.com",      gender: "female",     occupation: "Student",               education: "Undergraduate",  location: "Abuja, Nigeria" },

  // ---- Southeast Asia & Oceania -----------------------------------------
  { id: 38, name: "Aditya Wibowo",    age: 27, email: "aditya.wibowo@test.com",    gender: "male",       occupation: "Mobile Developer",      education: "Graduate",       location: "Jakarta, Indonesia" },
  { id: 39, name: "Siti Rahayu",      age: 24, email: "siti.rahayu@test.com",      gender: "female",     occupation: "Teacher",               education: "Graduate",       location: "Kuala Lumpur, Malaysia" },
  { id: 40, name: "Nguyen Van An",    age: 30, email: "nguyen.vanan@test.com",     gender: "male",       occupation: "Accountant",            education: "Graduate",       location: "Ho Chi Minh City, Vietnam" },
  { id: 41, name: "María Santos",     age: 26, email: "maria.santos@test.com",     gender: "female",     occupation: "Nurse",                 education: "Graduate",       location: "Manila, Philippines" },
  { id: 42, name: "Liam O'Brien",     age: 35, email: "liam.obrien@test.com",      gender: "male",       occupation: "Consultant",            education: "Postgraduate",   location: "Sydney, Australia" },
  { id: 43, name: "Chloe Davis",      age: 28, email: "chloe.davis@test.com",      gender: "female",     occupation: "Environmental Scientist",education: "Graduate",       location: "Melbourne, Australia" },

  // ---- Mixed / additional profiles ---------------------------------------
  { id: 44, name: "Jordan Blake",     age: 33, email: "jordan.blake@test.com",     gender: "non-binary", occupation: "Freelance Developer",   education: "Undergraduate",  location: "Amsterdam, Netherlands" },
  { id: 45, name: "Taylor Chen",      age: 20, email: "taylor.chen@test.com",      gender: "non-binary", occupation: "Student",               education: "Undergraduate",  location: "Singapore" },
  { id: 46, name: "River Okonkwo",    age: 29, email: "river.okonkwo@test.com",    gender: "non-binary", occupation: "Artist",                education: "Graduate",       location: "London, UK" },
  { id: 47, name: "Dmitri Volkov",    age: 38, email: "dmitri.volkov@test.com",    gender: "male",       occupation: "System Architect",      education: "Postgraduate",   location: "Moscow, Russia" },
  { id: 48, name: "Ingrid Larsen",    age: 31, email: "ingrid.larsen@test.com",    gender: "female",     occupation: "UX Researcher",         education: "Graduate",       location: "Oslo, Norway" },
  { id: 49, name: "Carlos Ferreira",  age: 44, email: "carlos.ferreira@test.com",  gender: "male",       occupation: "Operations Manager",    education: "Graduate",       location: "Lisbon, Portugal" },
  { id: 50, name: "Aisha Ndiaye",     age: 25, email: "aisha.ndiaye@test.com",     gender: "female",     occupation: "Journalist",            education: "Graduate",       location: "Dakar, Senegal" },
];

/**
 * Returns a random subset of profiles (or all of them if count >= 50).
 */
export function getProfileSubset(count: number): SyntheticProfile[] {
  if (count >= SYNTHETIC_PROFILES.length) return [...SYNTHETIC_PROFILES];
  const shuffled = [...SYNTHETIC_PROFILES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Returns the profile at the given index, cycling through the list.
 */
export function getProfile(index: number): SyntheticProfile {
  return SYNTHETIC_PROFILES[index % SYNTHETIC_PROFILES.length];
}

// Re-export types used by other modules
export type { Gender, EducationLevel };
