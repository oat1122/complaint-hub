import Link from "next/link";
import { Metadata } from "next";
import TrackingForm from "@/components/complaint/tracking-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ระบบติดตามคำร้องเรียน | Complaint Tracking",
  description: "ตรวจสอบสถานะของคำร้องเรียนแบบไม่ระบุตัวตน",
};

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="bg-primary-500 text-white p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
                <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
              </svg>
            </span>
            <h1 className="text-2xl font-bold text-black">Complaint Hub</h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/" passHref>
              <Button variant="outline" className="rounded-full">
                <svg
                  className="w-4 h-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                ส่งคำร้องเรียน
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button className="rounded-full bg-black hover:bg-gray-800 text-white">
                <svg
                  className="w-4 h-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                เข้าสู่ระบบ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 bg-white p-8 rounded-2xl shadow-lg border border-blue-100 text-center">
          <div className="inline-flex p-3 mb-4 rounded-full bg-primary-100">
            <svg
              className="w-6 h-6 text-primary-600"
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 2v4"></path>
              <path d="M14 2v4"></path>
              <path d="M8 10h7"></path>
              <path d="M8 14h7"></path>
              <path d="M8 18h7"></path>
              <rect width="16" height="18" x="4" y="4" rx="2"></rect>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
            ระบบติดตามคำร้องเรียน
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            กรุณากรอกหมายเลขติดตามเพื่อตรวจสอบสถานะของคำร้องเรียนของคุณ 
            หมายเลขติดตามจะถูกสร้างขึ้นเมื่อคุณส่งคำร้องเรียน
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
          <TrackingForm />
        </div>
      </main>
    </div>
  );
}
