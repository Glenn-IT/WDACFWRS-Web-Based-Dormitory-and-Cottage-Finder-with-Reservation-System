/* ============================================================
   CSU-Piat Dormitory & Cottage Finder — Mock Data Layer
   Simulates a backend using localStorage. All CRUD operations
   in this prototype read/write through the functions below.
   ============================================================ */

const DB = {
  KEYS: {
    USERS: "wdac_users",
    ADMINS: "wdac_admins",
    DORMS: "wdac_dorms",
    COTTAGES: "wdac_cottages",
    RESERVATIONS: "wdac_reservations",
    PAYMENTS: "wdac_payments",
    NOTIFICATIONS: "wdac_notifications",
    SESSION: "wdac_session",
    SEEDED: "wdac_seeded_v1",
  },

  read(key, fallback = []) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  nextId(list, prefix = "") {
    const max = list.reduce((m, item) => {
      const n = parseInt(String(item.id).replace(/\D/g, "")) || 0;
      return Math.max(m, n);
    }, 0);
    const n = max + 1;
    return prefix ? `${prefix}-${String(n).padStart(4, "0")}` : n;
  },
};

/* ---------------- Seed helpers ---------------- */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function formatDate(d) {
  return d.toISOString().slice(0, 10);
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

const FIRST_NAMES = ["Juan","Maria","Jose","Ana","Pedro","Liza","Mark","Carla","Paulo","Grace","Ramil","Cherry","Noel","Divina","Ricky","Fe","Jayson","Lorna","Allan","Rowena","Michael","Josefina","Renz","Angel","Kevin","Marites","Bryan","Jenny","Danilo","Precious","Edwin","Melody","Arnel","Shiela","Rodel","Vilma","Christian","Joan","Ferdinand","Loida","Rey","Corazon","Vincent","Analyn","Jomar","Rosalinda","Gilbert","Emily","Nathaniel","Girlie"];
const LAST_NAMES = ["Santos","Reyes","Cruz","Bautista","Ocampo","Garcia","Torres","Ramos","Mendoza","Villanueva","Aquino","Del Rosario","Gonzales","Fernandez","Pascual","Castillo","Navarro","Domingo","Salazar","Marquez"];
const COURSES = ["BS Information Technology","BS Agriculture","BS Education","BS Criminology","BS Business Administration","BS Hospitality Management","BS Fisheries"];
const YEAR_LEVELS = ["1st Year","2nd Year","3rd Year","4th Year"];
const SEMESTERS = ["1st Semester","2nd Semester"];
const OCCUPATIONS = ["Farmer","Teacher","Vendor","OFW","Driver","Fisherman","Government Employee","Businessman","Housewife"];
const EDUC_ATTAIN = ["Elementary Graduate","High School Graduate","College Graduate","Vocational Graduate","Undergraduate"];

function randomName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function seedDormitories() {
  const dorms = [];
  for (let i = 1; i <= 20; i++) {
    const gender = i <= 10 ? "Male" : "Female";
    dorms.push({
      id: `DR-${String(i).padStart(3, "0")}`,
      roomNumber: `${gender === "Male" ? "M" : "F"}-${100 + i}`,
      gender,
      capacity: pick([2, 4, 6, 8]),
      price: pick([1200, 1500, 1800, 2000, 2500]),
      status: pick(["Available", "Available", "Available", "Occupied", "Full"]),
      description: `Comfortable ${gender.toLowerCase()} dormitory room with study area, ventilation, and shared restroom facilities. Ideal for CSU-Piat students.`,
      image: `https://placehold.co/400x260/2563eb/ffffff?text=Room+${100 + i}`,
    });
  }
  DB.write(DB.KEYS.DORMS, dorms);
  return dorms;
}

function seedCottages() {
  const cottages = [];
  const ownerPool = Array.from({ length: 10 }, () => randomName());
  for (let i = 1; i <= 10; i++) {
    cottages.push({
      id: `CT-${String(i).padStart(3, "0")}`,
      owner: ownerPool[i - 1],
      name: `Piat Riverside Cottage ${i}`,
      rooms: randInt(2, 6),
      price: pick([800, 1000, 1500, 2000, 2500]),
      availability: pick(["Available", "Available", "Booked"]),
      description: "Cozy cottage getaway near the Piat riverside, perfect for family gatherings and student outings. Includes basic furnishings and cooking area.",
      image: `https://placehold.co/400x260/16a34a/ffffff?text=Cottage+${i}`,
    });
  }
  DB.write(DB.KEYS.COTTAGES, cottages);
  return cottages;
}

function seedStudents() {
  const users = [];
  for (let i = 1; i <= 50; i++) {
    const fullName = randomName();
    const [firstName, ...rest] = fullName.split(" ");
    users.push({
      id: `STU-${String(i).padStart(4, "0")}`,
      firstName,
      lastName: rest.join(" "),
      email: `${firstName.toLowerCase()}.${rest.join("").toLowerCase()}${i}@csupiat.edu.ph`,
      password: "password123",
      securityQuestion: "What is your mother's maiden name?",
      securityAnswer: pick(LAST_NAMES),
      course: pick(COURSES),
      yearLevel: pick(YEAR_LEVELS),
      semester: pick(SEMESTERS),
      nationality: "Filipino",
      address: "Piat, Cagayan, Philippines",
      birthday: formatDate(new Date(randInt(1999, 2006), randInt(0, 11), randInt(1, 28))),
      phone: `09${randInt(100000000, 999999999)}`,
      profilePic: `https://placehold.co/200x200/94a3b8/ffffff?text=${firstName[0]}${(rest[0] || "")[0] || ""}`,
      status: pick(["Active", "Active", "Active", "Inactive"]),
      dateRegistered: daysAgo(randInt(5, 200)),
    });
  }
  DB.write(DB.KEYS.USERS, users);
  return users;
}

function seedAdmins() {
  const admins = [
    {
      id: "ADM-0001",
      name: "System Administrator",
      email: "admin@csupiat.edu.ph",
      password: "admin123",
      securityQuestion: "What is your mother's maiden name?",
      securityAnswer: "Reyes",
      role: "Administrator",
    },
  ];
  DB.write(DB.KEYS.ADMINS, admins);
  return admins;
}

function seedReservations(users, dorms, cottages) {
  const reservations = [];
  const paymentMethods = ["GCash", "Maya", "Bank Transfer", "Cash"];
  for (let i = 1; i <= 30; i++) {
    const isDorm = Math.random() > 0.4;
    const student = pick(users);
    const asset = isDorm ? pick(dorms) : pick(cottages);
    const amount = isDorm ? asset.price : asset.price;
    reservations.push({
      id: `RSV-${String(i).padStart(4, "0")}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      type: isDorm ? "Dormitory" : "Cottage",
      assetId: asset.id,
      assetLabel: isDorm ? `Room ${asset.roomNumber}` : asset.name,
      image: asset.image,
      paymentMethod: pick(paymentMethods),
      amount,
      reservationDate: daysAgo(randInt(1, 90)),
      paymentStatus: pick(["Paid", "Pending", "Paid"]),
      approvalStatus: pick(["Approved", "Pending", "Declined", "Approved"]),
      parentInfo: {
        fatherName: randomName(),
        motherName: randomName(),
        occupation: pick(OCCUPATIONS),
        education: pick(EDUC_ATTAIN),
        address: "Piat, Cagayan, Philippines",
        phone: `09${randInt(100000000, 999999999)}`,
        emergencyContact: randomName(),
        relationship: pick(["Father", "Mother", "Sibling", "Guardian"]),
        emergencyNumber: `09${randInt(100000000, 999999999)}`,
      },
      studentBackground: {
        appliances: pick(["Fan, Rice Cooker", "Laptop, Phone Charger", "None", "Electric Kettle"]),
        friendsAtDorm: pick(["Yes", "No"]),
        relationship: pick(["Classmate", "Cousin", "Barkada", "N/A"]),
        reason: pick(["Far from home", "Near school", "Better focus for studies", "Family request"]),
        medicalConditions: pick(["None", "Asthma", "Allergies"]),
        severeIllness: "None",
        hobbies: pick(["Reading", "Basketball", "Music", "Gaming", "Cooking"]),
        smoking: pick(["No", "No", "Yes"]),
        drinking: pick(["No", "Occasionally"]),
        organizations: pick(["Student Council", "None", "Youth Ministry", "CS Society"]),
        leisure: pick(["Watching movies", "Sports", "Sleeping", "Hanging out with friends"]),
      },
    });
  }
  DB.write(DB.KEYS.RESERVATIONS, reservations);

  const payments = reservations.map((r, idx) => ({
    id: `PAY-${String(idx + 1).padStart(4, "0")}`,
    reservationId: r.id,
    method: r.paymentMethod,
    amount: r.amount,
    status: r.paymentStatus,
    date: r.reservationDate,
  }));
  DB.write(DB.KEYS.PAYMENTS, payments);

  return reservations;
}

function seedNotifications(users) {
  const notes = [];
  const templates = [
    "Your reservation has been approved.",
    "Payment received, thank you!",
    "Your reservation is pending review.",
    "Reminder: Please settle your remaining balance.",
    "Welcome to CSU-Piat Dormitory & Cottage Finder!",
  ];
  users.slice(0, 15).forEach((u, i) => {
    notes.push({
      id: `NTF-${String(i + 1).padStart(4, "0")}`,
      studentId: u.id,
      message: pick(templates),
      date: daysAgo(randInt(0, 10)),
      read: Math.random() > 0.5,
    });
  });
  DB.write(DB.KEYS.NOTIFICATIONS, notes);
  return notes;
}

function seedAll(force = false) {
  if (!force && localStorage.getItem(DB.KEYS.SEEDED)) return;
  const dorms = seedDormitories();
  const cottages = seedCottages();
  const users = seedStudents();
  seedAdmins();
  seedReservations(users, dorms, cottages);
  seedNotifications(users);
  localStorage.setItem(DB.KEYS.SEEDED, "true");
}

seedAll();

/* ---------------- Public data API ---------------- */

const DataAPI = {
  getDorms: () => DB.read(DB.KEYS.DORMS),
  saveDorms: (list) => DB.write(DB.KEYS.DORMS, list),

  getCottages: () => DB.read(DB.KEYS.COTTAGES),
  saveCottages: (list) => DB.write(DB.KEYS.COTTAGES, list),

  getUsers: () => DB.read(DB.KEYS.USERS),
  saveUsers: (list) => DB.write(DB.KEYS.USERS, list),

  getAdmins: () => DB.read(DB.KEYS.ADMINS),
  saveAdmins: (list) => DB.write(DB.KEYS.ADMINS, list),

  getReservations: () => DB.read(DB.KEYS.RESERVATIONS),
  saveReservations: (list) => DB.write(DB.KEYS.RESERVATIONS, list),

  getPayments: () => DB.read(DB.KEYS.PAYMENTS),
  savePayments: (list) => DB.write(DB.KEYS.PAYMENTS, list),

  getNotifications: () => DB.read(DB.KEYS.NOTIFICATIONS),
  saveNotifications: (list) => DB.write(DB.KEYS.NOTIFICATIONS, list),

  resetAll: () => seedAll(true),
};
