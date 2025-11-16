import { db } from "../firebase";
import { collection, setDoc, doc, getDocs, getDoc } from "firebase/firestore";
const events = [
  {
    id: "1",
    name: "Basketball Championship",
    date: "Nov 15, 2025",
    location: "Prishtina Arena",
    price: 15,
    image: "https://reporteri.net/wp-content/uploads/2020/03/ttt-4.png",
    attendees: 3500,
    organized_by: "Kosovo Basketball Federation",
    duration: "3 hours",
    description: "Get ready for an electrifying night of sports...",
    quantity: 4000,
    sold: 0
  },
  {
    id: "2",
    name: "Rock Festival",
    date: "Dec 5, 2025",
    location: "Skanderbeg Square",
    price: 25,
    image: "https://sunnyhillfestival.com/wp-content/uploads/2025/07/293A2696-scaled.jpg",
    status: "Sales end soon",
    attendees: 12000,
    organized_by: "Tirana Live Events",
    duration: "2 days",
    description: "Turn up the volume for the ultimate Rock Festival...",
    quantity: 15000,
    sold: 0
  },
  {
    id: "3",
    name: "Jazz Night",
    date: "Jan 10, 2026",
    location: "Peja Cultural Hall",
    price: 20,
    image: "https://www.nojazzfest.com/wp-content/uploads/2020/01/culture-1.jpg",
    status: "Now open",
    attendees: 600,
    organized_by: "Peja Cultural Association",
    duration: "3 hours",
    description: "Relax and unwind at Jazz Night...",
    quantity: 800,
    sold: 0
  },
  {
    id: "4",
    name: "Folk Music Festival",
    date: "Dec 18, 2025",
    location: "Tirana Amphitheatre",
    price: 10,
    image: "https://albania.al/wp-content/uploads/2019/08/folk1.jpg",
    status: "Limited tickets",
    attendees: 2500,
    organized_by: "Albanian Cultural Heritage Center",
    duration: "1 day",
    description: "Celebrate tradition and culture...",
    quantity: 3000,
    sold: 0
  },
  {
    id: "5",
    name: "Tech Expo",
    date: "Jan 22, 2026",
    location: "Prishtina Convention Center",
    price: 30,
    image: "https://www.technologyrecord.com/Portals/0/EasyDNNnews/4826/SRTE2024_web.jpg",
    status: "Now open",
    attendees: 5000,
    organized_by: "Tech Innovations Kosovo",
    duration: "3 days",
    description: "The future is now! Tech Expo showcases...",
    quantity: 6000,
    sold: 0
  },
  {
    id: "6",
    name: "Wine & Food Fair",
    date: "Feb 14, 2026",
    location: "Shkodër City Square",
    price: 12,
    image: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F367734419%2F194011791043%2F1%2Foriginal.20211201-153705?w=600&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C77%2C900%2C450&s=0affcfd8f0317c15056b4136a2f75d83",
    status: "Sales end soon",
    attendees: 3200,
    organized_by: "Taste of Shkodër",
    duration: "2 days",
    description: "Embark on a culinary journey...",
    quantity: 4000,
    sold: 0
  },
  {
    id: "7",
    name: "Classical Music Concert",
    date: "Mar 5, 2026",
    location: "National Theatre of Kosovo",
    price: 18,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/The_philharmonic_orchestra_of_Kosovo.JPG/1280px-The_philharmonic_orchestra_of_Kosovo.JPG",
    status: "Few seats left",
    attendees: 850,
    organized_by: "Kosovo Philharmonic Orchestra",
    duration: "2 hours",
    description: "Experience an evening of pure musical elegance...",
    quantity: 900,
    sold: 0
  },
  {
    id: "8",
    name: "Street Art Festival",
    date: "Apr 10, 2026",
    location: "Tirana Downtown",
    price: 8,
    image: "https://imgproxy.urbaneez.art/insecure/rs:fit:1500:0/plain/https://urbaneez-dev.s3.eu-central-1.amazonaws.com/Wynwood%20Walls%20Miami%20Entrance.jpg",
    status: "Now open",
    attendees: 4000,
    organized_by: "Urban Culture Albania",
    duration: "3 days",
    description: "Watch the city come alive with color...",
    quantity: 5000,
    sold: 0
  },
  {
    id: "9",
    name: "Marathon Run",
    date: "May 2, 2026",
    location: "Prishtina City Center",
    price: 20,
    image: "https://images.ahotu.com/dbdfqrc3vcf4m63tcpfzucrbjov6?w=1920&q=75&f=webp",
    status: "Registration open",
    attendees: 7500,
    organized_by: "Prishtina Sports Association",
    duration: "1 day",
    description: "Challenge yourself and feel the energy...",
    quantity: 10000,
    sold: 0
  }
];
export default async function seedEvents() {
  const eventsRef = collection(db, "events");

  for (const event of events) {
    // Kontrollo nëse dokumenti me ID ekziston tashmë
    const docRef = doc(db, "events", event.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Dokumenti ekziston tashmë për ID:", event.id, " - ", event.name);
      continue;
    }

    // Shto eventin pa kontroll për name dhe date, sepse ID është unik
    await setDoc(docRef, {
      ...event,
      createdAt: new Date(),
    });
    console.log("Event shtuar:", event.name, "me ID:", event.id);
  }

  console.log("Përfundoi shtimi i eventeve!");
}
